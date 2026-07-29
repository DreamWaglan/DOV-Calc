import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { unzipSync } from 'fflate'
import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: true,
  processEntities: false,
  trimValues: false,
})

const MAX_SOURCE_BYTES = 100 * 1024 * 1024
const MAX_UNCOMPRESSED_BYTES = 512 * 1024 * 1024

function bufferFromZipEntry(entry) {
  return Buffer.from(entry.buffer, entry.byteOffset, entry.byteLength)
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

async function sha256File(filePath) {
  return sha256(await readFile(filePath))
}

function getAttr(node, name) {
  return node?.[':@']?.[`@_${name}`] ?? node?.[`@_${name}`]
}

function nodeName(node) {
  return Object.keys(node).find((key) => key !== ':@' && key !== '#text')
}

function childrenOf(node, wantedName) {
  if (!node) return []
  if (Array.isArray(node)) {
    return wantedName ? node.filter((child) => nodeName(child) === wantedName) : node
  }
  const name = nodeName(node)
  const value = name ? node[name] : node
  if (!Array.isArray(value)) return []
  return wantedName
    ? value.filter((child) => nodeName(child) === wantedName)
    : value
}

function descendants(node, wantedName) {
  const matches = []
  const visit = (current) => {
    if (!current || typeof current !== 'object') return
    if (Array.isArray(current)) {
      for (const child of current) visit(child)
      return
    }
    const name = nodeName(current)
    if (name === wantedName) matches.push(current)
    for (const child of childrenOf(current)) visit(child)
  }
  visit(node)
  return matches
}

function textOf(node) {
  const parts = []
  const visit = (current) => {
    if (!current || typeof current !== 'object') return
    if (typeof current['#text'] === 'string') parts.push(current['#text'])
    const name = nodeName(current)
    if (name === 'w:tab') parts.push('\t')
    if (name === 'w:br' || name === 'w:cr') parts.push('\n')
    for (const child of childrenOf(current)) visit(child)
  }
  visit(node)
  return parts.join('').replace(/[ \t]+\n/g, '\n').trim()
}

function paragraphStyle(paragraph) {
  const pPr = descendants(paragraph, 'w:pPr')[0]
  const pStyle = descendants(pPr, 'w:pStyle')[0]
  return getAttr(pStyle, 'w:val') ?? getAttr(pStyle, 'val') ?? ''
}

function headingLevel(style) {
  const value = String(style).toLowerCase()
  const match = value.match(/(?:heading|标题)\s*(\d+)/i) ?? value.match(/^(\d)$/)
  if (!match) return null
  const level = Number(match[1])
  return Number.isInteger(level) && level >= 1 && level <= 6 ? level : null
}

function renderParagraph(paragraph) {
  const text = textOf(paragraph)
  if (!text) return null
  const level = headingLevel(paragraphStyle(paragraph))
  return level ? `${'#'.repeat(level)} ${text}` : text
}

function renderTable(table) {
  const rows = childrenOf(table, 'w:tr').map((row) =>
    childrenOf(row, 'w:tc').map((cell) => textOf(cell).replace(/\s+/g, ' ').trim()),
  )
  if (rows.length === 0) return null
  const width = Math.max(...rows.map((row) => row.length))
  const normalized = rows.map((row) =>
    Array.from({ length: width }, (_, index) => row[index] ?? ''),
  )
  const escapeCell = (value) => value.replace(/\|/g, '\\|')
  const header = normalized[0].map(escapeCell)
  const separator = Array.from({ length: width }, () => '---')
  const body = normalized.slice(1).map((row) => row.map(escapeCell))
  return [header, separator, ...body].map((row) => `| ${row.join(' | ')} |`).join('\n')
}

function parseXmlEntry(zip, name) {
  const entry = zip[name]
  if (!entry) return null
  return parser.parse(bufferFromZipEntry(entry).toString('utf8'))
}

function countInXml(zip, entryName, xmlName) {
  const xml = parseXmlEntry(zip, entryName)
  return xml ? descendants(xml, xmlName).length : 0
}

function countFootnotes(zip) {
  const xml = parseXmlEntry(zip, 'word/footnotes.xml')
  if (!xml) return { present: false, count: 0 }
  const notes = descendants(xml, 'w:footnote').filter((note) => {
    const type = getAttr(note, 'w:type') ?? getAttr(note, 'type')
    return type !== 'separator' && type !== 'continuationSeparator'
  })
  return { present: true, count: notes.length }
}

function collectBody(documentXml) {
  const documentNode = documentXml.find((node) => nodeName(node) === 'w:document')
  const body = descendants(documentNode, 'w:body')[0]
  return childrenOf(body).filter((child) => ['w:p', 'w:tbl'].includes(nodeName(child)))
}

function buildReviewItems(counts) {
  const items = []
  const add = (kind, count, message) => {
    if (count > 0) items.push({ kind, count, disposition: 'quarantined-for-manual-review', message })
  }
  add('drawings', counts.drawings, 'Drawing and floating layout content was counted but not converted into publishable Markdown.')
  add('media', counts.media, 'Embedded media files remain in the DOCX package and require permission and placement review.')
  if (counts.footnotesPresent) {
    items.push({
      kind: 'footnotes',
      count: counts.footnotes,
      disposition: 'quarantined-for-manual-review',
      message: 'Footnote part was detected and must be manually reconciled against the rendered document.',
    })
  }
  add('formulas', counts.formulas, 'Office math objects were detected and require manual conversion review.')
  add('embeddedObjects', counts.embeddedObjects, 'Embedded package or OLE objects were detected and are not imported.')
  return items
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

export async function importDocx({ sourcePath, assetId, outputDir }) {
  if (!sourcePath || !assetId || !outputDir) {
    throw new Error('importDocx requires sourcePath, assetId, and outputDir')
  }

  const absoluteSourcePath = path.resolve(sourcePath)
  const absoluteOutputDir = path.resolve(outputDir)
  const sourceBuffer = await readFile(absoluteSourcePath)
  if (sourceBuffer.length > MAX_SOURCE_BYTES) {
    throw new Error(`DOCX exceeds ${MAX_SOURCE_BYTES} byte input limit`)
  }
  const zip = unzipSync(new Uint8Array(sourceBuffer))
  const uncompressedBytes = Object.values(zip).reduce(
    (total, entry) => total + entry.byteLength,
    0,
  )
  if (uncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
    throw new Error(
      `DOCX exceeds ${MAX_UNCOMPRESSED_BYTES} byte uncompressed limit`,
    )
  }
  const documentXml = parseXmlEntry(zip, 'word/document.xml')
  if (!documentXml) throw new Error('DOCX is missing word/document.xml')

  const bodyItems = collectBody(documentXml)
  const bodyParagraphs = bodyItems.filter((item) => nodeName(item) === 'w:p')
  const mediaEntries = Object.keys(zip).filter((name) => name.startsWith('word/media/'))
  const embeddedEntries = Object.keys(zip).filter((name) => name.startsWith('word/embeddings/'))
  const footnotes = countFootnotes(zip)
  const counts = {
    paragraphs: bodyParagraphs.length,
    headings: bodyParagraphs.filter((p) => headingLevel(paragraphStyle(p))).length,
    tables: descendants(documentXml, 'w:tbl').length,
    drawings: descendants(documentXml, 'w:drawing').length,
    media: mediaEntries.length,
    footnotes: footnotes.count,
    footnotesPresent: footnotes.present,
    formulas:
      countInXml(zip, 'word/document.xml', 'm:oMath') +
      countInXml(zip, 'word/document.xml', 'm:oMathPara'),
    embeddedObjects: embeddedEntries.length + countInXml(zip, 'word/document.xml', 'o:OLEObject'),
  }
  const reviewItems = buildReviewItems(counts)

  const markdownBlocks = [
    `<!-- sourceAssetId: ${assetId}; publishable: false; permission: pending -->`,
    '',
    `# DOCX Import Review: ${path.basename(absoluteSourcePath)}`,
    '',
    '## Imported Body',
    '',
  ]
  for (const item of bodyItems) {
    const rendered = nodeName(item) === 'w:tbl' ? renderTable(item) : renderParagraph(item)
    if (rendered) markdownBlocks.push(rendered, '')
  }
  markdownBlocks.push('## Quarantine Review Items', '')
  for (const item of reviewItems) {
    markdownBlocks.push(`- ${item.kind}: ${item.count} - ${item.message}`)
  }
  if (reviewItems.length === 0) markdownBlocks.push('- none')

  const markdown = `${markdownBlocks.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`
  const quarantine = {
    schemaVersion: 1,
    assetId,
    publishable: false,
    permission: 'pending',
    reviewItems,
  }

  await mkdir(absoluteOutputDir, { recursive: true })
  const markdownPath = path.join(absoluteOutputDir, 'review.md')
  const quarantinePath = path.join(absoluteOutputDir, 'quarantine.json')
  await writeFile(markdownPath, markdown, 'utf8')
  await writeFile(quarantinePath, stableJson(quarantine), 'utf8')

  const outputs = {
    markdown: {
      path: path.relative(process.cwd(), markdownPath).split(path.sep).join('/'),
      sha256: sha256(markdown),
      bytes: Buffer.byteLength(markdown),
    },
    quarantine: {
      path: path.relative(process.cwd(), quarantinePath).split(path.sep).join('/'),
      sha256: await sha256File(quarantinePath),
      bytes: Buffer.byteLength(stableJson(quarantine)),
    },
  }
  const report = {
    schemaVersion: 1,
    assetId,
    source: {
      fileName: path.basename(absoluteSourcePath),
      sha256: sha256(sourceBuffer),
      bytes: sourceBuffer.length,
      uncompressedBytes,
    },
    permission: 'pending',
    publishable: false,
    counts,
    outputs,
    reviewItems,
  }
  const reportPath = path.join(absoluteOutputDir, 'import-report.json')
  await writeFile(reportPath, stableJson(report), 'utf8')
  report.outputs.report = {
    path: path.relative(process.cwd(), reportPath).split(path.sep).join('/'),
    sha256: await sha256File(reportPath),
    bytes: Buffer.byteLength(stableJson(report)),
  }

  return { ...report, outputDir: absoluteOutputDir, reportPath }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [sourcePath, assetId, outputDir] = process.argv.slice(2)
  if (!sourcePath || !assetId || !outputDir) {
    console.error('Usage: node scripts/content/import-docx.mjs <source-docx> <asset-id> <output-dir>')
    process.exit(2)
  }
  const result = await importDocx({ sourcePath, assetId, outputDir })
  console.log(
    `DOCX imported: ${result.outputs.markdown.path} (${result.counts.paragraphs} paragraphs, ${result.counts.tables} tables).`,
  )
}

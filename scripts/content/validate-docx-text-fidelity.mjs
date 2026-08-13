import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { unzipSync } from 'fflate'
import MarkdownIt from 'markdown-it'
import { collectBody, parseWordprocessingXml } from './import-docx.mjs'
import { loadPages, printResult, writeReport } from './lib/content-utils.mjs'

const ledgerPath = 'content/governance/source-assets.json'
const corpusReportPath = 'content/reports/docx-import.json'
const fullContentMapPath = 'content/migrations/full-content-map.json'
const failures = []
const markdownIt = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
})

const BODY_ELEMENT_TYPES = new Set(['heading', 'paragraph', 'table'])
const SOURCE_BODY_MARKER =
  /^<!-- source-body:(\d+):(src-[a-f0-9]{12}:[^:]+:[^:]+):(paragraph|table) -->$/
const ARTICLE_PARAGRAPH_MARKER = /^<!-- article-paragraph:(?:prose|non-prose) -->$/
const QUARANTINE_HEADING = '## Quarantine Review Items'

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

function nodeName(node) {
  return Object.keys(node).find((key) => key !== ':@' && key !== '#text')
}

function childrenOf(node) {
  if (!node) return []
  if (Array.isArray(node)) return node
  const name = nodeName(node)
  const value = name ? node[name] : node
  return Array.isArray(value) ? value : []
}

function collectWordTextNodes(node, values = []) {
  if (!node || typeof node !== 'object') return values
  if (Array.isArray(node)) {
    for (const child of node) collectWordTextNodes(child, values)
    return values
  }
  if (nodeName(node) === 'w:t') {
    for (const child of childrenOf(node)) {
      if (Object.hasOwn(child, '#text')) values.push(child['#text'])
    }
    return values
  }
  for (const child of childrenOf(node)) collectWordTextNodes(child, values)
  return values
}

function extractElementText(node) {
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

function extractRawWordText(xml) {
  return [...xml.matchAll(/<w:t(?:\s[^>]*)?>(.*?)<\/w:t>/gs)].map(
    (match) => match[1],
  )
}

function resolveSource(sourceRoot, relativePath) {
  const absoluteRoot = path.resolve(sourceRoot)
  const absolutePath = path.resolve(absoluteRoot, relativePath)
  const relative = path.relative(absoluteRoot, absolutePath)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Source path escapes the registered root: ${relativePath}`)
  }
  return absolutePath
}

function decodeHtmlEntities(value) {
  const named = new Map([
    ['amp', '&'],
    ['lt', '<'],
    ['gt', '>'],
    ['quot', '"'],
    ['apos', "'"],
    ['nbsp', ' '],
    ['emsp', ' '],
  ])
  let decoded = String(value)
  for (let pass = 0; pass < 4; pass += 1) {
    const next = decoded.replace(
      /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi,
      (match, decimal, hexadecimal, name) => {
        if (decimal) return String.fromCodePoint(Number(decimal))
        if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16))
        return named.get(String(name).toLowerCase()) ?? match
      },
    )
    if (next === decoded) break
    decoded = next
  }
  return decoded
}

function normalizeComparableText(value) {
  return decodeHtmlEntities(value).replace(/\s+/gu, '')
}

function stripHtmlMarkup(value) {
  return decodeHtmlEntities(
    String(value)
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]*>/g, ' '),
  )
}

function collectMarkdownVisibleText(tokens, parts = []) {
  for (const token of tokens) {
    if (!token) continue
    if (token.type === 'inline' && Array.isArray(token.children)) {
      collectMarkdownVisibleText(token.children, parts)
      continue
    }
    if (token.type === 'text' || token.type === 'code_inline') {
      if (token.content) parts.push(token.content)
      continue
    }
    if (token.type === 'code_block' || token.type === 'fence') {
      if (token.content) parts.push(token.content)
      continue
    }
    if (token.type === 'html_inline' || token.type === 'html_block') {
      const text = stripHtmlMarkup(token.content)
      if (text.trim()) parts.push(text)
      continue
    }
    if (token.type === 'softbreak' || token.type === 'hardbreak') parts.push(' ')
  }
  return parts
}

function markdownVisibleText(markdown, { sourceElementId, elementType }) {
  if (elementType === 'paragraph') {
    let visible = stripHtmlMarkup(markdown)
    if (sourceElementId.includes(':heading:')) {
      visible = visible.replace(/^\s{0,3}#{1,6}\s+/, '')
    }
    return normalizeComparableText(visible)
  }
  const tokens = markdownIt.parse(String(markdown), {})
  return normalizeComparableText(collectMarkdownVisibleText(tokens).join(' '))
}

function extractSourceBodyBlocks(markdown, { stopAtQuarantine = false } = {}) {
  const lines = String(markdown).replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let previousMarkerLine = -1

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const trimmed = lines[lineIndex].trim()
    if (stopAtQuarantine && trimmed === QUARANTINE_HEADING) break
    const marker = trimmed.match(SOURCE_BODY_MARKER)
    if (!marker) continue

    const bodyIndex = Number(marker[1])
    const sourceElementId = marker[2]
    const elementType = marker[3]
    const lowerBound = previousMarkerLine + 1
    let blockStart = lineIndex
    let blockEnd = lineIndex

    for (let index = lineIndex - 1; index >= lowerBound; index -= 1) {
      if (ARTICLE_PARAGRAPH_MARKER.test(lines[index].trim())) {
        blockStart = index + 1
        break
      }
    }

    if (blockStart === lineIndex && elementType === 'table') {
      const tableAttribute = `data-source-table="${sourceElementId}"`
      for (let index = lineIndex - 1; index >= lowerBound; index -= 1) {
        if (lines[index].includes(tableAttribute)) {
          blockStart = index
          break
        }
      }
      if (blockStart === lineIndex) {
        let cursor = lineIndex - 1
        while (cursor >= lowerBound && lines[cursor].trim() === '') cursor -= 1
        blockEnd = cursor + 1
        while (cursor >= lowerBound && lines[cursor].trim().startsWith('|')) {
          blockStart = cursor
          cursor -= 1
        }
      }
    }

    if (blockStart === lineIndex && elementType === 'paragraph') {
      let cursor = lineIndex - 1
      while (cursor >= lowerBound && lines[cursor].trim() === '') cursor -= 1
      blockEnd = cursor + 1
      if (sourceElementId.includes(':heading:')) {
        blockStart = Math.max(cursor, lowerBound)
      } else {
        while (cursor >= lowerBound && lines[cursor].trim() !== '') {
          blockStart = cursor
          cursor -= 1
        }
      }
    }

    if (
      previousMarkerLine === -1 &&
      blockEnd - blockStart > 1 &&
      /^#\s+/.test(lines[blockStart].trim())
    ) {
      blockStart += 1
    }

    blocks.push({
      bodyIndex,
      sourceElementId,
      elementType,
      line: lineIndex + 1,
      text: markdownVisibleText(lines.slice(blockStart, blockEnd).join('\n'), {
        sourceElementId,
        elementType,
      }),
    })
    previousMarkerLine = lineIndex
  }

  return blocks
}

function preview(value) {
  const normalized = String(value).replace(/\s+/gu, ' ').trim()
  return normalized.length <= 100 ? normalized : `${normalized.slice(0, 97)}...`
}

function compareBlocks({ label, expectedBlocks, actualBlocks, failures: localFailures }) {
  if (expectedBlocks.length !== actualBlocks.length) {
    localFailures.push(
      `${label}: expected ${expectedBlocks.length} sourced blocks, got ${actualBlocks.length}`,
    )
  }

  const limit = Math.min(expectedBlocks.length, actualBlocks.length)
  for (let index = 0; index < limit; index += 1) {
    const expected = expectedBlocks[index]
    const actual = actualBlocks[index]
    if (
      expected.bodyIndex !== actual.bodyIndex ||
      expected.sourceElementId !== actual.sourceElementId ||
      expected.elementType !== actual.elementType
    ) {
      localFailures.push(
        `${label}: source order mismatch at position ${index + 1} ` +
          `(expected ${expected.bodyIndex}:${expected.sourceElementId}:${expected.elementType}, ` +
          `got ${actual.bodyIndex}:${actual.sourceElementId}:${actual.elementType})`,
      )
      continue
    }
    if (expected.text !== actual.text) {
      localFailures.push(
        `${label}: text mismatch for ${expected.sourceElementId} ` +
          `(source=${JSON.stringify(preview(expected.text))}, output=${JSON.stringify(preview(actual.text))})`,
      )
    }
  }
}

function sourceTextBlocksForAsset({ assetId, bodyItems, bodyElements }) {
  return bodyElements
    .slice()
    .sort(
      (left, right) =>
        left.sourcePosition.bodyIndex - right.sourcePosition.bodyIndex ||
        left.sourceElementId.localeCompare(right.sourceElementId),
    )
    .map((element) => {
      const bodyItem = bodyItems[element.sourcePosition.bodyIndex - 1]
      if (!bodyItem) {
        throw new Error(
          `${assetId}: missing source body item at index ${element.sourcePosition.bodyIndex}`,
        )
      }
      return {
        bodyIndex: element.sourcePosition.bodyIndex,
        sourceElementId: element.sourceElementId,
        elementType: element.elementType === 'table' ? 'table' : 'paragraph',
        text: normalizeComparableText(extractElementText(bodyItem)),
      }
    })
}

const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'))
const corpusReport = JSON.parse(await readFile(corpusReportPath, 'utf8'))
const fullMap = JSON.parse(await readFile(fullContentMapPath, 'utf8'))
const pages = await loadPages()
const pageById = new Map(pages.map((page) => [page.frontmatter.id, page]))
const fullMapElementById = new Map(
  fullMap.elements.map((element) => [element.sourceElementId, element]),
)
const contentDocumentIds = new Set(
  fullMap.sourceSummaries.docx
    .filter((source) => source.contentDocument)
    .map((source) => source.sourceAssetId),
)
const docxAssets = ledger.assets.filter((asset) => asset.assetType === 'docx')
const reportByAssetId = new Map(
  corpusReport.assets.map((report) => [report.assetId, report]),
)
const perSource = []

if (docxAssets.length !== 13) {
  failures.push(`expected 13 registered DOCX assets, got ${docxAssets.length}`)
}

for (const asset of docxAssets) {
  const sourcePath = resolveSource(ledger.sourceRoot.path, asset.origin.path)
  if (!existsSync(sourcePath)) {
    failures.push(`${asset.id}: registered source DOCX is unavailable`)
    continue
  }

  const sourceBytes = await readFile(sourcePath)
  const sourceHash = sha256(sourceBytes)
  if (sourceHash !== asset.hashes.sha256) {
    failures.push(`${asset.id}: source SHA-256 differs from the governance ledger`)
  }

  const zip = unzipSync(new Uint8Array(sourceBytes))
  const documentEntry = zip['word/document.xml']
  if (!documentEntry) {
    failures.push(`${asset.id}: word/document.xml is missing`)
    continue
  }

  const documentXml = Buffer.from(documentEntry).toString('utf8')
  const rawTextNodes = extractRawWordText(documentXml)
  const parsedDocument = parseWordprocessingXml(documentXml)
  const parsedTextNodes = collectWordTextNodes(parsedDocument)
  const nonStringTextNodes = parsedTextNodes.filter(
    (value) => typeof value !== 'string',
  )
  if (nonStringTextNodes.length > 0) {
    failures.push(
      `${asset.id}: ${nonStringTextNodes.length} w:t nodes were coerced away from strings`,
    )
  }
  if (JSON.stringify(parsedTextNodes) !== JSON.stringify(rawTextNodes)) {
    const firstDifference = rawTextNodes.findIndex(
      (value, index) => value !== parsedTextNodes[index],
    )
    failures.push(
      `${asset.id}: parsed w:t sequence differs from raw OOXML at index ${firstDifference} ` +
        `(raw=${JSON.stringify(rawTextNodes[firstDifference])}, parsed=${JSON.stringify(parsedTextNodes[firstDifference])})`,
    )
  }

  const importSummary = reportByAssetId.get(asset.id)
  if (!importSummary) {
    failures.push(`${asset.id}: aggregate DOCX import report entry is missing`)
    continue
  }
  if (importSummary.source?.sha256 !== asset.hashes.sha256) {
    failures.push(`${asset.id}: imported source SHA-256 differs from the ledger`)
  }

  const importReport = JSON.parse(
    await readFile(
      resolveSource(process.cwd(), importSummary.outputs.report.path),
      'utf8',
    ),
  )
  const bodyItems = collectBody(parsedDocument)
  const bodyElements = importReport.elements.filter((element) =>
    BODY_ELEMENT_TYPES.has(element.elementType),
  )
  if (bodyItems.length !== bodyElements.length) {
    failures.push(
      `${asset.id}: source body item count (${bodyItems.length}) differs from import elements (${bodyElements.length})`,
    )
  }

  const sourceBlocks = sourceTextBlocksForAsset({
    assetId: asset.id,
    bodyItems,
    bodyElements,
  })
  const sourceBlockById = new Map(
    sourceBlocks.map((block) => [block.sourceElementId, block]),
  )

  const reviewMarkdown = await readFile(
    resolveSource(process.cwd(), importSummary.outputs.markdown.path),
    'utf8',
  )
  const reviewBlocks = extractSourceBodyBlocks(reviewMarkdown, {
    stopAtQuarantine: true,
  })
  compareBlocks({
    label: `${asset.id} review output`,
    expectedBlocks: sourceBlocks,
    actualBlocks: reviewBlocks,
    failures,
  })

  const sourceBlocksByPageId = new Map()
  let publicMappedElements = 0
  let publicUnmappedTextElements = 0
  if (contentDocumentIds.has(asset.id)) {
    for (const element of bodyElements) {
      const sourceBlock = sourceBlockById.get(element.sourceElementId)
      const mappedElement = fullMapElementById.get(element.sourceElementId)
      if (!sourceBlock) {
        failures.push(`${asset.id}: missing source block for ${element.sourceElementId}`)
        continue
      }
      if (!mappedElement) {
        failures.push(`${asset.id}: full content map is missing ${element.sourceElementId}`)
        continue
      }
      const pageIds = mappedElement.targetPageIds ?? []
      if (pageIds.length === 0) {
        if (sourceBlock.text) {
          publicUnmappedTextElements += 1
          failures.push(
            `${asset.id}: non-empty source element ${element.sourceElementId} has no public target page`,
          )
        }
        continue
      }
      publicMappedElements += 1
      for (const pageId of pageIds) {
        const expected = sourceBlocksByPageId.get(pageId) ?? []
        expected.push(sourceBlock)
        sourceBlocksByPageId.set(pageId, expected)
      }
    }
  }

  let publicComparedElements = 0
  for (const [pageId, expectedBlocksUnsorted] of sourceBlocksByPageId) {
    const page = pageById.get(pageId)
    if (!page) {
      failures.push(`${asset.id}: target page is missing from docs: ${pageId}`)
      continue
    }
    const expectedBlocks = expectedBlocksUnsorted.sort(
      (left, right) =>
        left.bodyIndex - right.bodyIndex ||
        left.sourceElementId.localeCompare(right.sourceElementId),
    )
    const actualBlocks = extractSourceBodyBlocks(page.body).filter((block) =>
      block.sourceElementId.startsWith(`${asset.id}:`),
    )
    compareBlocks({
      label: `${asset.id} -> ${pageId}`,
      expectedBlocks,
      actualBlocks,
      failures,
    })
    publicComparedElements += Math.min(expectedBlocks.length, actualBlocks.length)
  }

  const numericTextNodes = rawTextNodes.filter((value) =>
    /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value),
  )
  const lexicalSensitiveTextNodes = numericTextNodes.filter(
    (value) => /^[-+]?0\d/.test(value) || /\.$/.test(value) || /\.0+$/.test(value),
  )
  perSource.push({
    sourceAssetId: asset.id,
    sourcePath: asset.origin.path,
    sourceSha256: sourceHash,
    contentDocument: contentDocumentIds.has(asset.id),
    rawTextNodes: rawTextNodes.length,
    parsedTextNodes: parsedTextNodes.length,
    numericTextNodes: numericTextNodes.length,
    lexicalSensitiveTextNodes: lexicalSensitiveTextNodes.length,
    nonStringTextNodes: nonStringTextNodes.length,
    sourceBodyElements: sourceBlocks.length,
    reviewComparedElements: Math.min(sourceBlocks.length, reviewBlocks.length),
    publicPages: sourceBlocksByPageId.size,
    publicMappedElements,
    publicComparedElements,
    publicUnmappedTextElements,
  })
}

const levelingPage = await readFile('docs/progression/leveling-strategy.md', 'utf8')
if (!levelingPage.includes('## 3.为什么是80级？')) {
  failures.push('leveling screenshot regression is missing "## 3.为什么是80级？"')
}
const levelingTable = extractSourceBodyBlocks(levelingPage).find(
  (block) =>
    block.sourceElementId === 'src-6eba63c4aa7b:table:766f6679573ff408',
)
for (const fragment of [
  '等级提升经验需求（单位：千）占满级（100级）总经验比率累积经验比率',
  '1-40850.94%0.94%',
  '50-6099811.0%13.7%',
  '90-100240026.4%100%',
]) {
  if (!levelingTable?.text.includes(normalizeComparableText(fragment))) {
    failures.push(
      `leveling screenshot regression table is missing ${JSON.stringify(fragment)}`,
    )
  }
}

const totals = perSource.reduce(
  (result, source) => ({
    rawTextNodes: result.rawTextNodes + source.rawTextNodes,
    parsedTextNodes: result.parsedTextNodes + source.parsedTextNodes,
    numericTextNodes: result.numericTextNodes + source.numericTextNodes,
    lexicalSensitiveTextNodes:
      result.lexicalSensitiveTextNodes + source.lexicalSensitiveTextNodes,
    nonStringTextNodes: result.nonStringTextNodes + source.nonStringTextNodes,
    sourceBodyElements: result.sourceBodyElements + source.sourceBodyElements,
    reviewComparedElements:
      result.reviewComparedElements + source.reviewComparedElements,
    publicPages: result.publicPages + source.publicPages,
    publicMappedElements: result.publicMappedElements + source.publicMappedElements,
    publicComparedElements:
      result.publicComparedElements + source.publicComparedElements,
    publicUnmappedTextElements:
      result.publicUnmappedTextElements + source.publicUnmappedTextElements,
  }),
  {
    rawTextNodes: 0,
    parsedTextNodes: 0,
    numericTextNodes: 0,
    lexicalSensitiveTextNodes: 0,
    nonStringTextNodes: 0,
    sourceBodyElements: 0,
    reviewComparedElements: 0,
    publicPages: 0,
    publicMappedElements: 0,
    publicComparedElements: 0,
    publicUnmappedTextElements: 0,
  },
)

const reportPath = await writeReport('docx-text-fidelity', {
  schemaVersion: 2,
  check: 'docx-source-to-public-text-fidelity',
  summary: {
    sources: perSource.length,
    contentDocuments: perSource.filter((source) => source.contentDocument).length,
    ...totals,
    failures: failures.length,
  },
  policy: {
    sourceMutation: 'forbidden; source SHA-256 must match the governance ledger',
    tagValueCoercion: 'forbidden for w:t; source lexical strings must be preserved',
    parserSequence: 'parsed w:t values must exactly match raw OOXML order and spelling',
    reviewClosure:
      'every DOCX body element must appear once and in source order in imported review Markdown',
    publicClosure:
      'every non-empty content-DOCX body element must map to a public page and match there once in source order',
    allowedStructuralTransforms: [
      'Markdown heading prefixes for source heading elements',
      'Markdown table delimiters and separator rows',
      'HTML/Vue tags and media-only comments/components',
      'page-level editorial H1 preceding the first source-backed block',
      'XML/HTML entity encoding',
      'whitespace introduced by Markdown/HTML layout',
    ],
    publicRegression:
      'the approved leveling screenshot sample and all source-backed pages must remain complete',
  },
  perSource,
  failures,
})

printResult('DOCX text fidelity validation', failures, reportPath)

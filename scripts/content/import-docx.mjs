import { createHash } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { unzipSync } from 'fflate'
import { XMLParser } from 'fast-xml-parser'
import {
  importGovernance,
  loadSourceAsset,
  stableJson,
  stablePlacementId,
  stableSourceElementId,
  stableSourceRelationId,
  tableCellMediaToken,
} from './lib/migration-elements.mjs'
import { writeFileWithRetry as writeFile } from './lib/content-utils.mjs'

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

function renderMarkdownTable(table) {
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

function htmlText(value) {
  return String(value)
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function htmlAttribute(value) {
  return htmlText(value).replaceAll('"', '&quot;')
}

function renderInlineCellContent(node, occurrenceTokenByDrawing) {
  if (!node || typeof node !== 'object') return ''
  if (Array.isArray(node)) {
    return node
      .map((child) => renderInlineCellContent(child, occurrenceTokenByDrawing))
      .join('')
  }
  const name = nodeName(node)
  if (name === 'w:drawing') return occurrenceTokenByDrawing.get(node) ?? ''
  if (name === 'w:tab') return '&emsp;'
  if (name === 'w:br' || name === 'w:cr') return '<br />'
  if (['w:pPr', 'w:rPr', 'w:tcPr'].includes(name)) return ''
  const ownText = typeof node['#text'] === 'string' ? htmlText(node['#text']) : ''
  return `${ownText}${childrenOf(node)
    .map((child) => renderInlineCellContent(child, occurrenceTokenByDrawing))
    .join('')}`
}

function renderHtmlTable(table, tableLayoutByNode, occurrenceTokenByDrawing) {
  const layout = tableLayoutByNode.get(table)
  if (!layout) throw new Error('DOCX table layout is missing during HTML rendering')

  const renderBlock = (node) => {
    const name = nodeName(node)
    if (name === 'w:p') {
      return renderInlineCellContent(node, occurrenceTokenByDrawing)
    }
    if (name === 'w:tbl') {
      return renderHtmlTable(node, tableLayoutByNode, occurrenceTokenByDrawing)
    }
    if (name === 'w:tcPr') return ''
    return childrenOf(node).map(renderBlock).filter(Boolean).join('<br />')
  }

  const rows = layout.rows.map((row, rowOffset) => {
    const tagName = rowOffset === 0 ? 'th' : 'td'
    const cells = row.cells
      .filter(
        (cell) =>
          cell.verticalMerge !== 'continue' &&
          cell.gridColumn <= layout.columnCount,
      )
      .map((cell) => {
        const attributes = [
          `data-grid-column="${cell.gridColumn}"`,
          `data-source-cell="${htmlAttribute(
            `${layout.sourceElementId}:${cell.rowIndex}:${cell.cellIndex}`,
          )}"`,
        ]
        if (cell.gridSpan > 1) attributes.push(`colspan="${cell.gridSpan}"`)
        if (cell.rowSpan > 1) attributes.push(`rowspan="${cell.rowSpan}"`)
        const blocks = childrenOf(cell.node).map(renderBlock).filter(Boolean)
        const content = blocks.length > 0 ? blocks.join('<br />') : '&nbsp;'
        return `<${tagName} ${attributes.join(' ')}>${content}</${tagName}>`
      })
      .join('')
    return `<tr>${cells}</tr>`
  })

  const header = rows.length > 0 ? `<thead>${rows[0]}</thead>` : ''
  const body = rows.length > 1 ? `<tbody>${rows.slice(1).join('')}</tbody>` : ''
  return `<div class="docx-table-scroll" data-source-table="${htmlAttribute(
    layout.sourceElementId,
  )}"><table class="docx-table">${header}${body}</table></div>`
}

function renderTable(table, tableLayoutByNode, occurrenceTokenByDrawing) {
  const hasCellMedia = descendants(table, 'w:drawing').some((drawing) =>
    occurrenceTokenByDrawing.has(drawing),
  )
  return hasCellMedia
    ? renderHtmlTable(table, tableLayoutByNode, occurrenceTokenByDrawing)
    : renderMarkdownTable(table)
}

export function parseWordprocessingXml(xml) {
  return parser.parse(xml)
}

function parseXmlEntry(zip, name) {
  const entry = zip[name]
  if (!entry) return null
  return parseWordprocessingXml(bufferFromZipEntry(entry).toString('utf8'))
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

export function collectBody(documentXml) {
  const documentNode = documentXml.find((node) => nodeName(node) === 'w:document')
  const body = descendants(documentNode, 'w:body')[0]
  return childrenOf(body).filter((child) => ['w:p', 'w:tbl'].includes(nodeName(child)))
}

function collectImageParts(zip, documentXml) {
  const parts = [{ part: 'word/document.xml', xml: documentXml, kind: 'body' }]
  for (const part of Object.keys(zip).sort()) {
    const match = part.match(/^word\/(header|footer)(\d+)\.xml$/)
    if (!match) continue
    const xml = parseXmlEntry(zip, part)
    if (!xml) continue
    parts.push({ part, xml, kind: match[1], partNumber: Number(match[2]) })
  }
  return parts
}

function drawingPlacementKind(drawing) {
  if (descendants(drawing, 'wp:anchor').length > 0) return 'float'
  if (descendants(drawing, 'wp:inline').length > 0) return 'inline'
  return 'unknown'
}

function anchorForBodyItem(item, sourceElementId, bodyIndex) {
  return {
    sourceElementId,
    bodyIndex,
    elementType: nodeName(item) === 'w:tbl' ? 'table' : 'paragraph',
    textHash: sha256(textOf(item)),
  }
}

function sourceBodyMarker(anchor) {
  if (!anchor?.sourceElementId || !Number.isInteger(anchor.bodyIndex)) return null
  return `<!-- source-body:${anchor.bodyIndex}:${anchor.sourceElementId}:${anchor.elementType} -->`
}

function positiveInteger(value, fallback = 1) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function cellMergeMetadata(cell) {
  const properties = childrenOf(cell, 'w:tcPr')[0]
  const gridSpanNode = childrenOf(properties, 'w:gridSpan')[0]
  const verticalMergeNode = childrenOf(properties, 'w:vMerge')[0]
  const gridSpan = positiveInteger(
    getAttr(gridSpanNode, 'w:val') ?? getAttr(gridSpanNode, 'val'),
  )
  if (!verticalMergeNode) return { gridSpan, verticalMerge: null }
  const mergeValue =
    getAttr(verticalMergeNode, 'w:val') ?? getAttr(verticalMergeNode, 'val')
  return {
    gridSpan,
    verticalMerge: mergeValue === 'restart' ? 'restart' : 'continue',
  }
}

function rowGridOffset(row) {
  const properties = childrenOf(row, 'w:trPr')[0]
  const gridBeforeNode = childrenOf(properties, 'w:gridBefore')[0]
  return positiveInteger(
    getAttr(gridBeforeNode, 'w:val') ?? getAttr(gridBeforeNode, 'val'),
    0,
  )
}

function collectCellDrawingOrder(cell) {
  const drawingOrder = []
  let paragraphIndex = 0
  let drawingIndexInCell = 0
  let cellContentOrdinal = 0

  const visitParagraph = (paragraph) => {
    paragraphIndex += 1
    let runIndex = 0
    let drawingIndexInParagraph = 0

    const visit = (current, activeRunIndex = 0) => {
      if (!current || typeof current !== 'object') return
      if (Array.isArray(current)) {
        for (const child of current) visit(child, activeRunIndex)
        return
      }
      const name = nodeName(current)
      if (name === 'w:r') {
        runIndex += 1
        for (const child of childrenOf(current)) visit(child, runIndex)
        return
      }
      if (name === 'w:drawing') {
        drawingIndexInCell += 1
        drawingIndexInParagraph += 1
        cellContentOrdinal += 1
        drawingOrder.push({
          drawing: current,
          paragraphIndex,
          runIndex: activeRunIndex,
          drawingIndexInParagraph,
          drawingIndexInCell,
          cellContentOrdinal,
        })
        return
      }
      if (
        typeof current['#text'] === 'string' ||
        name === 'w:tab' ||
        name === 'w:br' ||
        name === 'w:cr'
      ) {
        cellContentOrdinal += 1
      }
      for (const child of childrenOf(current)) visit(child, activeRunIndex)
    }

    visit(paragraph)
  }

  const visitCellChild = (current) => {
    if (!current || typeof current !== 'object') return
    const name = nodeName(current)
    if (name === 'w:tbl') return
    if (name === 'w:p') {
      visitParagraph(current)
      cellContentOrdinal += 1
      return
    }
    if (name === 'w:drawing') {
      drawingIndexInCell += 1
      cellContentOrdinal += 1
      drawingOrder.push({
        drawing: current,
        paragraphIndex: 0,
        runIndex: 0,
        drawingIndexInParagraph: 0,
        drawingIndexInCell,
        cellContentOrdinal,
      })
      return
    }
    for (const child of childrenOf(current)) visitCellChild(child)
  }

  for (const child of childrenOf(cell)) visitCellChild(child)
  return drawingOrder
}

function resolveVerticalRowSpans(rows) {
  for (const row of rows) {
    for (const cell of row.cells) {
      cell.rowSpan = cell.verticalMerge === 'continue' ? 0 : 1
      if (cell.verticalMerge !== 'restart') continue
      for (let rowOffset = row.rowIndex; rowOffset < rows.length; rowOffset += 1) {
        const continuation = rows[rowOffset].cells.find(
          (candidate) =>
            candidate.gridColumn === cell.gridColumn &&
            candidate.verticalMerge === 'continue',
        )
        if (!continuation) break
        cell.rowSpan += 1
      }
    }
  }
}

function serializeCellPath(cellPath) {
  return cellPath.map((cell) => ({
    tableIndex: cell.tableIndex,
    tableSourceElementId: cell.tableSourceElementId,
    rowIndex: cell.rowIndex,
    cellIndex: cell.cellIndex,
    gridColumn: cell.gridColumn,
    gridSpan: cell.gridSpan,
    verticalMerge: cell.verticalMerge,
  }))
}

function drawingExtent(drawing) {
  const extent = descendants(drawing, 'wp:extent')[0]
  const widthEmu = Number(getAttr(extent, 'cx'))
  const heightEmu = Number(getAttr(extent, 'cy'))
  if (!Number.isFinite(widthEmu) || !Number.isFinite(heightEmu)) return null
  return { widthEmu, heightEmu }
}

export function collectTableCellLayouts({ assetId, bodyItems }) {
  const tables = []
  const drawingContexts = []
  const tableLayoutByNode = new WeakMap()
  const cellContextByDrawing = new WeakMap()
  let tableIndex = 0

  const visitTable = (table, bodyIndex, parentCellPath = []) => {
    tableIndex += 1
    const identityPosition = {
      part: 'word/document.xml',
      tableIndex,
    }
    const sourceElementId = stableSourceElementId(assetId, 'table', identityPosition)
    const layout = {
      node: table,
      tableIndex,
      sourceElementId,
      bodyIndex,
      declaredColumnCount: childrenOf(
        childrenOf(table, 'w:tblGrid')[0],
        'w:gridCol',
      ).length,
      rows: [],
    }
    tables.push(layout)
    tableLayoutByNode.set(table, layout)

    const rows = childrenOf(table, 'w:tr')
    for (let rowOffset = 0; rowOffset < rows.length; rowOffset += 1) {
      const row = rows[rowOffset]
      const rowIndex = rowOffset + 1
      const rowLayout = { node: row, rowIndex, cells: [] }
      let gridColumn = rowGridOffset(row) + 1
      const cells = childrenOf(row, 'w:tc')
      for (let cellOffset = 0; cellOffset < cells.length; cellOffset += 1) {
        const cell = cells[cellOffset]
        const cellIndex = cellOffset + 1
        const { gridSpan, verticalMerge } = cellMergeMetadata(cell)
        const cellLayout = {
          node: cell,
          tableIndex,
          tableSourceElementId: sourceElementId,
          rowIndex,
          cellIndex,
          gridColumn,
          gridSpan,
          verticalMerge,
          rowSpan: 1,
        }
        rowLayout.cells.push(cellLayout)
        const cellPath = [...parentCellPath, cellLayout]
        for (const drawingOrder of collectCellDrawingOrder(cell)) {
          const drawingContext = {
            cell: cellLayout,
            cellPath,
            ...drawingOrder,
          }
          cellContextByDrawing.set(drawingOrder.drawing, drawingContext)
          drawingContexts.push(drawingContext)
        }
        for (const child of childrenOf(cell)) {
          if (nodeName(child) === 'w:tbl') visitTable(child, bodyIndex, cellPath)
        }
        gridColumn += gridSpan
      }
      layout.rows.push(rowLayout)
    }
    resolveVerticalRowSpans(layout.rows)
    layout.rowCount = layout.rows.length
    const inferredColumnCount = Math.max(
      0,
      ...layout.rows.flatMap((row) =>
        row.cells.map((cell) => cell.gridColumn + cell.gridSpan - 1),
      ),
    )
    layout.columnCount = layout.declaredColumnCount || inferredColumnCount
    return layout
  }

  for (let bodyOffset = 0; bodyOffset < bodyItems.length; bodyOffset += 1) {
    const item = bodyItems[bodyOffset]
    if (nodeName(item) === 'w:tbl') visitTable(item, bodyOffset + 1)
  }

  return { tables, drawingContexts, tableLayoutByNode, cellContextByDrawing }
}

function relationshipsFromPart(zip, relationshipEntry) {
  const xml = parseXmlEntry(zip, relationshipEntry)
  if (!xml) return []
  const sourcePart = relationshipEntry
    .replace('/_rels/', '/')
    .replace(/\.rels$/, '')
  return descendants(xml, 'Relationship').map((relationship) => {
    const id = getAttr(relationship, 'Id')
    const target = getAttr(relationship, 'Target')
    const targetMode = getAttr(relationship, 'TargetMode') ?? 'Internal'
    const resolvedTarget =
      targetMode === 'External' || !target
        ? null
        : path.posix.normalize(
            path.posix.join(path.posix.dirname(sourcePart), target),
          )
    return {
      sourcePart,
      relationshipEntry,
      relationshipId: id,
      relationshipType: getAttr(relationship, 'Type') ?? '',
      target,
      targetMode,
      resolvedTarget,
    }
  })
}

function collectRelationships(zip) {
  return Object.keys(zip)
    .filter((entry) => entry.endsWith('.rels'))
    .sort()
    .flatMap((entry) => relationshipsFromPart(zip, entry))
}

function buildDocxElements({
  assetId,
  documentXml,
  bodyItems,
  imageParts,
  mediaEntries,
  zip,
}) {
  const elements = []
  const bodyContexts = []
  let paragraphIndex = 0
  const { tables, tableLayoutByNode, cellContextByDrawing } =
    collectTableCellLayouts({ assetId, bodyItems })

  for (let bodyIndex = 0; bodyIndex < bodyItems.length; bodyIndex += 1) {
    const item = bodyItems[bodyIndex]
    if (nodeName(item) === 'w:p') {
      paragraphIndex += 1
      const level = headingLevel(paragraphStyle(item))
      const elementType = level ? 'heading' : 'paragraph'
      const sourcePosition = {
        part: 'word/document.xml',
        bodyIndex: bodyIndex + 1,
        paragraphIndex,
      }
      const text = textOf(item)
      const sourceElementId = stableSourceElementId(
        assetId,
        elementType,
        sourcePosition,
      )
      const element = {
        sourceAssetId: assetId,
        sourceElementId,
        elementType,
        sourcePosition,
        textHash: sha256(text),
        ...(level ? { headingLevel: level, title: text } : {}),
      }
      elements.push(element)
      bodyContexts[bodyIndex] = anchorForBodyItem(item, sourceElementId, bodyIndex + 1)
    }
  }

  for (const table of tables) {
    const identityPosition = {
      part: 'word/document.xml',
      tableIndex: table.tableIndex,
    }
    elements.push({
      sourceAssetId: assetId,
      sourceElementId: table.sourceElementId,
      elementType: 'table',
      sourcePosition: {
        ...identityPosition,
        bodyIndex: table.bodyIndex,
      },
      rowCount: table.rowCount,
      columnCount: table.columnCount,
      contentHash: sha256(textOf(table.node)),
    })
    const bodyItem = bodyItems[table.bodyIndex - 1]
    if (bodyItem === table.node) {
      bodyContexts[table.bodyIndex - 1] = anchorForBodyItem(
        table.node,
        table.sourceElementId,
        table.bodyIndex,
      )
    }
  }

  const bodyIndexByNode = new WeakMap()
  const bodyDrawingOrdinalByNode = new WeakMap()
  const bodyAnchorByNode = new WeakMap()
  for (let bodyIndex = 0; bodyIndex < bodyItems.length; bodyIndex += 1) {
    let bodyDrawingOrdinal = 0
    for (const name of ['m:oMath', 'm:oMathPara', 'w:drawing']) {
      for (const node of descendants(bodyItems[bodyIndex], name)) {
        bodyIndexByNode.set(node, bodyIndex + 1)
        bodyAnchorByNode.set(node, bodyContexts[bodyIndex] ?? null)
        if (name === 'w:drawing') {
          bodyDrawingOrdinal += 1
          bodyDrawingOrdinalByNode.set(node, bodyDrawingOrdinal)
        }
      }
    }
  }
  const formulaNodes = [
    ...descendants(documentXml, 'm:oMath').map((node) => ({
      node,
      ooxmlKind: 'm:oMath',
    })),
    ...descendants(documentXml, 'm:oMathPara').map((node) => ({
      node,
      ooxmlKind: 'm:oMathPara',
    })),
  ]
  for (let index = 0; index < formulaNodes.length; index += 1) {
    const { node, ooxmlKind } = formulaNodes[index]
    const identityPosition = {
      part: 'word/document.xml',
      formulaIndex: index + 1,
      ooxmlKind,
    }
    const sourceText = textOf(node)
    elements.push({
      sourceAssetId: assetId,
      sourceElementId: stableSourceElementId(
        assetId,
        'formula',
        identityPosition,
      ),
      elementType: 'formula',
      sourcePosition: {
        ...identityPosition,
        bodyIndex: bodyIndexByNode.get(node),
      },
      sourceTextHash: sha256(sourceText),
      equivalent: {
        format: sourceText ? 'source-text' : 'descriptive-text',
        value:
          sourceText ||
          `Office Math ${ooxmlKind} object ${index + 1}; exact transcription requires fact review.`,
        reviewStatus: 'pending-fact-review',
      },
    })
  }

  const relationships = collectRelationships(zip)
  const relationshipsByTarget = new Map()
  for (const relationship of relationships) {
    if (!relationship.resolvedTarget) continue
    const items = relationshipsByTarget.get(relationship.resolvedTarget) ?? []
    items.push(relationship)
    relationshipsByTarget.set(relationship.resolvedTarget, items)
  }

  const mediaByPath = new Map()
  for (let index = 0; index < mediaEntries.length; index += 1) {
    const packagePath = mediaEntries[index]
    const data = bufferFromZipEntry(zip[packagePath])
    const sourcePosition = {
      packagePath,
      mediaIndex: index + 1,
    }
    const element = {
      sourceAssetId: assetId,
      sourceElementId: stableSourceElementId(
        assetId,
        'media',
        sourcePosition,
      ),
      elementType: 'media',
      sourcePosition,
      fileName: path.posix.basename(packagePath),
      sha256: sha256(data),
      bytes: data.length,
      relationships: (relationshipsByTarget.get(packagePath) ?? []).map(
        (relationship) => ({
          sourcePart: relationship.sourcePart,
          relationshipId: relationship.relationshipId,
          relationshipType: relationship.relationshipType,
        }),
      ),
    }
    elements.push(element)
    mediaByPath.set(packagePath, element)
  }

  const relationshipsByPartAndId = new Map()
  const relationshipOrdinalCounters = new Map()
  const occurrenceTokenByDrawing = new WeakMap()
  for (const relationship of relationships) {
    relationshipsByPartAndId.set(
      `${relationship.sourcePart}#${relationship.relationshipId}`,
      relationship,
    )
  }
  const drawingRelations = imageParts.flatMap(({ part, xml, kind }) => {
    const drawings = descendants(xml, 'w:drawing')
    return drawings.map((drawing, index) => {
      const blip = descendants(drawing, 'a:blip')[0]
      const relationshipId =
        getAttr(blip, 'r:embed') ?? getAttr(blip, 'embed') ?? null
      const relationship = relationshipId
        ? relationshipsByPartAndId.get(`${part}#${relationshipId}`)
        : null
      const targetMedia = relationship?.resolvedTarget
        ? mediaByPath.get(relationship.resolvedTarget)
        : null
      const placementKind = drawingPlacementKind(drawing)
      const slot =
        kind === 'header'
          ? 'source-header'
          : kind === 'footer'
            ? 'source-footer'
            : placementKind === 'float'
              ? 'float-after-anchor'
              : placementKind === 'inline'
                ? 'inline-after-anchor'
                : 'unknown-after-anchor'
      const relationshipOrdinalKey = `${part}#${relationshipId ?? 'missing'}`
      const relationshipOrdinal =
        (relationshipOrdinalCounters.get(relationshipOrdinalKey) ?? 0) + 1
      relationshipOrdinalCounters.set(relationshipOrdinalKey, relationshipOrdinal)
      const identityPosition = {
        part,
        drawingIndex: index + 1,
      }
      const sourceRelationId = stableSourceRelationId(
        assetId,
        'drawing',
        identityPosition,
      )
      const sourcePosition = {
        ...identityPosition,
        bodyIndex: bodyIndexByNode.get(drawing),
      }
      const cellContext =
        part === 'word/document.xml' ? cellContextByDrawing.get(drawing) ?? null : null
      const cellPlacement = cellContext
        ? {
            cellPlacementId: stablePlacementId(assetId, 'table-cell-placement', {
              ...identityPosition,
              tableIndex: cellContext.cell.tableIndex,
              rowIndex: cellContext.cell.rowIndex,
              cellIndex: cellContext.cell.cellIndex,
              paragraphIndex: cellContext.paragraphIndex,
              runIndex: cellContext.runIndex,
              drawingIndexInCell: cellContext.drawingIndexInCell,
            }),
            tableIndex: cellContext.cell.tableIndex,
            tableSourceElementId: cellContext.cell.tableSourceElementId,
            rowIndex: cellContext.cell.rowIndex,
            cellIndex: cellContext.cell.cellIndex,
            gridColumn: cellContext.cell.gridColumn,
            gridSpan: cellContext.cell.gridSpan,
            rowSpan: cellContext.cell.rowSpan,
            verticalMerge: cellContext.cell.verticalMerge,
            paragraphIndex: cellContext.paragraphIndex,
            runIndex: cellContext.runIndex,
            drawingIndexInParagraph: cellContext.drawingIndexInParagraph,
            drawingIndexInCell: cellContext.drawingIndexInCell,
            cellContentOrdinal: cellContext.cellContentOrdinal,
            cellPath: serializeCellPath(cellContext.cellPath),
          }
        : null
      const placementId = stablePlacementId(assetId, 'drawing-placement', {
        ...identityPosition,
        relationshipId,
        relationshipOrdinal,
      })
      const diagnostics =
        slot === 'float-after-anchor'
          ? [
              {
                severity: 'warning',
                code: 'float-after-anchor',
                message:
                  'OOXML floating image is anchored to nearby source content; exact two-dimensional layout must be visually reviewed.',
              },
            ]
          : []
      let resolution = 'layout'
      let reason =
        'Drawing wrapper has no embedded media relationship and is retained as layout metadata.'
      if (targetMedia) {
        resolution = 'media'
        reason = 'Drawing relationship resolves to a registered DOCX media element.'
      } else if (relationship) {
        resolution = 'non-media-relationship'
        reason =
          'Drawing relationship resolves to a non-media OOXML part and is retained for manual layout review.'
      }
      const extent = drawingExtent(drawing)
      const resolvedSlot = cellPlacement ? 'table-cell' : slot
      if (cellPlacement) {
        occurrenceTokenByDrawing.set(
          drawing,
          tableCellMediaToken(sourceRelationId),
        )
      }
      return {
        sourceAssetId: assetId,
        sourceRelationId,
        occurrenceId: sourceRelationId,
        placementId,
        sourceElementId: targetMedia?.sourceElementId ?? null,
        sourcePosition,
        relationshipId,
        relationshipTarget: relationship?.resolvedTarget ?? null,
        relationshipOrdinal,
        drawingOrdinal: index + 1,
        partOrdinal: index + 1,
        bodyOrdinal: bodyDrawingOrdinalByNode.get(drawing) ?? null,
        placementKind,
        extent,
        ...(cellPlacement ? { tableCell: cellPlacement } : {}),
        targetMediaElementId: targetMedia?.sourceElementId ?? null,
        resolution,
        disposition: targetMedia ? 'merged' : 'internal-only',
        reason,
        placement: {
          placementId,
          occurrenceId: sourceRelationId,
          sourceElementId: targetMedia?.sourceElementId ?? null,
          part,
          partKind: kind,
          relationshipId,
          relationshipOrdinal,
          drawingOrdinal: index + 1,
          partOrdinal: index + 1,
          bodyOrdinal: bodyDrawingOrdinalByNode.get(drawing) ?? null,
          pageId: null,
          pageIds: [],
          anchor: bodyAnchorByNode.get(drawing) ?? null,
          slot: resolvedSlot,
          placementKind,
          extent,
          ...(cellPlacement ? { tableCell: cellPlacement } : {}),
        },
        diagnostics,
      }
    })
  })

  return {
    elements,
    drawingRelations,
    bodyContexts,
    tableLayoutByNode,
    occurrenceTokenByDrawing,
  }
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
  const imageParts = collectImageParts(zip, documentXml)
  const bodyParagraphs = bodyItems.filter((item) => nodeName(item) === 'w:p')
  const mediaEntries = Object.keys(zip).filter((name) => name.startsWith('word/media/'))
  const embeddedEntries = Object.keys(zip).filter((name) => name.startsWith('word/embeddings/'))
  const footnotes = countFootnotes(zip)
  const drawingCount = imageParts.reduce(
    (total, part) => total + descendants(part.xml, 'w:drawing').length,
    0,
  )
  const counts = {
    paragraphs: bodyParagraphs.length,
    headings: bodyParagraphs.filter((p) => headingLevel(paragraphStyle(p))).length,
    tables: descendants(documentXml, 'w:tbl').length,
    drawings: drawingCount,
    inlineDrawings: imageParts.reduce(
      (total, part) => total + descendants(part.xml, 'wp:inline').length,
      0,
    ),
    floatingDrawings: imageParts.reduce(
      (total, part) => total + descendants(part.xml, 'wp:anchor').length,
      0,
    ),
    drawingParts: imageParts.filter(
      (part) => descendants(part.xml, 'w:drawing').length > 0,
    ).map((part) => ({
      part: part.part,
      kind: part.kind,
      drawings: descendants(part.xml, 'w:drawing').length,
      inlineDrawings: descendants(part.xml, 'wp:inline').length,
      floatingDrawings: descendants(part.xml, 'wp:anchor').length,
    })),
    media: mediaEntries.length,
    footnotes: footnotes.count,
    footnotesPresent: footnotes.present,
    formulas:
      countInXml(zip, 'word/document.xml', 'm:oMath') +
      countInXml(zip, 'word/document.xml', 'm:oMathPara'),
    embeddedObjects: embeddedEntries.length + countInXml(zip, 'word/document.xml', 'o:OLEObject'),
  }
  const { asset } = await loadSourceAsset(assetId)
  if (asset.assetType !== 'docx') {
    throw new Error(`${assetId} is registered as ${asset.assetType}, not docx`)
  }
  if (asset.hashes.sha256 !== sha256(sourceBuffer)) {
    throw new Error(`${assetId}: source SHA-256 does not match the source ledger`)
  }
  const governance = importGovernance(asset)
  const {
    elements,
    drawingRelations,
    bodyContexts,
    tableLayoutByNode,
    occurrenceTokenByDrawing,
  } = buildDocxElements({
    assetId,
    documentXml,
    bodyItems,
    imageParts,
    mediaEntries: mediaEntries.sort(),
    zip,
  })
  counts.tableCellDrawings = drawingRelations.filter(
    (relation) => relation.placement?.slot === 'table-cell',
  ).length
  const reviewItems = buildReviewItems(counts)

  const markdownBlocks = [
    `<!-- sourceAssetId: ${assetId}; publishable: false; permission: ${governance.permission}; reviewStatus: ${governance.reviewStatus} -->`,
    '',
    `# DOCX Import Review: ${path.basename(absoluteSourcePath)}`,
    '',
    '## Imported Body',
    '',
  ]
  for (let bodyIndex = 0; bodyIndex < bodyItems.length; bodyIndex += 1) {
    const item = bodyItems[bodyIndex]
    const marker = sourceBodyMarker(bodyContexts[bodyIndex])
    const rendered =
      nodeName(item) === 'w:tbl'
        ? renderTable(item, tableLayoutByNode, occurrenceTokenByDrawing)
        : renderParagraph(item)
    if (rendered) {
      markdownBlocks.push(rendered)
      if (marker) markdownBlocks.push(marker)
      markdownBlocks.push('')
    } else if (marker) {
      markdownBlocks.push(marker, '')
    }
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
    ...governance,
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
    ...governance,
    counts,
    outputs,
    reviewItems,
    elements,
    drawingRelations,
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

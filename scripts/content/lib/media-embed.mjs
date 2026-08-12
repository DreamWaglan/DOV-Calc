import { readJson } from './content-utils.mjs'
import { tableCellMediaToken } from './migration-elements.mjs'

const SOURCE_BODY_MARKER_PATTERN =
  /<!-- source-body:(\d+):([^:]+:[^:]+:[^:]+):([^ ]+) -->/g

function html(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function jsonAttr(value) {
  return html(JSON.stringify(value))
}

function occurrenceMediaAnchor(item, occurrence) {
  const occurrenceId = occurrence.occurrenceId.split(':').at(-1)
  return `${item.libraryId}-${occurrenceId}`
}

function buildOccurrenceDiagnostics(occurrence) {
  const diagnostics = occurrence.diagnostics ?? []
  if (!diagnostics.length) return []
  return diagnostics.map(
    (item) =>
      `<!-- media-placement-warning:${html(item.code)}:${html(item.severity)}:${html(
        occurrence.occurrenceId,
      )} -->`,
  )
}

export function buildResponsiveMediaMarkup(
  item,
  occurrence = null,
  { displayMode = 'viewer', compact = false } = {},
) {
  const original = item.original
  if (!original?.publicPath) return null
  const occurrenceSuffix = occurrence
    ? `；DOCX occurrence ${occurrence.occurrenceId.split(':').at(-1)}`
    : ''
  const attributes = [
    `media-id="${html(
      occurrence ? occurrenceMediaAnchor(item, occurrence) : item.libraryId,
    )}"`,
    `alt="${html(`${item.alt}${occurrenceSuffix}`)}"`,
    `display-mode="${html(displayMode)}"`,
    `:variants='${jsonAttr([])}'`,
    `fallback-path="${html(original.publicPath)}"`,
    `:width="${original.width}"`,
    `:height="${original.height}"`,
  ]
  if (compact) return `<ResponsiveMedia ${attributes.join(' ')} />`
  return `<ResponsiveMedia
  media-id="${html(
    occurrence ? occurrenceMediaAnchor(item, occurrence) : item.libraryId,
  )}"
  alt="${html(`${item.alt}${occurrenceSuffix}`)}"
  display-mode="${html(displayMode)}"
  :variants='${jsonAttr([])}'
  fallback-path="${html(original.publicPath)}"
  :width="${original.width}"
  :height="${original.height}"
/>`
}

function markerForAnchor(anchor) {
  if (!anchor?.sourceElementId || !Number.isInteger(anchor.bodyIndex)) return null
  return `<!-- source-body:${anchor.bodyIndex}:${anchor.sourceElementId}:${anchor.elementType} -->`
}

function compareOccurrences(left, right) {
  return (
    slotRank(left.placement?.slot) - slotRank(right.placement?.slot) ||
    (left.sourcePosition?.bodyIndex ?? Number.MAX_SAFE_INTEGER) -
      (right.sourcePosition?.bodyIndex ?? Number.MAX_SAFE_INTEGER) ||
    (left.placement?.bodyOrdinal ?? Number.MAX_SAFE_INTEGER) -
      (right.placement?.bodyOrdinal ?? Number.MAX_SAFE_INTEGER) ||
    (left.placement?.drawingOrdinal ?? Number.MAX_SAFE_INTEGER) -
      (right.placement?.drawingOrdinal ?? Number.MAX_SAFE_INTEGER) ||
    (left.placement?.partOrdinal ?? Number.MAX_SAFE_INTEGER) -
      (right.placement?.partOrdinal ?? Number.MAX_SAFE_INTEGER) ||
    (left.placement?.relationshipOrdinal ?? Number.MAX_SAFE_INTEGER) -
      (right.placement?.relationshipOrdinal ?? Number.MAX_SAFE_INTEGER) ||
    left.occurrenceId.localeCompare(right.occurrenceId)
  )
}

function slotRank(slot) {
  if (slot === 'source-header') return 0
  if (
    slot === 'table-cell' ||
    slot === 'inline-after-anchor' ||
    slot === 'float-after-anchor'
  ) return 1
  if (slot === 'source-footer') return 3
  return 99
}

export function extractSourceBodyMarkers(markdown) {
  return [...markdown.matchAll(SOURCE_BODY_MARKER_PATTERN)].map((match) => ({
    marker: match[0],
    bodyIndex: Number(match[1]),
    sourceElementId: match[2],
    elementType: match[3],
    index: match.index,
  }))
}

export function insertPlacedMedia(markdown, pageId, sourceAssetId, placementMap) {
  const occurrences = (placementMap.get(pageId) ?? [])
    .filter((occurrence) => occurrence.sourceAssetId === sourceAssetId)
    .sort(compareOccurrences)
  if (occurrences.length === 0) return markdown

  let output = markdown
  const markers = extractSourceBodyMarkers(markdown)
  const markerSet = new Set(markers.map((marker) => marker.marker))
  const sourceHeader = []
  const sourceFooter = []
  const tableCells = []
  const anchored = []
  for (const occurrence of occurrences) {
    const slot = occurrence.placement?.slot
    if (slot === 'source-header') {
      sourceHeader.push(occurrence)
      continue
    }
    if (slot === 'source-footer') {
      sourceFooter.push(occurrence)
      continue
    }
    if (slot === 'table-cell') {
      tableCells.push(occurrence)
      continue
    }
    if (!['inline-after-anchor', 'float-after-anchor'].includes(slot)) {
      throw new Error(`${occurrence.occurrenceId}: unsupported media placement slot ${slot}`)
    }
    const marker = markerForAnchor(occurrence.placement?.anchor)
    if (!marker || !markerSet.has(marker)) {
      throw new Error(
        `${occurrence.occurrenceId}: source-body anchor is missing from ${pageId}`,
      )
    }
    anchored.push(occurrence)
  }
  for (const occurrence of tableCells) {
    const token = tableCellMediaToken(occurrence.occurrenceId)
    const tokenMatches = output.split(token).length - 1
    if (tokenMatches !== 1) {
      throw new Error(
        `${occurrence.occurrenceId}: expected one table-cell token in ${pageId}, found ${tokenMatches}`,
      )
    }
    const blocks = [
      ...buildOccurrenceDiagnostics(occurrence),
      buildResponsiveMediaMarkup(occurrence.mediaItem, occurrence, {
        displayMode: 'table-cell',
        compact: true,
      }),
    ]
      .filter(Boolean)
      .join('\n')
    output = output.replace(token, blocks)
  }
  const byMarker = new Map()
  for (const occurrence of anchored) {
    const marker = markerForAnchor(occurrence.placement.anchor)
    const bucket = byMarker.get(marker) ?? []
    bucket.push(occurrence)
    byMarker.set(marker, bucket)
  }
  for (const [marker, bucket] of byMarker) {
    const blocks = bucket
      .sort(compareOccurrences)
      .flatMap((occurrence) => [
        ...buildOccurrenceDiagnostics(occurrence),
        buildResponsiveMediaMarkup(occurrence.mediaItem, occurrence),
      ])
      .filter(Boolean)
      .join('\n\n')
    output = output.replace(marker, `${marker}\n\n${blocks}`)
  }
  if (sourceHeader.length) {
    output = `${buildOccurrenceBlocks(sourceHeader)}\n\n${output}`
  }
  if (sourceFooter.length) {
    output = `${output}\n\n${buildOccurrenceBlocks(sourceFooter)}`
  }
  return output
}

function buildOccurrenceBlocks(occurrences) {
  return occurrences
    .sort(compareOccurrences)
    .flatMap((occurrence) => [
      ...buildOccurrenceDiagnostics(occurrence),
      buildResponsiveMediaMarkup(occurrence.mediaItem, occurrence),
    ])
    .filter(Boolean)
    .join('\n\n')
}

export async function loadPageMediaPlacements({
  fullContentMapPath = 'content/migrations/full-content-map.json',
  mediaLibraryPath = 'content/migrations/media-library.json',
} = {}) {
  const fullContentMap = await readJson(fullContentMapPath)
  const mediaLibrary = await readJson(mediaLibraryPath)
  const mediaBySourceElement = new Map(
    mediaLibrary.docxMediaItems.map((item) => [item.sourceElementId, item]),
  )
  const placementMap = new Map()
  for (const relation of fullContentMap.drawingRelations ?? []) {
    if (relation.resolution !== 'media') continue
    const item = mediaBySourceElement.get(relation.targetMediaElementId)
    if (!item) continue
    const targetPageIds = Array.isArray(relation.targetPageIds)
      ? relation.targetPageIds
      : []
    for (const pageId of targetPageIds) {
      const bucket = placementMap.get(pageId) ?? []
      bucket.push({ ...relation, mediaItem: item })
      placementMap.set(pageId, bucket)
    }
  }
  return placementMap
}

import {
  loadPages,
  printResult,
  readJson,
  writeReport,
} from './lib/content-utils.mjs'
import { extractSourceBodyMarkers } from './lib/media-embed.mjs'

const EXPECTED_CONTENT_OCCURRENCES = 977

function mediaIdFor(item, occurrence) {
  return `${item.libraryId}-${occurrence.occurrenceId.split(':').at(-1)}`
}

function markerForAnchor(anchor) {
  if (!anchor?.sourceElementId || !Number.isInteger(anchor.bodyIndex)) return null
  return `<!-- source-body:${anchor.bodyIndex}:${anchor.sourceElementId}:${anchor.elementType} -->`
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0
  return haystack.split(needle).length - 1
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

function assertOrderedWithinPage(page, occurrences, failures) {
  let cursor = -1
  for (const occurrence of occurrences) {
    const marker = markerForAnchor(occurrence.placement?.anchor)
    const mediaId = mediaIdFor(occurrence.mediaItem, occurrence)
    const markerIndex = marker ? page.body.indexOf(marker) : -1
    const mediaIndex = page.body.indexOf(`media-id="${mediaId}"`)
    if (occurrence.placement?.slot === 'source-header') {
      if (mediaIndex < 0) failures.push(`${occurrence.occurrenceId}: header media is missing`)
    } else if (occurrence.placement?.slot === 'source-footer') {
      if (mediaIndex < 0) failures.push(`${occurrence.occurrenceId}: footer media is missing`)
    } else if (occurrence.placement?.slot === 'table-cell') {
      const cell = occurrence.placement.tableCell
      const expectedCell = `data-source-cell="${cell.tableSourceElementId}:${cell.rowIndex}:${cell.cellIndex}"`
      const cellAttributeIndex = page.body.lastIndexOf(expectedCell, mediaIndex)
      const cellTagStart = Math.max(
        page.body.lastIndexOf('<td ', mediaIndex),
        page.body.lastIndexOf('<th ', mediaIndex),
      )
      const cellTagName = page.body.startsWith('<th ', cellTagStart) ? 'th' : 'td'
      const cellEnd = page.body.indexOf(`</${cellTagName}>`, mediaIndex)
      if (
        mediaIndex < 0 ||
        markerIndex < 0 ||
        markerIndex <= mediaIndex ||
        cellAttributeIndex < cellTagStart ||
        cellAttributeIndex > mediaIndex ||
        cellEnd < mediaIndex
      ) {
        failures.push(`${occurrence.occurrenceId}: media is not inside its source table cell`)
      }
    } else if (markerIndex < 0 || mediaIndex < 0 || mediaIndex <= markerIndex) {
      failures.push(`${occurrence.occurrenceId}: media is not after its source-body marker`)
    }
    if (mediaIndex >= 0 && mediaIndex < cursor) {
      failures.push(`${occurrence.occurrenceId}: media order regressed within ${page.frontmatter.id}`)
    }
    if (mediaIndex >= 0) cursor = mediaIndex
  }
}

const core = await readJson('content/migrations/core-content-pages.json')
const advanced = await readJson('content/migrations/advanced-content-pages.json')
const fullMap = await readJson('content/migrations/full-content-map.json')
const mediaLibrary = await readJson('content/migrations/media-library.json')
const mediaByElement = new Map(
  mediaLibrary.docxMediaItems.map((item) => [item.sourceElementId, item]),
)
const pages = await loadPages()
const pageById = new Map(pages.map((page) => [page.frontmatter.id, page]))
const contentSourceIds = new Set([
  ...(core.sources ?? []).map((source) => source.sourceAssetId),
  ...(advanced.sources ?? []).map((source) => source.sourceAssetId),
])
const sourcePages = [...(core.sources ?? []), ...(advanced.sources ?? [])]
  .flatMap((source) => source.pages.map((page) => ({
    ...page,
    sourceAssetId: source.sourceAssetId,
  })))
const sourcePageIds = new Set(sourcePages.map((page) => page.pageId))
const failures = []

const contentRelations = fullMap.drawingRelations.filter(
  (relation) =>
    contentSourceIds.has(relation.sourceAssetId) &&
    relation.resolution === 'media',
)
if (contentRelations.length !== EXPECTED_CONTENT_OCCURRENCES) {
  failures.push(
    `content media occurrences: expected ${EXPECTED_CONTENT_OCCURRENCES}, got ${contentRelations.length}`,
  )
}

const byPage = new Map()
for (const relation of contentRelations) {
  if (relation.targetPageIds.length !== 1) {
    failures.push(`${relation.occurrenceId}: expected exactly one target page`)
    continue
  }
  const pageId = relation.targetPageIds[0]
  if (!sourcePageIds.has(pageId)) {
    failures.push(`${relation.occurrenceId}: target page is not source-backed: ${pageId}`)
  }
  const mediaItem = mediaByElement.get(relation.targetMediaElementId)
  if (!mediaItem) {
    failures.push(`${relation.occurrenceId}: missing media library item`)
    continue
  }
  if (!mediaItem.original?.publicPath || mediaItem.original.publicPath.includes('segment-')) {
    failures.push(`${relation.occurrenceId}: original public path is missing or segmented`)
  }
  if (mediaItem.downloadAllowed !== true) {
    failures.push(`${relation.occurrenceId}: original download is not allowed`)
  }
  const pageOccurrences = byPage.get(pageId) ?? []
  pageOccurrences.push({ ...relation, mediaItem })
  byPage.set(pageId, pageOccurrences)
}

let renderedOccurrences = 0
let renderedTableCellOccurrences = 0
for (const sourcePage of sourcePages) {
  const page = pageById.get(sourcePage.pageId)
  if (!page) {
    failures.push(`${sourcePage.pageId}: generated page is missing`)
    continue
  }
  if (/^## 插图 \d+/m.test(page.body)) {
    failures.push(`${sourcePage.pageId}: legacy appended illustration heading remains`)
  }
  if (page.body.includes('segment-')) {
    failures.push(`${sourcePage.pageId}: segmented media reference remains`)
  }
  if (page.body.includes('docx-cell-media:')) {
    failures.push(`${sourcePage.pageId}: unresolved table-cell media token remains`)
  }
  const markers = extractSourceBodyMarkers(page.body)
  if (markers.length === 0) {
    failures.push(`${sourcePage.pageId}: source-body markers are missing`)
  }
  const occurrences = (byPage.get(sourcePage.pageId) ?? []).sort(
    compareOccurrences,
  )
  assertOrderedWithinPage(page, occurrences, failures)
  for (const occurrence of occurrences) {
    const mediaId = mediaIdFor(occurrence.mediaItem, occurrence)
    const idCount = countOccurrences(page.body, `media-id="${mediaId}"`)
    if (idCount !== 1) {
      failures.push(`${occurrence.occurrenceId}: rendered ${idCount} times`)
    } else {
      renderedOccurrences += 1
      if (occurrence.placement?.slot === 'table-cell') {
        renderedTableCellOccurrences += 1
      }
    }
    const originalPath = occurrence.mediaItem.original.publicPath
    if (!page.body.includes(`fallback-path="${originalPath}"`)) {
      failures.push(`${occurrence.occurrenceId}: fallback does not use original path`)
    }
    if (
      page.body.includes('download-path=') ||
      page.body.includes('download-allowed=')
    ) {
      failures.push(`${occurrence.occurrenceId}: public download attributes remain`)
    }
    if (!page.body.includes(":variants='[]'")) {
      failures.push(`${sourcePage.pageId}: expected original-only media variants`)
    }
    if (occurrence.placement?.slot === 'float-after-anchor') {
      const warning = `media-placement-warning:float-after-anchor:warning:${occurrence.occurrenceId}`
      if (!page.body.includes(warning)) {
        failures.push(`${occurrence.occurrenceId}: floating placement warning is missing`)
      }
    }
    if (
      occurrence.placement?.slot === 'table-cell' &&
      !page.body.includes(
        `media-id="${mediaId}" alt="${occurrence.mediaItem.alt}`,
      )
    ) {
      failures.push(`${occurrence.occurrenceId}: table-cell media alt text is missing`)
    }
  }
}

for (const [pageId, occurrences] of byPage) {
  const page = pageById.get(pageId)
  if (!page) continue
  const ids = occurrences.map((occurrence) => mediaIdFor(occurrence.mediaItem, occurrence))
  if (new Set(ids).size !== ids.length) {
    failures.push(`${pageId}: occurrence media IDs are not unique`)
  }
}

if (renderedOccurrences !== contentRelations.length) {
  failures.push(
    `rendered media occurrences: expected ${contentRelations.length}, got ${renderedOccurrences}`,
  )
}

const report = {
  schemaVersion: 1,
  summary: {
    contentSources: contentSourceIds.size,
    sourcePages: sourcePages.length,
    contentMediaOccurrences: contentRelations.length,
    renderedOccurrences,
    tableCellOccurrences: contentRelations.filter(
      (relation) => relation.placement?.slot === 'table-cell',
    ).length,
    renderedTableCellOccurrences,
    pagesWithMedia: byPage.size,
    failures: failures.length,
  },
  failures,
}
const reportPath = await writeReport('media-placement', report)
printResult('Media placement validation', failures, reportPath)

import { readJson, writeReport, printResult } from './lib/content-utils.mjs'
import { tableCellPlacementErrors } from './lib/migration-elements.mjs'

const fullMap = await readJson('content/migrations/full-content-map.json')
const failures = []
const contentDocxIds = new Set(
  (fullMap.sourceSummaries?.docx ?? [])
    .filter((source) => source.contentDocument)
    .map((source) => source.sourceAssetId),
)
const contentElements = fullMap.elements.filter((element) =>
  contentDocxIds.has(element.sourceAssetId),
)
const contentRelations = fullMap.drawingRelations.filter((relation) =>
  contentDocxIds.has(relation.sourceAssetId),
)
const elementsById = new Map(
  fullMap.elements.map((element) => [element.sourceElementId, element]),
)

function countElements(type) {
  return contentElements.filter((element) => element.elementType === type).length
}

const totals = {
  tables: countElements('table'),
  media: countElements('media'),
  drawings: contentRelations.length,
}
const expected = { tables: 165, media: 585, drawings: 977 }
for (const [key, value] of Object.entries(expected)) {
  if (totals[key] !== value) {
    failures.push(`${key}: expected ${value}, got ${totals[key]}`)
  }
}

const seenRelations = new Set()
const seenOccurrences = new Set()
const seenPlacements = new Set()
let floatWarnings = 0
for (const table of contentElements.filter(
  (element) => element.elementType === 'table',
)) {
  if (
    !Number.isInteger(table.sourcePosition?.bodyIndex) ||
    !Number.isInteger(table.sourcePosition?.tableIndex)
  ) {
    failures.push(`${table.sourceElementId}: table source position is incomplete`)
  }
  if (
    table.targetPageIds.length === 0 &&
    !['internal-only', 'omitted-with-rationale'].includes(table.disposition)
  ) {
    failures.push(`${table.sourceElementId}: table has no target page or rationale`)
  }
}

for (const media of contentElements.filter(
  (element) => element.elementType === 'media',
)) {
  if (
    !/^[a-f0-9]{64}$/.test(media.sha256 ?? '') ||
    !Number.isInteger(media.bytes) ||
    media.bytes <= 0 ||
    !Number.isInteger(media.sourcePosition?.mediaIndex) ||
    !media.sourcePosition?.packagePath
  ) {
    failures.push(`${media.sourceElementId}: media identity is incomplete`)
  }
  if (
    media.targetPageIds.length === 0 &&
    !['internal-only', 'omitted-with-rationale'].includes(media.disposition)
  ) {
    failures.push(`${media.sourceElementId}: media has no target page or rationale`)
  }
  if (
    media.targetAssetIds.length === 0 &&
    !['internal-only', 'omitted-with-rationale'].includes(media.disposition)
  ) {
    failures.push(`${media.sourceElementId}: media has no target asset or rationale`)
  }
}

for (const relation of contentRelations) {
  if (seenRelations.has(relation.sourceRelationId)) {
    failures.push(`${relation.sourceRelationId}: duplicate drawing relation`)
  }
  seenRelations.add(relation.sourceRelationId)
  if (seenOccurrences.has(relation.occurrenceId)) {
    failures.push(`${relation.sourceRelationId}: duplicate occurrence id`)
  }
  seenOccurrences.add(relation.occurrenceId)
  if (seenPlacements.has(relation.placementId)) {
    failures.push(`${relation.sourceRelationId}: duplicate placement id`)
  }
  seenPlacements.add(relation.placementId)
  if (
    !Number.isInteger(relation.sourcePosition?.bodyIndex) ||
    !Number.isInteger(relation.sourcePosition?.drawingIndex)
  ) {
    failures.push(`${relation.sourceRelationId}: drawing source position is incomplete`)
  }
  const placement = relation.placement
  const bodySlot = ['inline-after-anchor', 'float-after-anchor', 'table-cell'].includes(
    placement?.slot,
  )
  const sourcePartSlot = ['source-header', 'source-footer'].includes(
    placement?.slot,
  )
  if (
    relation.occurrenceId !== relation.sourceRelationId ||
    !relation.placementId ||
    placement?.placementId !== relation.placementId ||
    placement?.occurrenceId !== relation.occurrenceId ||
    placement?.sourceElementId !== relation.sourceElementId ||
    relation.sourceElementId !== relation.targetMediaElementId ||
    placement?.part !== relation.sourcePosition?.part ||
    !['body', 'header', 'footer'].includes(placement?.partKind) ||
    !Number.isInteger(placement?.relationshipOrdinal) ||
    !Number.isInteger(placement?.drawingOrdinal) ||
    !Number.isInteger(placement?.partOrdinal) ||
    placement?.pageId !== relation.pageId ||
    !Array.isArray(placement?.pageIds) ||
    placement.pageIds.length !== relation.targetPageIds.length ||
    placement.pageIds.some((pageId) => !relation.targetPageIds.includes(pageId)) ||
    (bodySlot && !relation.targetPageIds.includes(placement?.pageId)) ||
    (sourcePartSlot && placement?.pageId !== null) ||
    (!bodySlot && !sourcePartSlot) ||
    !(
      (placement?.partKind === 'body' && bodySlot) ||
      (placement?.partKind === 'header' && placement?.slot === 'source-header') ||
      (placement?.partKind === 'footer' && placement?.slot === 'source-footer')
    ) ||
    (bodySlot &&
      (!Number.isInteger(placement?.bodyOrdinal) ||
        !placement?.anchor?.sourceElementId)) ||
    (sourcePartSlot && placement?.anchor !== null)
  ) {
    failures.push(`${relation.sourceRelationId}: drawing placement metadata is incomplete`)
  }
  if (placement?.slot === 'table-cell') {
    for (const error of tableCellPlacementErrors(placement.tableCell)) {
      failures.push(`${relation.sourceRelationId}: ${error}`)
    }
    if (JSON.stringify(relation.tableCell) !== JSON.stringify(placement.tableCell)) {
      failures.push(`${relation.sourceRelationId}: relation and placement tableCell differ`)
    }
    const table = elementsById.get(placement.tableCell?.tableSourceElementId)
    if (table?.elementType !== 'table' || table.sourceAssetId !== relation.sourceAssetId) {
      failures.push(`${relation.sourceRelationId}: tableCell target table is invalid`)
    }
  } else if (relation.tableCell !== undefined || placement?.tableCell !== undefined) {
    failures.push(`${relation.sourceRelationId}: non-cell placement carries tableCell metadata`)
  }
  if (placement?.slot === 'float-after-anchor') {
    const hasWarning = (relation.diagnostics ?? []).some(
      (item) => item.severity === 'warning' && item.code === 'float-after-anchor',
    )
    if (!hasWarning) {
      failures.push(`${relation.sourceRelationId}: float placement lacks warning`)
    } else {
      floatWarnings += 1
    }
  }
  if (relation.resolution === 'media') {
    const media = elementsById.get(relation.targetMediaElementId)
    if (!media || media.elementType !== 'media') {
      failures.push(
        `${relation.sourceRelationId}: target media element does not exist`,
      )
      continue
    }
    if (media.sourceAssetId !== relation.sourceAssetId) {
      failures.push(`${relation.sourceRelationId}: crosses source asset boundary`)
    }
    if (
      relation.targetPageIds.some(
        (pageId) => !media.targetPageIds.includes(pageId),
      )
    ) {
      failures.push(
        `${relation.sourceRelationId}: drawing page is not owned by target media`,
      )
    }
  } else if (!relation.reason?.trim()) {
    failures.push(`${relation.sourceRelationId}: non-media relation lacks a reason`)
  }
}

const perSource = (fullMap.sourceSummaries?.docx ?? [])
  .filter((source) => source.contentDocument)
  .map((source) => ({
    sourceAssetId: source.sourceAssetId,
    tables: source.counts.tables,
    media: source.counts.media,
    drawings: source.counts.drawings,
    targetPageIds: source.targetPageIds,
  }))

const report = {
  schemaVersion: 1,
  check: 'document-structure-closure',
  summary: {
    contentDocxSources: contentDocxIds.size,
    ...totals,
    occurrences: seenOccurrences.size,
    placements: seenPlacements.size,
    floatWarnings,
    failures: failures.length,
  },
  expected,
  perSource,
  policy: {
    tableOwnership: 'bodyIndex plus tableIndex, mapped to an owning page',
    mediaIdentity: 'OOXML package path plus SHA-256 and target asset ID',
    drawingOwnership:
      'bodyIndex drawing relation with occurrence placement; relation pages must be a subset of media pages',
    visualReview:
      'media remains pending visual review until Phase 5 derivative and rights review',
  },
  failures,
}

const reportPath = await writeReport('document-structures', report)
printResult('Document structure closure validation', failures, reportPath)

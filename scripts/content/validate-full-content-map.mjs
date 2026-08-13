import { readFile } from 'node:fs/promises'
import Ajv from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {
  DISPOSITIONS,
  SOURCE_ELEMENT_TYPES,
  dispositionErrors,
  loadSourceLedger,
  tableCellPlacementErrors,
} from './lib/migration-elements.mjs'
import {
  articleParagraphPolicyErrors,
  resolveImportedParagraphSemantic,
} from './lib/article-prose.mjs'
import { printResult, writeReport } from './lib/content-utils.mjs'

const map = JSON.parse(
  await readFile('content/migrations/full-content-map.json', 'utf8'),
)
const schema = JSON.parse(
  await readFile('content/schemas/full-content-map.schema.json', 'utf8'),
)
const ledger = await loadSourceLedger()
const paragraphSemanticPolicy = JSON.parse(
  await readFile('content/governance/paragraph-semantics.json', 'utf8'),
)
const coreMigration = JSON.parse(
  await readFile('content/migrations/core-content-pages.json', 'utf8'),
)
const advancedMigration = JSON.parse(
  await readFile('content/migrations/advanced-content-pages.json', 'utf8'),
)
const failures = []
for (const error of articleParagraphPolicyErrors(paragraphSemanticPolicy)) {
  failures.push(`paragraph semantic policy: ${error}`)
}

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)
if (!validate(map)) {
  for (const error of validate.errors ?? []) {
    failures.push(`schema ${error.instancePath || '/'} ${error.message}`)
  }
}

const expectedAssetsByType = { docx: 13, xlsx: 1, image: 15 }
const registeredIds = new Set(ledger.assets.map((asset) => asset.id))
const mappedAssetIds = new Set(map.assets.map((asset) => asset.sourceAssetId))
for (const assetId of registeredIds) {
  if (!mappedAssetIds.has(assetId)) failures.push(`unmapped source asset: ${assetId}`)
}
for (const assetId of mappedAssetIds) {
  if (!registeredIds.has(assetId)) failures.push(`unknown mapped source asset: ${assetId}`)
}
for (const [assetType, expected] of Object.entries(expectedAssetsByType)) {
  const actual = map.assets.filter((asset) => asset.assetType === assetType).length
  if (actual !== expected) {
    failures.push(`${assetType} asset count: expected ${expected}, got ${actual}`)
  }
}

const allElementIds = [
  ...map.elements.map((element) => element.sourceElementId),
  ...map.dataRecords.map((record) => record.sourceElementId),
]
const duplicateElementIds = allElementIds.filter(
  (id, index) => allElementIds.indexOf(id) !== index,
)
for (const id of new Set(duplicateElementIds)) {
  failures.push(`duplicate sourceElementId: ${id}`)
}

let invalidDispositions = 0
let omittedWithoutReason = 0
for (const entry of [
  ...map.assets,
  ...map.elements,
  ...map.drawingRelations,
  ...map.dataRecords,
]) {
  const errors = dispositionErrors(entry)
  invalidDispositions += errors.filter((error) =>
    error.startsWith('invalid disposition'),
  ).length
  omittedWithoutReason += errors.filter((error) =>
    error.includes('requires a non-empty reason'),
  ).length
  for (const error of errors) {
    failures.push(
      `${entry.sourceElementId ?? entry.sourceRelationId ?? entry.sourceAssetId}: ${error}`,
    )
  }
}

for (const element of map.elements) {
  if (!SOURCE_ELEMENT_TYPES.includes(element.elementType)) {
    failures.push(
      `${element.sourceElementId}: unsupported elementType ${element.elementType}`,
    )
  }
  if (!registeredIds.has(element.sourceAssetId)) {
    failures.push(
      `${element.sourceElementId}: source asset ${element.sourceAssetId} is not registered`,
    )
  }
  if (typeof element.status !== 'string' || element.status.trim() === '') {
    failures.push(`${element.sourceElementId}: missing isolation status`)
  }
  if (
    ['paragraph', 'heading'].includes(element.elementType) &&
    typeof element.paragraphStyleId !== 'string'
  ) {
    failures.push(`${element.sourceElementId}: missing paragraphStyleId`)
  }
  if (element.elementType === 'paragraph') {
    if (!paragraphSemanticPolicy.sources[element.sourceAssetId]) {
      failures.push(
        `${element.sourceElementId}: source is missing from paragraph semantic policy`,
      )
    }
    const expectedSemantic = resolveImportedParagraphSemantic(
      element,
      paragraphSemanticPolicy,
    )
    if (element.paragraphSemantic !== expectedSemantic) {
      failures.push(
        `${element.sourceElementId}: paragraphSemantic expected ${expectedSemantic}, got ${element.paragraphSemantic}`,
      )
    }
  } else if (element.paragraphSemantic !== undefined) {
    failures.push(`${element.sourceElementId}: paragraphSemantic is only valid on paragraphs`)
  }
}

const expectedContentDocxTotals = {
  paragraphs: 2890,
  headings: 399,
  tables: 165,
  drawings: 977,
  media: 585,
  formulas: 24,
}
const contentDocxTotals = map.summary.contentDocxTotals
for (const [field, expected] of Object.entries(expectedContentDocxTotals)) {
  if (contentDocxTotals[field] !== expected) {
    failures.push(
      `content DOCX ${field}: expected ${expected}, got ${contentDocxTotals[field]}`,
    )
  }
}

const contentDocxIds = new Set(
  map.sourceSummaries.docx
    .filter((entry) => entry.contentDocument)
    .map((entry) => entry.sourceAssetId),
)
const contentElements = map.elements.filter((element) =>
  contentDocxIds.has(element.sourceAssetId),
)
const mediaElements = contentElements.filter(
  (element) => element.elementType === 'media',
)
const formulaElements = contentElements.filter(
  (element) => element.elementType === 'formula',
)
const tableElements = contentElements.filter(
  (element) => element.elementType === 'table',
)
if (mediaElements.length !== 585) {
  failures.push(`media elements: expected 585, got ${mediaElements.length}`)
}
if (formulaElements.length !== 24) {
  failures.push(`formula elements: expected 24, got ${formulaElements.length}`)
}
if (tableElements.length !== 165) {
  failures.push(`table elements: expected 165, got ${tableElements.length}`)
}

const mediaIds = new Set(mediaElements.map((element) => element.sourceElementId))
let orphanDrawings = 0
let incompletePlacements = 0
let duplicateOccurrenceIds = 0
let duplicatePlacementIds = 0
let drawingOrderErrors = 0
let floatPlacementWarnings = 0
const occurrenceIds = new Set()
const placementIds = new Set()
const relationsBySourcePart = new Map()
for (const relation of map.drawingRelations.filter((entry) =>
  contentDocxIds.has(entry.sourceAssetId),
)) {
  if (occurrenceIds.has(relation.occurrenceId)) duplicateOccurrenceIds += 1
  occurrenceIds.add(relation.occurrenceId)
  if (placementIds.has(relation.placementId)) duplicatePlacementIds += 1
  placementIds.add(relation.placementId)
  const placement = relation.placement
  const bodySlot = ['inline-after-anchor', 'float-after-anchor', 'table-cell'].includes(
    placement?.slot,
  )
  const sourcePartSlot = ['source-header', 'source-footer'].includes(
    placement?.slot,
  )
  const placementComplete =
    typeof relation.occurrenceId === 'string' &&
    relation.occurrenceId === relation.sourceRelationId &&
    typeof relation.placementId === 'string' &&
    placement?.placementId === relation.placementId &&
    placement?.occurrenceId === relation.occurrenceId &&
    placement?.sourceElementId === relation.sourceElementId &&
    relation.sourceElementId === relation.targetMediaElementId &&
    placement?.part === relation.sourcePosition?.part &&
    ['body', 'header', 'footer'].includes(placement?.partKind) &&
    Number.isInteger(placement?.relationshipOrdinal) &&
    Number.isInteger(placement?.drawingOrdinal) &&
    Number.isInteger(placement?.partOrdinal) &&
    Array.isArray(placement?.pageIds) &&
    placement.pageIds.length === relation.targetPageIds.length &&
    placement.pageIds.every((pageId) => relation.targetPageIds.includes(pageId)) &&
    placement.pageId === relation.pageId &&
    ((placement?.partKind === 'body' && bodySlot) ||
      (placement?.partKind === 'header' && placement?.slot === 'source-header') ||
      (placement?.partKind === 'footer' && placement?.slot === 'source-footer')) &&
    (bodySlot
      ? Number.isInteger(placement?.bodyOrdinal) &&
        typeof placement?.pageId === 'string' &&
        relation.targetPageIds.includes(placement.pageId) &&
        placement?.anchor?.sourceElementId
      : sourcePartSlot &&
        placement?.bodyOrdinal === null &&
        placement?.pageId === null &&
        placement?.anchor === null)
  if (!placementComplete) {
    incompletePlacements += 1
    failures.push(`${relation.sourceRelationId}: occurrence placement is incomplete`)
  }
  if (placement?.slot === 'table-cell') {
    for (const error of tableCellPlacementErrors(placement.tableCell)) {
      failures.push(`${relation.sourceRelationId}: ${error}`)
    }
    if (JSON.stringify(relation.tableCell) !== JSON.stringify(placement.tableCell)) {
      failures.push(`${relation.sourceRelationId}: relation and placement tableCell differ`)
    }
  } else if (relation.tableCell !== undefined || placement?.tableCell !== undefined) {
    failures.push(`${relation.sourceRelationId}: non-cell placement carries tableCell metadata`)
  }
  const sourcePartKey = `${relation.sourceAssetId}#${relation.sourcePosition?.part}`
  const sourcePartRelations = relationsBySourcePart.get(sourcePartKey) ?? []
  sourcePartRelations.push(relation)
  relationsBySourcePart.set(sourcePartKey, sourcePartRelations)
  if (placement?.slot === 'float-after-anchor') {
    const hasWarning = (relation.diagnostics ?? []).some(
      (item) => item.severity === 'warning' && item.code === 'float-after-anchor',
    )
    if (!hasWarning) {
      failures.push(`${relation.sourceRelationId}: floating placement lacks machine warning`)
    } else {
      floatPlacementWarnings += 1
    }
  }
  const resolved =
    ['media', 'layout', 'non-media-relationship'].includes(
      relation.resolution,
    ) &&
    DISPOSITIONS.includes(relation.disposition) &&
    typeof relation.reason === 'string' &&
    relation.reason.trim() !== ''
  const mediaTargetValid =
    relation.resolution !== 'media' ||
    (relation.targetMediaElementId &&
      mediaIds.has(relation.targetMediaElementId))
  if (!resolved || !mediaTargetValid) orphanDrawings += 1
}
const contentDrawingRelations = map.drawingRelations.filter((entry) =>
  contentDocxIds.has(entry.sourceAssetId),
)
if (contentDrawingRelations.length !== 977) {
  failures.push(
    `drawing relations: expected 977, got ${contentDrawingRelations.length}`,
  )
}
if (orphanDrawings !== 0) {
  failures.push(`orphan drawing relations: ${orphanDrawings}`)
}
if (duplicateOccurrenceIds !== 0) {
  failures.push(`duplicate occurrence IDs: ${duplicateOccurrenceIds}`)
}
if (duplicatePlacementIds !== 0) {
  failures.push(`duplicate placement IDs: ${duplicatePlacementIds}`)
}
for (const [sourcePartKey, relations] of relationsBySourcePart) {
  const ordinals = relations
    .map((relation) => relation.placement?.partOrdinal)
    .filter(Number.isInteger)
    .sort((left, right) => left - right)
  for (let index = 0; index < ordinals.length; index += 1) {
    if (ordinals[index] !== index + 1) {
      drawingOrderErrors += 1
      failures.push(`${sourcePartKey}: drawing part ordinals are not contiguous`)
      break
    }
  }
}
if (drawingOrderErrors !== 0) {
  failures.push(`drawing order errors: ${drawingOrderErrors}`)
}

let orphanMedia = 0
for (const media of mediaElements) {
  if (
    !/^[a-f0-9]{64}$/.test(media.sha256) ||
    !Array.isArray(media.relationships) ||
    media.targetPageIds.length === 0 ||
    media.targetAssetIds.length === 0
  ) {
    orphanMedia += 1
  }
}
if (orphanMedia !== 0) failures.push(`orphan media elements: ${orphanMedia}`)

let formulaWithoutEquivalent = 0
for (const formula of formulaElements) {
  if (
    !formula.equivalent ||
    typeof formula.equivalent.value !== 'string' ||
    formula.equivalent.value.trim() === '' ||
    !formula.equivalent.reviewStatus
  ) {
    formulaWithoutEquivalent += 1
  }
}
if (formulaWithoutEquivalent !== 0) {
  failures.push(`formula elements without accessible equivalent: ${formulaWithoutEquivalent}`)
}

let tableWithoutDisposition = 0
for (const table of tableElements) {
  if (
    !DISPOSITIONS.includes(table.disposition) ||
    (table.targetPageIds.length === 0 &&
      table.disposition !== 'internal-only' &&
      table.disposition !== 'omitted-with-rationale')
  ) {
    tableWithoutDisposition += 1
  }
}
if (tableWithoutDisposition !== 0) {
  failures.push(`table elements without mapped disposition: ${tableWithoutDisposition}`)
}

let staleCoreOverviewTargets = 0
let invalidCoreSplitTargets = 0
const coreOverviewIds = new Set(
  [
    ...coreMigration.editorialOverviews,
    ...advancedMigration.editorialOverviews,
  ].map((page) => page.pageId),
)
const pageMigrationSources = [
  ...coreMigration.sources,
  ...advancedMigration.sources,
]
for (const source of pageMigrationSources) {
  const allowedTargets = new Set(source.pages.map((page) => page.pageId))
  const sourceEntries = [
    ...map.elements.filter(
      (entry) => entry.sourceAssetId === source.sourceAssetId,
    ),
    ...map.drawingRelations.filter(
      (entry) => entry.sourceAssetId === source.sourceAssetId,
    ),
  ]
  for (const entry of sourceEntries) {
    for (const targetPageId of entry.targetPageIds) {
      if (coreOverviewIds.has(targetPageId)) {
        staleCoreOverviewTargets += 1
        failures.push(
          `${entry.sourceElementId ?? entry.sourceRelationId}: stale core overview target ${targetPageId}`,
        )
      }
      if (!allowedTargets.has(targetPageId)) {
        invalidCoreSplitTargets += 1
        failures.push(
          `${entry.sourceElementId ?? entry.sourceRelationId}: target ${targetPageId} is outside the core split ledger`,
        )
      }
    }
    const bodyIndex = entry.sourcePosition?.bodyIndex
    const tableIndex = entry.sourcePosition?.tableIndex
    const owningPage =
      Number.isInteger(bodyIndex)
        ? source.pages.find(
            (page) =>
              bodyIndex >= page.sourceElementRange.bodyIndexStart &&
              bodyIndex < page.sourceElementRange.bodyIndexEndExclusive,
          )
        : Number.isInteger(tableIndex)
          ? source.pages.find(
              (page) =>
                tableIndex >= page.sourceElementRange.tableIndexStart &&
                tableIndex < page.sourceElementRange.tableIndexEndExclusive,
            )
          : null
    if (
      owningPage &&
      (entry.targetPageIds.length !== 1 ||
        entry.targetPageIds[0] !== owningPage.pageId)
    ) {
      invalidCoreSplitTargets += 1
      failures.push(
        `${entry.sourceElementId ?? entry.sourceRelationId}: expected owning page ${owningPage.pageId}`,
      )
    }
    const mediaRelationTargets =
      entry.elementType === 'media'
        ? new Set(
            map.drawingRelations
              .filter(
                (relation) =>
                  relation.targetMediaElementId === entry.sourceElementId,
              )
              .flatMap((relation) => relation.targetPageIds),
          )
        : new Set()
    const expectedUnlocatedTargets =
      mediaRelationTargets.size > 0 ? mediaRelationTargets : allowedTargets
    if (
      !owningPage &&
      (entry.targetPageIds.length !== expectedUnlocatedTargets.size ||
        entry.targetPageIds.some(
          (targetPageId) => !expectedUnlocatedTargets.has(targetPageId),
        ))
    ) {
      invalidCoreSplitTargets += 1
      failures.push(
        `${entry.sourceElementId ?? entry.sourceRelationId}: unresolved placement targets do not match drawing evidence or all split-page candidates`,
      )
    }
  }
  const summary = map.sourceSummaries.docx.find(
    (entry) => entry.sourceAssetId === source.sourceAssetId,
  )
  if (
    !summary ||
    summary.targetPageIds.length !== allowedTargets.size ||
    summary.targetPageIds.some((target) => !allowedTargets.has(target))
  ) {
    invalidCoreSplitTargets += 1
    failures.push(
      `${source.sourceAssetId}: DOCX summary does not match core split pages`,
    )
  }
}

const worksheetElements = map.elements.filter(
  (element) => element.elementType === 'worksheet',
)
if (worksheetElements.length !== 7) {
  failures.push(`worksheet elements: expected 7, got ${worksheetElements.length}`)
}
if (map.dataRecords.length !== 225) {
  failures.push(`XLSX records: expected 225, got ${map.dataRecords.length}`)
}
const duplicateRecordIds = map.dataRecords.filter(
  (record, index, records) =>
    records.findIndex((candidate) => candidate.recordId === record.recordId) !==
    index,
)
if (duplicateRecordIds.length !== 0) {
  failures.push(`duplicate XLSX record IDs: ${duplicateRecordIds.length}`)
}

const report = {
  schemaVersion: 1,
  checks: {
    assetCoverage: {
      expected: 29,
      actual: map.assets.length,
      byType: map.summary.sourceAssetsByType,
    },
    contentDocxTotals,
    elementIds: {
      total: allElementIds.length,
      duplicates: new Set(duplicateElementIds).size,
    },
    dispositions: {
      allowed: DISPOSITIONS,
      invalid: invalidDispositions,
      omittedWithoutReason,
      unmapped: map.elements.filter((element) => !element.disposition).length,
    },
    drawingMedia: {
      drawingRelations: contentDrawingRelations.length,
      mediaElements: mediaElements.length,
      orphanDrawings,
      orphanMedia,
      incompletePlacements,
      duplicateOccurrenceIds,
      duplicatePlacementIds,
      drawingOrderErrors,
      floatPlacementWarnings,
    },
    formulas: {
      total: formulaElements.length,
      withoutEquivalent: formulaWithoutEquivalent,
    },
    tables: {
      total: tableElements.length,
      withoutMappedDisposition: tableWithoutDisposition,
    },
    pageOwnership: {
      sources: pageMigrationSources.length,
      staleOverviewTargets: staleCoreOverviewTargets,
      invalidTargets: invalidCoreSplitTargets,
    },
    xlsx: {
      worksheets: worksheetElements.length,
      records: map.dataRecords.length,
      duplicateRecordIds: duplicateRecordIds.length,
    },
    failureIsolation: {
      entriesWithStatus: map.elements.filter(
        (element) =>
          typeof element.status === 'string' && element.status.trim() !== '',
      ).length,
      entries: map.elements.length,
    },
  },
  failures,
}

const reportPath = await writeReport('full-content-map', report)
printResult('Full content map validation', failures, reportPath)

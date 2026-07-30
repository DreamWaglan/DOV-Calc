import { readFile } from 'node:fs/promises'
import Ajv from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import {
  DISPOSITIONS,
  SOURCE_ELEMENT_TYPES,
  dispositionErrors,
  loadSourceLedger,
} from './lib/migration-elements.mjs'
import { printResult, writeReport } from './lib/content-utils.mjs'

const map = JSON.parse(
  await readFile('content/migrations/full-content-map.json', 'utf8'),
)
const schema = JSON.parse(
  await readFile('content/schemas/full-content-map.schema.json', 'utf8'),
)
const ledger = await loadSourceLedger()
const coreMigration = JSON.parse(
  await readFile('content/migrations/core-content-pages.json', 'utf8'),
)
const failures = []

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
for (const relation of map.drawingRelations.filter((entry) =>
  contentDocxIds.has(entry.sourceAssetId),
)) {
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
  coreMigration.editorialOverviews.map((page) => page.pageId),
)
for (const source of coreMigration.sources) {
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
    if (!owningPage && entry.targetPageIds.length !== allowedTargets.size) {
      invalidCoreSplitTargets += 1
      failures.push(
        `${entry.sourceElementId ?? entry.sourceRelationId}: unresolved placement must retain all ${allowedTargets.size} split-page candidates`,
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
    },
    formulas: {
      total: formulaElements.length,
      withoutEquivalent: formulaWithoutEquivalent,
    },
    tables: {
      total: tableElements.length,
      withoutMappedDisposition: tableWithoutDisposition,
    },
    coreSplitOwnership: {
      sources: coreMigration.sources.length,
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

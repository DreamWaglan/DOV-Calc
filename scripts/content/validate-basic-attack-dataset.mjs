import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { printResult, writeReport } from './lib/content-utils.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const relativePaths = {
  dataset: 'docs/.vitepress/data/basic-attack-data.json',
  schema: 'content/schemas/basic-attack-dataset.schema.json',
  imported: 'content/imports/xlsx/basic-attack/records.json',
  importReport: 'content/imports/xlsx/basic-attack/import-report.json',
  ledger: 'content/governance/source-assets.json',
  review: 'content/governance/dataset-reviews/basic-attack.json',
  overview: 'docs/data/basic-attack-cd.md',
  tool: 'docs/tools/basic-attack-lookup.md',
  component: 'docs/.vitepress/components/BasicAttackExplorer.vue',
  config: 'docs/.vitepress/config.mts',
}

function absolute(relativePath) {
  return path.join(root, relativePath)
}

async function readText(relativePath) {
  return readFile(absolute(relativePath), 'utf8')
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath))
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function stableComparable(value) {
  return JSON.stringify(value)
}

const failures = []
const [
  datasetSource,
  schema,
  importedSource,
  importReport,
  ledger,
  review,
  overview,
  tool,
  component,
  config,
] = await Promise.all([
  readText(relativePaths.dataset),
  readJson(relativePaths.schema),
  readText(relativePaths.imported),
  readJson(relativePaths.importReport),
  readJson(relativePaths.ledger),
  readJson(relativePaths.review),
  readText(relativePaths.overview),
  readText(relativePaths.tool),
  readText(relativePaths.component).catch(() => ''),
  readText(relativePaths.config),
])
const dataset = JSON.parse(datasetSource)
const imported = JSON.parse(importedSource)
const sourceAsset = ledger.assets.find(
  (asset) => asset.id === dataset.metadata?.sourceAssetId,
)

const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)
if (!validate(dataset)) {
  for (const error of validate.errors ?? []) {
    failures.push(
      `${relativePaths.dataset}${error.instancePath || '/'} ${error.message}`,
    )
  }
}

if (!sourceAsset) {
  failures.push('canonical dataset source asset is missing from the ledger')
} else {
  if (sourceAsset.permission !== 'authorized') {
    failures.push('canonical dataset source asset is not authorized')
  }
  if (sourceAsset.status !== 'approved') {
    failures.push('canonical dataset source asset is not approved')
  }
  if (sourceAsset.publicRelease?.structuredData !== true) {
    failures.push('source asset does not permit structured-data publication')
  }
  if (
    sourceAsset.publicRelease?.download !== false ||
    sourceAsset.publicRelease?.asset !== false
  ) {
    failures.push('source asset public boundary permits an unexpected download')
  }
}

const expectedSourceHash = review.evidence?.sourceSha256
for (const [label, value] of [
  ['source ledger', sourceAsset?.hashes?.sha256],
  ['import records', imported.source?.sha256],
  ['import report', importReport.source?.sha256],
  ['canonical dataset', dataset.integrity?.sourceSha256],
]) {
  if (value !== expectedSourceHash) {
    failures.push(`${label} source hash does not match the reviewed source`)
  }
}
const actualImportHash = sha256(importedSource)
for (const [label, value] of [
  ['review', review.evidence?.importRecordsSha256],
  ['import report', importReport.outputs?.records?.sha256],
  ['canonical dataset', dataset.integrity?.importRecordsSha256],
]) {
  if (value !== actualImportHash) {
    failures.push(`${label} import record hash does not match the current import`)
  }
}
if (
  review.decision?.status !== 'approved' ||
  review.decision?.publicationMode !== 'source-faithful-structured-data'
) {
  failures.push('dataset does not have the required explicit review decision')
}

if (dataset.metadata?.worksheetCount !== 7 || dataset.worksheets?.length !== 7) {
  failures.push('canonical dataset must contain exactly 7 worksheets')
}
if (dataset.metadata?.recordCount !== 225 || dataset.records?.length !== 225) {
  failures.push('canonical dataset must contain exactly 225 records')
}
if (imported.totalRecords !== dataset.records?.length) {
  failures.push('internal import and public dataset record counts differ')
}

const fieldByName = new Map()
for (const field of dataset.fields ?? []) {
  if (fieldByName.has(field.name)) {
    failures.push(`duplicate field definition: ${field.name}`)
  }
  fieldByName.set(field.name, field)
  if (!field.description || !Object.hasOwn(field, 'unit')) {
    failures.push(`incomplete field dictionary entry: ${field.name}`)
  }
}
if (dataset.metadata?.fieldCount !== fieldByName.size) {
  failures.push('field dictionary count does not match metadata')
}

const ids = new Set()
const sourceElementIds = new Set()
const worksheetByName = new Map(
  (dataset.worksheets ?? []).map((worksheet) => [worksheet.name, worksheet]),
)
const worksheetCounts = new Map()
for (const [index, record] of (dataset.records ?? []).entries()) {
  if (ids.has(record.id)) failures.push(`duplicate record id: ${record.id}`)
  ids.add(record.id)
  if (sourceElementIds.has(record.sourceElementId)) {
    failures.push(`duplicate source element id: ${record.sourceElementId}`)
  }
  sourceElementIds.add(record.sourceElementId)
  worksheetCounts.set(
    record.worksheet,
    (worksheetCounts.get(record.worksheet) ?? 0) + 1,
  )
  if (record.category !== record.worksheet) {
    failures.push(`${record.id}: category and worksheet differ`)
  }
  if (
    record.values?.worksheet !== record.worksheet ||
    record.values?.worksheetRow !== record.worksheetRow
  ) {
    failures.push(`${record.id}: flattened worksheet fields drifted`)
  }
  for (const [fieldName, value] of Object.entries(record.values ?? {})) {
    const field = fieldByName.get(fieldName)
    if (!field) {
      failures.push(`${record.id}: undefined field ${fieldName}`)
      continue
    }
    if (value === null) {
      if (!field.nullable) {
        failures.push(`${record.id}: non-nullable field ${fieldName} is null`)
      }
      continue
    }
    if (typeof value !== field.type) {
      failures.push(
        `${record.id}: ${fieldName} expected ${field.type}, got ${typeof value}`,
      )
    }
  }

  const importedRecord = imported.records[index]
  const expectedProjection = {
    id: importedRecord?.id,
    sourceElementId: importedRecord?.sourceElementId,
    name: importedRecord?.name,
    category: importedRecord?.category,
    worksheet: importedRecord?.values?.worksheet,
    worksheetRow: importedRecord?.values?.worksheetRow,
    applicableVersion: importedRecord?.applicableVersion,
    verifiedAt: importedRecord?.verifiedAt,
    sourceRefs: importedRecord?.sourceRefs,
    status: 'current',
    disposition: 'published',
    values: importedRecord?.values,
  }
  if (stableComparable(record) !== stableComparable(expectedProjection)) {
    failures.push(`${record.id}: public projection differs from internal import`)
  }

  const previous = dataset.records[index - 1]
  if (previous) {
    const previousWorksheet = worksheetByName.get(previous.worksheet)
    const currentWorksheet = worksheetByName.get(record.worksheet)
    const stableOrder =
      previousWorksheet.order < currentWorksheet.order ||
      (previousWorksheet.order === currentWorksheet.order &&
        (previous.worksheetRow < record.worksheetRow ||
          (previous.worksheetRow === record.worksheetRow &&
            previous.id.localeCompare(record.id) <= 0)))
    if (!stableOrder) {
      failures.push(`${record.id}: canonical default ordering is not stable`)
    }
  }
}

for (const worksheet of dataset.worksheets ?? []) {
  if (worksheetCounts.get(worksheet.name) !== worksheet.recordCount) {
    failures.push(`${worksheet.name}: worksheet record count drift`)
  }
  if (
    review.evidence?.expectedWorksheetRecords?.[worksheet.name] !==
    worksheet.recordCount
  ) {
    failures.push(`${worksheet.name}: worksheet count differs from review`)
  }
  const worksheetPagePath = `docs/data/basic-attacks/${worksheet.slug}.md`
  const worksheetPage = await readText(worksheetPagePath).catch(() => null)
  if (!worksheetPage) {
    failures.push(`${worksheetPagePath}: generated worksheet page is missing`)
    continue
  }
  const worksheetRecords = dataset.records.filter(
    (record) => record.worksheet === worksheet.name,
  )
  for (const record of worksheetRecords) {
    if (!worksheetPage.includes(record.name)) {
      failures.push(`${worksheetPagePath}: missing entity ${record.name}`)
    }
  }
}

if (
  sha256(JSON.stringify(dataset.fields)) !==
  dataset.integrity?.fieldDictionarySha256
) {
  failures.push('field dictionary integrity hash is invalid')
}
if (
  sha256(JSON.stringify(dataset.records)) !== dataset.integrity?.recordsSha256
) {
  failures.push('record-set integrity hash is invalid')
}

for (const [relativePath, page] of [
  [relativePaths.overview, overview],
  [relativePaths.tool, tool],
]) {
  if (!page.includes('status: current')) {
    failures.push(`${relativePath}: page is not current`)
  }
  if (!/<BasicAttackExplorer(?:\s[^>]*)?\s*\/>/.test(page)) {
    failures.push(`${relativePath}: page does not use the shared explorer`)
  }
  if (!page.includes(String(dataset.metadata.recordCount))) {
    failures.push(`${relativePath}: page does not expose the canonical count`)
  }
  if (!page.includes(String(dataset.metadata.version))) {
    failures.push(`${relativePath}: page does not expose the canonical version`)
  }
  if (/\]\([^)]*\.(?:xlsx|json|csv)(?:[?#][^)]*)?\)/i.test(page)) {
    failures.push(`${relativePath}: page exposes a forbidden dataset download`)
  }
}
if (!component.includes("basic-attack-data.json")) {
  failures.push(
    `${relativePaths.component}: explorer does not import the canonical dataset`,
  )
}
if (
  !config.includes("basic-attack-data.json") ||
  !config.includes('basicAttackData')
) {
  failures.push(
    `${relativePaths.config}: local search does not consume canonical entity data`,
  )
}

const report = {
  schemaVersion: 1,
  check: 'basic-attack-dataset',
  summary: {
    worksheets: dataset.worksheets?.length ?? 0,
    records: dataset.records?.length ?? 0,
    fields: dataset.fields?.length ?? 0,
    duplicateIds: (dataset.records?.length ?? 0) - ids.size,
    duplicateSourceElementIds:
      (dataset.records?.length ?? 0) - sourceElementIds.size,
    internalPublicCountDifference:
      imported.totalRecords - (dataset.records?.length ?? 0),
    failures: failures.length,
  },
  integrity: dataset.integrity,
  review: {
    status: review.decision?.status,
    publicationMode: review.decision?.publicationMode,
    approvedAt: review.decision?.approvedAt,
  },
  failures,
}
const outputPath = await writeReport('basic-attack-dataset', report)
printResult('Basic attack dataset validation', failures, outputPath)

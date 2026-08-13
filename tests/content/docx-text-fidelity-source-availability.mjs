import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { strToU8, zipSync } from 'fflate'

const validatorPath = 'scripts/content/validate-docx-text-fidelity.mjs'
const reportPath = 'content/reports/docx-text-fidelity.json'
const sourceLedgerPath = 'content/governance/source-assets.json'
const importReportPath = 'content/reports/docx-import.json'
const sourceLedger = JSON.parse(await readFile(sourceLedgerPath, 'utf8'))
const firstDocxAsset = sourceLedger.assets.find(
  (asset) => asset.assetType === 'docx',
)

assert.ok(firstDocxAsset, 'source ledger must register at least one DOCX asset')

function runValidator(sourceRoot, env = {}) {
  return spawnSync(process.execPath, [validatorPath], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      CONTENT_SOURCE_ROOT: sourceRoot,
      ...env,
    },
    encoding: 'utf8',
    windowsHide: true,
  })
}

async function readReport() {
  return JSON.parse(await readFile(reportPath, 'utf8'))
}

function assertSourceSummary(report, expected) {
  assert.deepEqual(
    {
      registeredSources: report.summary.registeredSources,
      validatedSources: report.summary.validatedSources,
      skippedSources: report.summary.skippedSources,
      failedSources: report.summary.failedSources,
      failures: report.summary.failures,
      perSource: report.perSource.length,
    },
    expected,
  )
}

const missingSourceRoot = path.join(
  process.cwd(),
  `.missing-docx-source-root-${process.pid}`,
)
const missingRootResult = runValidator(missingSourceRoot)

assert.equal(
  missingRootResult.status,
  0,
  `validator must allow an unavailable external source root:\n${missingRootResult.stdout}\n${missingRootResult.stderr}`,
)

const missingRootReport = await readReport()
assert.equal(missingRootReport.sourceRootAvailable, false)
assertSourceSummary(missingRootReport, {
  registeredSources: 13,
  validatedSources: 0,
  skippedSources: 13,
  failedSources: 0,
  failures: 0,
  perSource: 13,
})
assert.ok(
  missingRootReport.perSource.every(
    (source) =>
      source.status === 'skipped' &&
      source.skipReason === 'source-root-unavailable' &&
      source.failureReason === null,
  ),
)

const emptySourceRoot = await mkdtemp(
  path.join(os.tmpdir(), 'dov-docx-source-root-'),
)
try {
  const partialSourceResult = runValidator(emptySourceRoot)
  assert.notEqual(
    partialSourceResult.status,
    0,
    'validator must reject an available source root with missing registered DOCX files',
  )

  const partialSourceReport = await readReport()
  assert.equal(partialSourceReport.sourceRootAvailable, true)
  assertSourceSummary(partialSourceReport, {
    registeredSources: 13,
    validatedSources: 0,
    skippedSources: 0,
    failedSources: 13,
    failures: 13,
    perSource: 13,
  })
  assert.ok(
    partialSourceReport.perSource.every(
      (source) =>
        source.status === 'failed' &&
        source.skipReason === null &&
        source.failureReason === 'source-file-unavailable',
    ),
  )
} finally {
  await rm(emptySourceRoot, { recursive: true, force: true })
}

const corruptSourceRoot = await mkdtemp(
  path.join(os.tmpdir(), 'dov-corrupt-docx-source-root-'),
)
try {
  const corruptSourcePath = path.join(
    corruptSourceRoot,
    firstDocxAsset.origin.path,
  )
  await mkdir(path.dirname(corruptSourcePath), { recursive: true })
  await writeFile(corruptSourcePath, 'not a valid DOCX archive')

  const corruptSourceResult = runValidator(corruptSourceRoot)
  assert.notEqual(
    corruptSourceResult.status,
    0,
    'validator must reject a corrupt registered DOCX file',
  )

  const corruptSourceReport = await readReport()
  assert.equal(corruptSourceReport.sourceRootAvailable, true)
  assertSourceSummary(corruptSourceReport, {
    registeredSources: 13,
    validatedSources: 0,
    skippedSources: 0,
    failedSources: 13,
    failures: 14,
    perSource: 13,
  })

  const corruptSource = corruptSourceReport.perSource.find(
    (source) => source.sourceAssetId === firstDocxAsset.id,
  )
  assert.equal(corruptSource?.status, 'failed')
  assert.equal(corruptSource?.skipReason, null)
  assert.equal(corruptSource?.failureReason, 'source-file-corrupt')
} finally {
  await rm(corruptSourceRoot, { recursive: true, force: true })
}

const missingImportRoot = await mkdtemp(
  path.join(os.tmpdir(), 'dov-missing-import-report-source-root-'),
)
try {
  const sourcePath = path.join(missingImportRoot, firstDocxAsset.origin.path)
  await mkdir(path.dirname(sourcePath), { recursive: true })
  await writeFile(
    sourcePath,
    zipSync({
      'word/document.xml': strToU8(
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body /></w:document>',
      ),
    }),
  )

  const aggregateImportReport = JSON.parse(
    await readFile(importReportPath, 'utf8'),
  )
  aggregateImportReport.assets = aggregateImportReport.assets.filter(
    (asset) => asset.assetId !== firstDocxAsset.id,
  )
  const temporaryImportReportPath = path.join(
    missingImportRoot,
    'docx-import-with-missing-entry.json',
  )
  await writeFile(
    temporaryImportReportPath,
    `${JSON.stringify(aggregateImportReport)}\n`,
  )

  const missingImportResult = runValidator(missingImportRoot, {
    DOCX_IMPORT_REPORT_PATH: temporaryImportReportPath,
  })
  assert.notEqual(
    missingImportResult.status,
    0,
    'validator must reject a missing aggregate DOCX import entry',
  )

  const missingImportReport = await readReport()
  assert.equal(missingImportReport.sourceRootAvailable, true)
  assertSourceSummary(missingImportReport, {
    registeredSources: 13,
    validatedSources: 0,
    skippedSources: 0,
    failedSources: 13,
    failures: 14,
    perSource: 13,
  })

  const missingImportSource = missingImportReport.perSource.find(
    (source) => source.sourceAssetId === firstDocxAsset.id,
  )
  assert.equal(missingImportSource?.status, 'failed')
  assert.equal(missingImportSource?.skipReason, null)
  assert.equal(
    missingImportSource?.failureReason,
    'import-report-entry-missing',
  )
} finally {
  await rm(missingImportRoot, { recursive: true, force: true })
}

console.log('docx text fidelity source availability tests passed.')

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'

const validator = path.resolve('scripts/content/validate-media-library.mjs')
const reportPath = path.resolve('content/reports/media-library.json')

function runValidator(sourceRoot) {
  return spawnSync(process.execPath, [validator], {
    cwd: process.cwd(),
    env: { ...process.env, CONTENT_SOURCE_ROOT: sourceRoot },
    encoding: 'utf8',
    windowsHide: true,
  })
}

async function readReport() {
  return JSON.parse(await readFile(reportPath, 'utf8'))
}

const temporaryRoot = await mkdtemp(
  path.join(tmpdir(), 'dov-media-source-availability-'),
)

try {
  const missingRoot = path.join(temporaryRoot, 'missing')
  const missingResult = runValidator(missingRoot)
  assert.equal(
    missingResult.status,
    0,
    `missing source root must not block CI:\n${missingResult.stdout}\n${missingResult.stderr}`,
  )
  const missingReport = await readReport()
  assert.equal(missingReport.sourceRootAvailable, false)
  assert.equal(missingReport.summary.verifiedStandaloneSourceBytes, 0)
  assert.equal(missingReport.summary.verifiedDocxPackageMedia, 0)
  assert.equal(missingReport.summary.skippedStandaloneSourceBytes, 15)
  assert.equal(missingReport.summary.skippedDocxPackageMedia, 585)
  assert.equal(missingReport.summary.failures, 0)

  const partialResult = runValidator(temporaryRoot)
  assert.notEqual(
    partialResult.status,
    0,
    'an available but incomplete source root must fail strict validation',
  )
  const partialReport = await readReport()
  assert.equal(partialReport.sourceRootAvailable, true)
  assert.equal(partialReport.summary.verifiedStandaloneSourceBytes, 0)
  assert.equal(partialReport.summary.verifiedDocxPackageMedia, 0)
  assert.equal(partialReport.summary.skippedStandaloneSourceBytes, 0)
  assert.equal(partialReport.summary.skippedDocxPackageMedia, 0)
  assert.equal(partialReport.summary.failures, 24)

  const restoreResult = runValidator(missingRoot)
  assert.equal(
    restoreResult.status,
    0,
    `the regression must leave a passing no-source report:\n${restoreResult.stdout}\n${restoreResult.stderr}`,
  )
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}

console.log('media library source availability tests passed.')

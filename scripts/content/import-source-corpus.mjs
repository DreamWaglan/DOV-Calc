import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { importDocx } from './import-docx.mjs'
import { importXlsx } from './import-xlsx.mjs'
import { processImage } from './process-image.mjs'
import { loadSourceLedger } from './lib/migration-elements.mjs'
import { writeReport } from './lib/content-utils.mjs'

const DOCX_OUTPUTS = new Map([
  ['src-90f788a9def4', 'content/imports/docx/internal/project-plan'],
  ['src-9ac6e41a613e', 'content/imports/docx/core/preface'],
  ['src-ea0b63d069bf', 'content/imports/docx/core/game-intro'],
  ['src-842246bdb075', 'content/imports/docx/core/beginner'],
  ['src-6eba63c4aa7b', 'content/imports/docx/core/leveling'],
  ['src-d47e51aa8321', 'content/imports/docx/core/event-push'],
  ['src-94e76e4522b1', 'content/imports/docx/core/pve-team'],
  ['src-7d080e8d651b', 'content/imports/docx/arena'],
  ['src-d35e870ffcd7', 'content/imports/docx/advanced/encounter'],
  ['src-51475ba227c9', 'content/imports/docx/advanced/endless-sea'],
  ['src-c8852cf69a7b', 'content/imports/docx/advanced/damage-calculation'],
  ['src-e2d43eca15b2', 'content/imports/docx/advanced/laguz'],
  ['src-6d7a8eecd6bb', 'content/imports/docx/internal/word-template'],
])

function resolveSource(sourceRoot, relativePath) {
  const absoluteRoot = path.resolve(sourceRoot)
  const absolutePath = path.resolve(absoluteRoot, relativePath)
  const relative = path.relative(absoluteRoot, absolutePath)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Source path escapes the registered root: ${relativePath}`)
  }
  return absolutePath
}

function summarizeDocx(result) {
  return {
    assetId: result.assetId,
    source: result.source,
    permission: result.permission,
    authorizationEvidenceId: result.authorizationEvidenceId,
    reviewStatus: result.reviewStatus,
    publishable: result.publishable,
    counts: result.counts,
    elementCount: result.elements.length,
    drawingRelationCount: result.drawingRelations.length,
    outputs: result.outputs,
  }
}

async function loadCommittedImport(asset, reportPath) {
  const reportBytes = await readFile(reportPath)
  const report = JSON.parse(reportBytes.toString('utf8'))
  if (report.assetId !== asset.id) {
    throw new Error(
      `${reportPath}: expected asset ${asset.id}, got ${report.assetId ?? 'missing'}`,
    )
  }
  if (report.source?.sha256 !== asset.hashes.sha256) {
    throw new Error(
      `${reportPath}: source SHA-256 does not match the registered source asset`,
    )
  }
  if (
    report.permission !== asset.permission ||
    report.authorizationEvidenceId !== asset.authorization?.evidenceId
  ) {
    throw new Error(
      `${reportPath}: authorization metadata does not match the registered source asset`,
    )
  }
  if (report.outputs && path.basename(reportPath) === 'import-report.json') {
    report.outputs.report = {
      path: reportPath.split(path.sep).join('/'),
      sha256: createHash('sha256').update(reportBytes).digest('hex'),
      bytes: reportBytes.length,
    }
  }
  return report
}

const ledger = await loadSourceLedger()
const sourceRoot = ledger.sourceRoot.path
const useCommittedImports =
  process.env.DOV_USE_COMMITTED_IMPORTS === '1' ||
  process.argv.includes('--use-committed-imports')
const docxAssets = ledger.assets.filter((asset) => asset.assetType === 'docx')
const xlsxAssets = ledger.assets.filter((asset) => asset.assetType === 'xlsx')
const imageAssets = ledger.assets.filter((asset) => asset.assetType === 'image')

if (docxAssets.length !== 13 || xlsxAssets.length !== 1 || imageAssets.length !== 15) {
  throw new Error(
    `Expected 13 DOCX, 1 XLSX, and 15 images; got ${docxAssets.length}, ${xlsxAssets.length}, ${imageAssets.length}`,
  )
}

const docxResults = []
let committedDocxCount = 0
for (const asset of docxAssets) {
  const outputDir = DOCX_OUTPUTS.get(asset.id)
  if (!outputDir) throw new Error(`Missing DOCX output mapping for ${asset.id}`)
  const sourcePath = resolveSource(sourceRoot, asset.origin.path)
  const importFromSource = !useCommittedImports && existsSync(sourcePath)
  const result = importFromSource
    ? await importDocx({
        sourcePath,
        assetId: asset.id,
        outputDir,
      })
    : await loadCommittedImport(asset, path.join(outputDir, 'import-report.json'))
  if (!importFromSource) committedDocxCount += 1
  docxResults.push(summarizeDocx(result))
}

const xlsxAsset = xlsxAssets[0]
const xlsxSourcePath = resolveSource(sourceRoot, xlsxAsset.origin.path)
const xlsxOutputDir = 'content/imports/xlsx/basic-attack'
const importXlsxFromSource =
  !useCommittedImports && existsSync(xlsxSourcePath)
const xlsxResult = importXlsxFromSource
  ? await importXlsx({
      sourcePath: xlsxSourcePath,
      assetId: xlsxAsset.id,
      outputDir: xlsxOutputDir,
    })
  : await loadCommittedImport(
      xlsxAsset,
      path.join(xlsxOutputDir, 'import-report.json'),
    )
const committedXlsxCount = importXlsxFromSource ? 0 : 1

const imageResults = []
let committedImageCount = 0
for (const asset of imageAssets) {
  const sourcePath = resolveSource(sourceRoot, asset.origin.path)
  const outputDir = path.join(
    'content',
    'imports',
    'images',
    'source-ledger',
    asset.id,
  )
  const importFromSource = !useCommittedImports && existsSync(sourcePath)
  const result = importFromSource
    ? await processImage({
        sourcePath,
        assetId: asset.id,
        outputDir,
        generateDerivatives: false,
      })
    : await loadCommittedImport(asset, path.join(outputDir, 'manifest.json'))
  if (!importFromSource) committedImageCount += 1
  imageResults.push({
    assetId: result.assetId,
    source: result.source,
    sourceElement: result.sourceElement,
    permission: result.permission,
    authorizationEvidenceId: result.authorizationEvidenceId,
    reviewStatus: result.reviewStatus,
    publishable: result.publishable,
    originalCopied: result.originalCopied,
    derivativePolicy: result.derivativePolicy,
  })
}

await writeReport('docx-import', {
  schemaVersion: 1,
  expectedAssets: 13,
  actualAssets: docxResults.length,
  assets: docxResults,
})
await writeReport('xlsx-import', {
  schemaVersion: 1,
  expectedAssets: 1,
  actualAssets: 1,
  assetId: xlsxResult.assetId,
  permission: xlsxResult.permission,
  authorizationEvidenceId: xlsxResult.authorizationEvidenceId,
  reviewStatus: xlsxResult.reviewStatus,
  worksheetCount: xlsxResult.worksheetCount,
  totalRecords: xlsxResult.totalRecords,
  worksheetSummaries: xlsxResult.worksheetSummaries,
  outputs: xlsxResult.outputs,
})
await writeReport('media-import', {
  schemaVersion: 1,
  expectedStandaloneImages: 15,
  actualStandaloneImages: imageResults.length,
  assets: imageResults,
})

console.log(
  `Source corpus materialized: ${docxResults.length} DOCX, ${xlsxResult.worksheetCount} XLSX worksheets, ${imageResults.length} standalone images; committed fallback used for ${committedDocxCount} DOCX, ${committedXlsxCount} XLSX, and ${committedImageCount} images.`,
)

export { DOCX_OUTPUTS, resolveSource }

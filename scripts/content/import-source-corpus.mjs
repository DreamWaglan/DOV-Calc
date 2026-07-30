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

const ledger = await loadSourceLedger()
const sourceRoot = ledger.sourceRoot.path
const docxAssets = ledger.assets.filter((asset) => asset.assetType === 'docx')
const xlsxAssets = ledger.assets.filter((asset) => asset.assetType === 'xlsx')
const imageAssets = ledger.assets.filter((asset) => asset.assetType === 'image')

if (docxAssets.length !== 13 || xlsxAssets.length !== 1 || imageAssets.length !== 15) {
  throw new Error(
    `Expected 13 DOCX, 1 XLSX, and 15 images; got ${docxAssets.length}, ${xlsxAssets.length}, ${imageAssets.length}`,
  )
}

const docxResults = []
for (const asset of docxAssets) {
  const outputDir = DOCX_OUTPUTS.get(asset.id)
  if (!outputDir) throw new Error(`Missing DOCX output mapping for ${asset.id}`)
  const result = await importDocx({
    sourcePath: resolveSource(sourceRoot, asset.origin.path),
    assetId: asset.id,
    outputDir,
  })
  docxResults.push(summarizeDocx(result))
}

const xlsxAsset = xlsxAssets[0]
const xlsxResult = await importXlsx({
  sourcePath: resolveSource(sourceRoot, xlsxAsset.origin.path),
  assetId: xlsxAsset.id,
  outputDir: 'content/imports/xlsx/basic-attack',
})

const imageResults = []
for (const asset of imageAssets) {
  const result = await processImage({
    sourcePath: resolveSource(sourceRoot, asset.origin.path),
    assetId: asset.id,
    outputDir: path.join('content', 'imports', 'images', 'source-ledger', asset.id),
    generateDerivatives: false,
  })
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
  `Source corpus imported: ${docxResults.length} DOCX, ${xlsxResult.worksheetCount} XLSX worksheets, ${imageResults.length} standalone images.`,
)

export { DOCX_OUTPUTS, resolveSource }

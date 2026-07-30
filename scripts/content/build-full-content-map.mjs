import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  loadSourceLedger,
  stableJson,
} from './lib/migration-elements.mjs'

const root = process.cwd()
const outputPath = path.join(
  root,
  'content',
  'migrations',
  'full-content-map.json',
)

const DOCX_PAGE_TARGETS = new Map([
  ['src-9ac6e41a613e', 'start-preface'],
  ['src-ea0b63d069bf', 'start-game-introduction'],
  ['src-842246bdb075', 'start-first-week'],
  ['src-6eba63c4aa7b', 'progression-leveling'],
  ['src-d47e51aa8321', 'combat-event-maps'],
  ['src-94e76e4522b1', 'combat-pve-team-building'],
  ['src-7d080e8d651b', 'combat-pvp-arena'],
  ['src-d35e870ffcd7', 'combat-encounter'],
  ['src-51475ba227c9', 'combat-endless-sea'],
  ['src-c8852cf69a7b', 'mechanics-damage-model'],
  ['src-e2d43eca15b2', 'topic-laguz'],
])

function reviewersFor(asset) {
  return {
    editor: asset.owners?.[0]?.name ?? 'DOV-Calc 内容维护组',
    factReviewer: asset.reviewers?.[1]?.name ?? 'DOV-Calc 事实审核组',
  }
}

function migrationDecision(asset, element, targetPageId) {
  const internal = asset.publicRelease.mode === 'blocked'
  const targetAssetIds =
    element.elementType === 'media'
      ? [`wiki-media-${element.sha256.slice(0, 16)}`]
      : []
  const disposition = internal ? 'internal-only' : 'merged'
  const notes = internal
    ? 'Internal governance or template material is inventoried but excluded from public Wiki content.'
    : element.elementType === 'formula'
      ? 'Mapped to the target page; exact KaTeX/text transcription remains a Phase 4 fact-review task.'
      : element.elementType === 'media'
        ? 'Mapped by OOXML package path, relationship IDs, and source hash; responsive derivatives remain a Phase 5 task.'
        : 'Mapped to the target page for the owning editorial phase.'
  return {
    ...element,
    targetPageIds: Array.isArray(targetPageId)
      ? targetPageId
      : targetPageId
        ? [targetPageId]
        : [],
    targetAssetIds,
    disposition,
    authorizationEvidenceId: asset.authorization.evidenceId,
    ...reviewersFor(asset),
    status: internal ? 'internal-only' : 'mapped-pending-editorial-review',
    notes,
  }
}

const ledger = await loadSourceLedger()
const assetsById = new Map(ledger.assets.map((asset) => [asset.id, asset]))
const docxImport = JSON.parse(
  await readFile(path.join(root, 'content', 'reports', 'docx-import.json'), 'utf8'),
)
const xlsxImport = JSON.parse(
  await readFile(path.join(root, 'content', 'reports', 'xlsx-import.json'), 'utf8'),
)
const mediaImport = JSON.parse(
  await readFile(path.join(root, 'content', 'reports', 'media-import.json'), 'utf8'),
)
const coreMigration = JSON.parse(
  await readFile(
    path.join(root, 'content', 'migrations', 'core-content-pages.json'),
    'utf8',
  ),
)
const advancedMigration = JSON.parse(
  await readFile(
    path.join(root, 'content', 'migrations', 'advanced-content-pages.json'),
    'utf8',
  ),
)
const pageSourceById = new Map(
  [...coreMigration.sources, ...advancedMigration.sources].map((source) => [
    source.sourceAssetId,
    source,
  ]),
)

function targetPagesForPosition(sourceAssetId, sourcePosition, fallbackPageId) {
  const pageSource = pageSourceById.get(sourceAssetId)
  if (!pageSource) return fallbackPageId ? [fallbackPageId] : []
  const allPageIds = pageSource.pages.map((page) => page.pageId)
  const bodyIndex = sourcePosition?.bodyIndex
  if (Number.isInteger(bodyIndex)) {
    const page = pageSource.pages.find(
      (candidate) =>
        bodyIndex >= candidate.sourceElementRange.bodyIndexStart &&
        bodyIndex < candidate.sourceElementRange.bodyIndexEndExclusive,
    )
    if (!page) {
      throw new Error(
        `${element.sourceElementId}: no core page owns body index ${bodyIndex}`,
      )
    }
    return [page.pageId]
  }
  const tableIndex = sourcePosition?.tableIndex
  if (Number.isInteger(tableIndex)) {
    const page = pageSource.pages.find(
      (candidate) =>
        tableIndex >= candidate.sourceElementRange.tableIndexStart &&
        tableIndex < candidate.sourceElementRange.tableIndexEndExclusive,
    )
    if (!page) {
      throw new Error(
        `${element.sourceElementId}: no core page owns table index ${tableIndex}`,
      )
    }
    return [page.pageId]
  }
  return allPageIds
}

function targetPagesForElement(
  sourceAssetId,
  element,
  fallbackPageId,
  mediaTargetsById,
) {
  if (
    element.elementType === 'media' &&
    mediaTargetsById.has(element.sourceElementId)
  ) {
    return mediaTargetsById.get(element.sourceElementId)
  }
  return targetPagesForPosition(
    sourceAssetId,
    element.sourcePosition,
    fallbackPageId,
  )
}

const elements = []
const drawingRelations = []
const docxSummaries = []

for (const importedAsset of docxImport.assets) {
  const asset = assetsById.get(importedAsset.assetId)
  if (!asset) throw new Error(`Unknown DOCX asset: ${importedAsset.assetId}`)
  const report = JSON.parse(
    await readFile(path.join(root, importedAsset.outputs.report.path), 'utf8'),
  )
  const targetPageId = DOCX_PAGE_TARGETS.get(asset.id) ?? null
  const sourceTargetPageIds =
    pageSourceById.get(asset.id)?.pages.map((page) => page.pageId) ??
    (targetPageId ? [targetPageId] : [])
  const relationTargets = report.drawingRelations.map((relation) => ({
    relation,
    targetPageIds: targetPagesForPosition(
      asset.id,
      relation.sourcePosition,
      targetPageId,
    ),
  }))
  const mediaTargetsById = new Map()
  for (const { relation, targetPageIds } of relationTargets) {
    if (!relation.targetMediaElementId) continue
    const targets = mediaTargetsById.get(relation.targetMediaElementId) ?? []
    mediaTargetsById.set(
      relation.targetMediaElementId,
      sourceTargetPageIds.filter(
        (pageId) =>
          targets.includes(pageId) || targetPageIds.includes(pageId),
      ),
    )
  }
  elements.push(
    ...report.elements.map((element) =>
      migrationDecision(
        asset,
        element,
        targetPagesForElement(
          asset.id,
          element,
          targetPageId,
          mediaTargetsById,
        ),
      ),
    ),
  )
  drawingRelations.push(
    ...relationTargets.map(({ relation, targetPageIds }) => ({
      ...relation,
      targetPageIds,
      authorizationEvidenceId: asset.authorization.evidenceId,
      ...reviewersFor(asset),
      status:
        asset.publicRelease.mode === 'blocked'
          ? 'internal-only'
          : 'resolved-pending-visual-review',
      notes:
        relation.resolution === 'media'
          ? 'OOXML drawing wrapper resolves to the registered media element.'
          : relation.reason,
    })),
  )
  docxSummaries.push({
    sourceAssetId: asset.id,
    contentDocument: asset.publicRelease.body === true,
    counts: report.counts,
    elementCount: report.elements.length,
    drawingRelationCount: report.drawingRelations.length,
    targetPageIds: sourceTargetPageIds,
  })
}

const imageSummaries = []
for (const importedImage of mediaImport.assets) {
  const asset = assetsById.get(importedImage.assetId)
  if (!asset) throw new Error(`Unknown image asset: ${importedImage.assetId}`)
  const targetAssetId = `wiki-image-${importedImage.source.sha256.slice(0, 16)}`
  elements.push({
    ...importedImage.sourceElement,
    source: importedImage.source,
    targetPageIds: ['topic-visual-guides-index'],
    targetAssetIds: [targetAssetId],
    disposition: 'merged',
    authorizationEvidenceId: asset.authorization.evidenceId,
    ...reviewersFor(asset),
    status: 'mapped-pending-visual-review',
    notes:
      'Standalone image is registered with dimensions and source hash; alt, caption, and responsive derivatives remain a Phase 5 task.',
  })
  imageSummaries.push({
    sourceAssetId: asset.id,
    sourceElementId: importedImage.sourceElement.sourceElementId,
    targetAssetId,
    source: importedImage.source,
  })
}

const xlsxAsset = assetsById.get(xlsxImport.assetId)
if (!xlsxAsset) throw new Error(`Unknown XLSX asset: ${xlsxImport.assetId}`)
const xlsxDataset = JSON.parse(
  await readFile(path.join(root, xlsxImport.outputs.records.path), 'utf8'),
)
for (const worksheet of xlsxDataset.worksheetSummaries) {
  elements.push({
    sourceAssetId: xlsxAsset.id,
    sourceElementId: worksheet.sourceElementId,
    elementType: 'worksheet',
    sourcePosition: {
      worksheet: worksheet.worksheet,
    },
    targetPageIds: ['data-basic-attack-cd'],
    targetAssetIds: ['dataset-basic-attack'],
    disposition: 'merged',
    authorizationEvidenceId: xlsxAsset.authorization.evidenceId,
    ...reviewersFor(xlsxAsset),
    status: 'mapped-pending-fact-review',
    notes: `${worksheet.dataRows} records mapped to the canonical basic-attack dataset.`,
  })
}

const assetEntries = ledger.assets.map((asset) => ({
  sourceAssetId: asset.id,
  assetType: asset.assetType,
  sourcePath: asset.origin.path,
  sourceSha256: asset.hashes.sha256,
  permission: asset.permission,
  authorizationEvidenceId: asset.authorization.evidenceId,
  publicRelease: asset.publicRelease,
  disposition:
    asset.publicRelease.mode === 'blocked' ? 'internal-only' : 'merged',
}))

const contentDocxTotals = docxSummaries
  .filter((entry) => entry.contentDocument)
  .reduce(
    (totals, entry) => {
      for (const field of [
        'paragraphs',
        'headings',
        'tables',
        'drawings',
        'media',
        'formulas',
      ]) {
        totals[field] += entry.counts[field]
      }
      return totals
    },
    {
      paragraphs: 0,
      headings: 0,
      tables: 0,
      drawings: 0,
      media: 0,
      formulas: 0,
    },
  )

const map = {
  schemaVersion: 1,
  schema: '../schemas/full-content-map.schema.json',
  generatedAt: ledger.authorizationUpdatedAt ?? ledger.generatedAt,
  generationPolicy:
    'Deterministic source hashes and structural locators; generatedAt is inherited from the source ledger.',
  assets: assetEntries,
  elements,
  drawingRelations,
  dataRecords: xlsxDataset.records.map((record) => ({
    sourceAssetId: xlsxAsset.id,
    sourceElementId: record.sourceElementId,
    recordId: record.id,
    worksheet: record.values.worksheet,
    worksheetRow: record.values.worksheetRow,
    disposition: record.disposition,
    reason: record.dispositionReason,
    targetAssetIds: ['dataset-basic-attack'],
    authorizationEvidenceId: xlsxAsset.authorization.evidenceId,
    status: 'quarantined-pending-phase-6-fact-review',
  })),
  sourceSummaries: {
    docx: docxSummaries,
    xlsx: {
      sourceAssetId: xlsxAsset.id,
      worksheetCount: xlsxDataset.worksheetSummaries.length,
      totalRecords: xlsxDataset.totalRecords,
    },
    images: imageSummaries,
  },
  summary: {
    sourceAssets: assetEntries.length,
    sourceAssetsByType: {
      docx: assetEntries.filter((entry) => entry.assetType === 'docx').length,
      xlsx: assetEntries.filter((entry) => entry.assetType === 'xlsx').length,
      image: assetEntries.filter((entry) => entry.assetType === 'image').length,
    },
    elements: elements.length,
    drawingRelations: drawingRelations.length,
    dataRecords: xlsxDataset.records.length,
    contentDocxTotals,
  },
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, stableJson(map), 'utf8')
console.log(
  `Full content map generated: ${path.relative(root, outputPath)} (${map.assets.length} assets, ${map.elements.length} elements, ${map.drawingRelations.length} drawing relations, ${map.dataRecords.length} records).`,
)

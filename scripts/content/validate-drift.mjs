import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { access, readdir } from 'node:fs/promises'
import path from 'node:path'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'

const failures = []
const inventory = await readJson('content/governance/source-assets.json')
const versions = await readJson('content/governance/version-baselines.json')
const pages = await loadPages()
const assetsById = new Map(
  (inventory.assets ?? []).map((asset) => [asset.id, asset]),
)

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

const configuredSourceRoot =
  process.env.CONTENT_SOURCE_ROOT ?? inventory.sourceRoot?.path
const sourceRootAvailable = configuredSourceRoot
  ? await access(configuredSourceRoot).then(
      () => true,
      () => false,
    )
  : false
const sourceChecks = []

if (sourceRootAvailable) {
  for (const asset of inventory.assets ?? []) {
    const sourcePath = path.join(configuredSourceRoot, asset.origin.path)
    const actual = await sha256(sourcePath).catch(() => null)
    const expected = asset.hashes?.sha256 ?? null
    const matches = actual === expected
    sourceChecks.push({ id: asset.id, expected, actual, matches })
    if (!matches) failures.push(`${asset.id}: source SHA-256 drift detected`)
  }
}

const importChecks = []
async function collectReports(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  )
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) await collectReports(absolutePath)
    if (
      entry.isFile() &&
      ['report.json', 'import-report.json', 'manifest.json'].includes(entry.name)
    ) {
      const relativePath = path.relative(root, absolutePath).split(path.sep).join('/')
      const report = await readJson(relativePath)
      const sourceAssetId = report.sourceAssetId ?? report.assetId
      const sourceHash =
        report.sourceSha256 ?? report.source?.sha256 ?? report.original?.sha256
      if (!sourceAssetId || !sourceHash) continue
      const asset = assetsById.get(sourceAssetId)
      const matches = sourceHash === asset?.hashes?.sha256
      importChecks.push({
        path: relativePath,
        sourceAssetId,
        expected: asset?.hashes?.sha256 ?? null,
        actual: sourceHash,
        matches,
      })
      if (!matches) {
        failures.push(`${relativePath}: import source hash differs from ledger`)
      }
    }
  }
}
await collectReports(path.join(root, 'content', 'imports'))
const importAssetIds = new Set(
  importChecks.map((check) => check.sourceAssetId),
)

const reviewQueue = []
for (const finding of versions.driftFindings ?? []) {
  const explicitlyAffectedIds = [
    ...(finding.stalePageIds ?? []),
    ...(finding.currentReferencePageIds ?? []),
  ]
  const affectedPages = pages
    .filter((page) =>
      explicitlyAffectedIds.length > 0
        ? explicitlyAffectedIds.includes(page.frontmatter.id)
        : finding.domain === 'equipment' &&
          (page.frontmatter.tags ?? []).includes('装备'),
    )
    .map((page) => ({
      id: page.frontmatter.id,
      status: page.frontmatter.status,
      file: page.filePath,
      source: page.source,
    }))
  const pagesById = new Map(affectedPages.map((page) => [page.id, page]))
  const missingPageIds = explicitlyAffectedIds.filter(
    (pageId) => !pagesById.has(pageId),
  )
  const stalePagesAcknowledged = (finding.stalePageIds ?? []).every(
    (pageId) => {
      const page = pagesById.get(pageId)
      return (
        ['stale', 'draft', 'archived'].includes(page?.status) &&
        page.source.includes(finding.olderVersion) &&
        page.source.includes(finding.newerVersion)
      )
    },
  )
  const referencePagesAcknowledged = (
    finding.currentReferencePageIds ?? []
  ).every((pageId) => pagesById.get(pageId)?.status === 'current')
  const acknowledged =
    finding.status === 'acknowledged' &&
    missingPageIds.length === 0 &&
    (explicitlyAffectedIds.length > 0
      ? stalePagesAcknowledged && referencePagesAcknowledged
      : affectedPages.every((page) =>
          ['stale', 'draft', 'archived'].includes(page.status),
        ))
  reviewQueue.push({
    findingId: finding.id,
    severity: finding.severity,
    affectedPages: affectedPages.map(({ source, ...page }) => page),
    missingPageIds,
    acknowledged,
  })
  if (!acknowledged) {
    failures.push(
      `${finding.id}: approved version-layering boundary is incomplete`,
    )
  }
}

const report = {
  schemaVersion: 1,
  check: 'content-drift',
  sourceRootAvailable,
  sourceRootAlias: inventory.sourceRoot?.alias ?? null,
  summary: {
    sourceAssets: inventory.assets?.length ?? 0,
    sourceHashesChecked: sourceChecks.length,
    importArtifactsChecked: importChecks.length,
    importAssetsChecked: importAssetIds.size,
    reviewItems: reviewQueue.length,
    failures: failures.length,
  },
  sourceChecks,
  importChecks,
  reviewQueue,
  failures,
}
const reportPath = await writeReport('content-drift', report)
printResult('Content drift validation', failures, reportPath)

import { lstat, readdir } from 'node:fs/promises'
import path from 'node:path'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'

const failures = []
const pages = await loadPages()
const external = await readJson('content/governance/source-assets.json')
const internal = await readJson('content/governance/internal-sources.json')
const publicAssets = await readJson('content/governance/public-assets.json')

const registry = new Map([
  ...(external.assets ?? []).map((source) => [source.id, source]),
  ...(internal.sources ?? []).map((source) => [source.id, source]),
])

for (const page of pages) {
  for (const source of page.frontmatter.sources ?? []) {
    if (source.assetId && !registry.has(source.assetId)) {
      failures.push(
        `${page.filePath}: unregistered source assetId ${source.assetId}`,
      )
    }
    if (!source.assetId && !source.url) {
      failures.push(`${page.filePath}: source needs assetId or url`)
    }
    if (
      ['pending', 'restricted'].includes(source.permission) &&
      (source.publicUse?.body || source.publicUse?.asset)
    ) {
      failures.push(
        `${page.filePath}: ${source.permission} source is marked for public use`,
      )
    }
    const registered = source.assetId ? registry.get(source.assetId) : null
    if (
      registered?.permission &&
      source.permission !== registered.permission
    ) {
      failures.push(
        `${page.filePath}: source permission differs from registry for ${source.assetId}`,
      )
    }
  }
}

const publicFiles = []
for (const collection of publicAssets.collections ?? []) {
  const absoluteRoot = path.join(root, collection.root)
  const rootStats = await lstat(absoluteRoot).catch(() => null)
  const regularFiles = rootStats?.isFile()
    ? [
        {
          name: path.basename(absoluteRoot),
          relativePath: collection.root,
        },
      ]
    : (
        await readdir(absoluteRoot, { withFileTypes: true }).catch(() => [])
      )
        .filter((entry) => entry.isFile())
        .map((entry) => ({
          name: entry.name,
          relativePath: path.join(collection.root, entry.name),
        }))
  if (regularFiles.length !== collection.expectedFileCount) {
    failures.push(
      `${collection.root}: expected ${collection.expectedFileCount} files, found ${regularFiles.length}`,
    )
  }
  const source = registry.get(collection.sourceId)
  if (!source) {
    failures.push(
      `${collection.root}: source collection ${collection.sourceId} is not registered`,
    )
  }
  if (
    !collection.publicUse ||
    !['owned', 'authorized'].includes(collection.permission)
  ) {
    failures.push(
      `${collection.root}: public collection lacks owned/authorized permission`,
    )
  }
  publicFiles.push(
    ...regularFiles.map((entry) =>
      entry.relativePath.split(path.sep).join('/'),
    ),
  )
}

const importReports = []
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
      importReports.push({ path: relativePath, ...report })
      const sourceAssetId = report.sourceAssetId ?? report.assetId
      const source = registry.get(sourceAssetId)
      if (!source) failures.push(`${relativePath}: source asset is not registered`)
      if (
        source?.permission === 'pending' &&
        report.publishable !== false
      ) {
        failures.push(`${relativePath}: pending import must not be publishable`)
      }
    }
  }
}
await collectReports(path.join(root, 'content', 'imports'))

const report = {
  schemaVersion: 1,
  check: 'content-provenance',
  summary: {
    registeredSources: registry.size,
    pageSourceReferences: pages.reduce(
      (count, page) => count + (page.frontmatter.sources?.length ?? 0),
      0,
    ),
    publicFiles: publicFiles.length,
    importReports: importReports.length,
    failures: failures.length,
  },
  importReports: importReports.map((report) => ({
    path: report.path,
    sourceAssetId: report.sourceAssetId ?? report.assetId,
    publishable: report.publishable,
  })),
  failures,
}
const reportPath = await writeReport('content-provenance', report)
printResult('Content provenance validation', failures, reportPath)

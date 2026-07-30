import { lstat, readdir } from 'node:fs/promises'
import path from 'node:path'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'
import {
  derivePublicRelease,
  permissionIsNoWider,
  releaseDecisionMatches,
} from './lib/authorization-policy.mjs'

const failures = []
const pages = await loadPages()
const external = await readJson('content/governance/source-assets.json')
const internal = await readJson('content/governance/internal-sources.json')
const publicAssets = await readJson('content/governance/public-assets.json')
const externalById = new Map(
  (external.assets ?? []).map((source) => [source.id, source]),
)

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
      !permissionIsNoWider(source.permission, registered.permission)
    ) {
      failures.push(
        `${page.filePath}: source permission is wider than registry for ${source.assetId}`,
      )
    }
    const externalSource = source.assetId
      ? externalById.get(source.assetId)
      : null
    if (externalSource) {
      const decision = derivePublicRelease(externalSource)
      if (!releaseDecisionMatches(externalSource.publicRelease, decision)) {
        failures.push(
          `${page.filePath}: registry release decision is stale for ${source.assetId}`,
        )
      }
      if (
        source.publicUse?.body === true &&
        decision.publicRelease.body !== true
      ) {
        failures.push(
          `${page.filePath}: body use exceeds registry scope for ${source.assetId}`,
        )
      }
      if (
        source.publicUse?.asset === true &&
        decision.publicRelease.asset !== true
      ) {
        failures.push(
          `${page.filePath}: asset use exceeds registry scope for ${source.assetId}`,
        )
      }
    }
  }
}

const publicFiles = []
async function collectRegularFiles(absolutePath, relativePath) {
  const metadata = await lstat(absolutePath).catch(() => null)
  if (!metadata) return []
  if (metadata.isFile()) {
    return [
      {
        name: path.basename(absolutePath),
        relativePath,
      },
    ]
  }
  if (!metadata.isDirectory()) return []
  const entries = await readdir(absolutePath, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((entry) =>
      collectRegularFiles(
        path.join(absolutePath, entry.name),
        path.join(relativePath, entry.name),
      ),
    ),
  )
  return nested.flat()
}

for (const collection of publicAssets.collections ?? []) {
  const absoluteRoot = path.join(root, collection.root)
  const regularFiles = await collectRegularFiles(
    absoluteRoot,
    collection.root,
  )
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
  const externalSource = externalById.get(collection.sourceId)
  const requiredScope =
    collection.derivative === true ? 'derivative' : 'asset'
  if (
    externalSource &&
    derivePublicRelease(externalSource).publicRelease[requiredScope] !== true
  ) {
    failures.push(
      `${collection.root}: public collection exceeds source ${requiredScope} scope`,
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
      if (source && report.publishable === true) {
        const decision = externalById.has(sourceAssetId)
          ? derivePublicRelease(source).publicRelease
          : source.publicRelease
        const requiredField =
          source.assetType === 'xlsx'
            ? 'structuredData'
            : source.assetType === 'image'
              ? 'derivative'
              : 'body'
        if (decision?.[requiredField] !== true) {
          failures.push(
            `${relativePath}: publishable import exceeds ${requiredField} scope`,
          )
        }
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

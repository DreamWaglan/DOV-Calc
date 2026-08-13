import { createHash } from 'node:crypto'
import { access, readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { unzipSync } from 'fflate'
import sharp from 'sharp'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'
import { validateMediaItem } from './lib/media-policy.mjs'

const library = await readJson('content/migrations/media-library.json')
const fullMap = await readJson('content/migrations/full-content-map.json')
const publicAssets = await readJson('content/governance/public-assets.json')
const sourceAssets = await readJson('content/governance/source-assets.json')
const pages = await loadPages()
const pageIds = new Set(pages.map((page) => page.frontmatter.id))
const failures = []
const configuredSourceRoot =
  process.env.CONTENT_SOURCE_ROOT ?? sourceAssets.sourceRoot?.path
const sourceRootAvailable = Boolean(
  configuredSourceRoot &&
    (await access(configuredSourceRoot).then(
      () => true,
      () => false,
    )),
)
const buildStatePath = path.join(root, '.omx', 'media-library-build.json')
let buildStateClean = true

try {
  await access(buildStatePath)
  buildStateClean = false
  failures.push(
    'media library build state is still in-progress; rerun the full media build before validation',
  )
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}

const items = [
  ...(library.standaloneItems ?? []),
  ...(library.docxMediaItems ?? []),
]
const sourceElementIds = new Set(
  fullMap.elements.map((element) => element.sourceElementId),
)
const maxPixels = library.derivativePolicy?.maxDerivativePixels

if (library.summary?.standaloneImages !== 15) {
  failures.push(
    `standalone images: expected 15, got ${library.summary?.standaloneImages ?? 0}`,
  )
}
if (library.summary?.contentDocxSources !== 11) {
  failures.push(
    `content DOCX sources: expected 11, got ${library.summary?.contentDocxSources ?? 0}`,
  )
}
if (library.summary?.docxMediaElements !== 585) {
  failures.push(
    `DOCX media elements: expected 585, got ${library.summary?.docxMediaElements ?? 0}`,
  )
}
if (library.summary?.libraryItems !== 600 || items.length !== 600) {
  failures.push(
    `library items: expected 600, got ${library.summary?.libraryItems ?? items.length}`,
  )
}
if (
  library.summary?.downloadsAllowed !== 600 ||
  library.summary?.sourceOriginalsCopied !== 600
) {
  failures.push('download/original-copy summary does not match the authorized source scope')
}

const seenSourceElements = new Set()
const seenPagePlacements = new Set()
const seenPublicPaths = new Set()
let verifiedFiles = 0
let verifiedBytes = 0
let verifiedOriginals = 0
let verifiedOriginalBytes = 0
for (const item of items) {
  failures.push(...validateMediaItem(item, { maxDerivativePixels: maxPixels }))
  if (item.downloadAllowed !== true || item.originalPublicPath !== item.original?.publicPath) {
    failures.push(`${item.libraryId}: original download metadata is incomplete`)
  }
  if (seenSourceElements.has(item.sourceElementId)) {
    failures.push(`${item.sourceElementId}: duplicate source element`)
  }
  seenSourceElements.add(item.sourceElementId)
  const pagePlacement = `${item.detailPageId}:${item.sourceElementId}`
  if (seenPagePlacements.has(pagePlacement)) {
    failures.push(`${pagePlacement}: duplicate page placement`)
  }
  seenPagePlacements.add(pagePlacement)
  if (!sourceElementIds.has(item.sourceElementId)) {
    failures.push(`${item.libraryId}: source element is absent from the full map`)
  }
  for (const pageId of item.targetPageIds) {
    if (!pageIds.has(pageId)) {
      failures.push(`${item.libraryId}: target page does not exist: ${pageId}`)
    }
  }
  for (const file of item.files) {
    if (file.path.includes('/segment-') || file.publicPath.includes('/segment-')) {
      failures.push(`${item.libraryId}: segment derivative is no longer allowed: ${file.path}`)
    }
    if (seenPublicPaths.has(file.path)) {
      failures.push(`${item.libraryId}: duplicate derivative path ${file.path}`)
    }
    seenPublicPaths.add(file.path)
    const absolutePath = path.join(root, file.path)
    const data = await readFile(absolutePath).catch(() => null)
    if (!data) {
      failures.push(`${item.libraryId}: derivative is missing: ${file.path}`)
      continue
    }
    verifiedFiles += 1
    verifiedBytes += data.length
    const hash = createHash('sha256').update(data).digest('hex')
    const metadata = await sharp(data).metadata()
    const detectedFormat =
      metadata.format === 'heif' && metadata.compression === 'av1'
        ? 'avif'
        : metadata.format
    if (
      hash !== file.sha256 ||
      metadata.width !== file.width ||
      metadata.height !== file.height ||
      detectedFormat !== file.format ||
      data.length !== file.bytes
    ) {
      failures.push(`${item.libraryId}: derivative metadata drifted: ${file.path}`)
    }
  }
  const original = item.original
  if (!original) {
    failures.push(`${item.libraryId}: original metadata is missing`)
  } else {
    if (
      original.path.includes('/segment-') ||
      original.publicPath.includes('/segment-')
    ) {
      failures.push(`${item.libraryId}: original path must not be segmented`)
    }
    if (!seenPublicPaths.has(original.path)) {
      seenPublicPaths.add(original.path)
    } else {
      failures.push(`${item.libraryId}: duplicate original path ${original.path}`)
    }
    const absolutePath = path.join(root, original.path)
    const data = await readFile(absolutePath).catch(() => null)
    if (!data) {
      failures.push(`${item.libraryId}: original is missing: ${original.path}`)
    } else {
      verifiedOriginals += 1
      verifiedOriginalBytes += data.length
      const hash = createHash('sha256').update(data).digest('hex')
      const metadata = await sharp(data).metadata()
      if (
        hash !== original.sha256 ||
        hash !== item.sourceSha256 ||
        metadata.width !== original.width ||
        metadata.height !== original.height ||
        data.length !== original.bytes ||
        original.publicPath !== item.originalPublicPath ||
        typeof original.mimeType !== 'string' ||
        !original.mimeType.startsWith('image/') ||
        typeof original.extension !== 'string' ||
        !original.extension.startsWith('.')
      ) {
        failures.push(`${item.libraryId}: original metadata drifted: ${original.path}`)
      }
    }
  }
}

const assetsById = new Map(
  (sourceAssets.assets ?? []).map((asset) => [asset.id, asset]),
)
let verifiedStandaloneSourceBytes = 0
let verifiedDocxPackageMedia = 0
let skippedStandaloneSourceBytes = 0
let skippedDocxPackageMedia = 0
const standaloneItems = items.filter(
  (candidate) => candidate.kind !== 'docx-media',
)
const groupedDocxItems = Map.groupBy(
  items.filter((item) => item.kind === 'docx-media'),
  (item) => item.sourceAssetId,
)
if (sourceRootAvailable) {
  for (const item of standaloneItems) {
    const asset = assetsById.get(item.sourceAssetId)
    const sourcePath = asset?.origin?.path
      ? path.join(configuredSourceRoot, asset.origin.path)
      : null
    const [sourceData, publicData] = await Promise.all([
      sourcePath ? readFile(sourcePath).catch(() => null) : null,
      readFile(path.join(root, item.original.path)).catch(() => null),
    ])
    if (
      !sourceData ||
      !publicData ||
      !sourceData.equals(publicData) ||
      createHash('sha256').update(sourceData).digest('hex') !== item.sourceSha256
    ) {
      failures.push(
        `${item.libraryId}: standalone public original differs from source bytes`,
      )
    } else {
      verifiedStandaloneSourceBytes += 1
    }
  }
  for (const [sourceAssetId, docxItems] of groupedDocxItems) {
    const asset = assetsById.get(sourceAssetId)
    const sourcePath = asset?.origin?.path
      ? path.join(configuredSourceRoot, asset.origin.path)
      : null
    const docxData = sourcePath
      ? await readFile(sourcePath).catch(() => null)
      : null
    if (
      !docxData ||
      createHash('sha256').update(docxData).digest('hex') !== asset?.hashes?.sha256
    ) {
      failures.push(
        `${sourceAssetId}: source DOCX bytes are missing or differ from the ledger`,
      )
      continue
    }
    const zip = unzipSync(new Uint8Array(docxData))
    for (const item of docxItems) {
      const packageEntry = zip[item.original.packagePath]
      const publicData = await readFile(path.join(root, item.original.path)).catch(
        () => null,
      )
      const packageData = packageEntry ? Buffer.from(packageEntry) : null
      if (
        !packageData ||
        !publicData ||
        !packageData.equals(publicData) ||
        createHash('sha256').update(packageData).digest('hex') !==
          item.original.sha256
      ) {
        failures.push(
          `${item.libraryId}: public original differs from ${item.original.packagePath}`,
        )
      } else {
        verifiedDocxPackageMedia += 1
      }
    }
  }
} else {
  skippedStandaloneSourceBytes = standaloneItems.length
  skippedDocxPackageMedia = [...groupedDocxItems.values()].reduce(
    (total, docxItems) => total + docxItems.length,
    0,
  )
}

const mediaCollections = publicAssets.collections.filter((collection) =>
  collection.id.startsWith('wiki-media-'),
)
const expectedCollectionSources = new Set(
  items.filter((item) => item.files.length > 0).map((item) => item.sourceAssetId),
)
if (mediaCollections.length !== expectedCollectionSources.size) {
  failures.push(
    `public media collections: expected ${expectedCollectionSources.size}, got ${mediaCollections.length}`,
  )
}
for (const collection of mediaCollections) {
  if (
    collection.publicUse !== true ||
    collection.derivative !== true ||
    collection.download !== true ||
    !collection.manifest ||
    !collection.authorizationEvidenceId
  ) {
    failures.push(`${collection.id}: public media policy is incomplete`)
  }
  const rootPath = path.join(root, collection.root)
  async function countFiles(directory) {
    let count = 0
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      count += entry.isDirectory()
        ? await countFiles(path.join(directory, entry.name))
        : 1
    }
    return count
  }
  const actual = await countFiles(rootPath).catch(() => -1)
  if (actual !== collection.expectedFileCount) {
    failures.push(
      `${collection.id}: expected ${collection.expectedFileCount} files, found ${actual}`,
    )
  }
}

const expectedManifestSources = new Set([
  ...(library.standaloneItems ?? []).map((item) => item.sourceAssetId),
  ...(library.docxGalleryPages ?? []).map((gallery) => gallery.sourceAssetId),
])
const manifestNames = (await readdir(
  path.join(root, 'content', 'migrations', 'media-assets'),
)).filter((name) => name.endsWith('.json'))
const manifestPublicPaths = new Set()
if (manifestNames.length !== expectedManifestSources.size) {
  failures.push(
    `derivative manifests: expected ${expectedManifestSources.size}, got ${manifestNames.length}`,
  )
}
for (const sourceAssetId of expectedManifestSources) {
  const expectedItems = items.filter((item) => item.sourceAssetId === sourceAssetId)
  const manifest = await readFile(
    path.join(
      root,
      'content',
      'migrations',
      'media-assets',
      `${sourceAssetId}.json`,
    ),
    'utf8',
  )
    .then(JSON.parse)
    .catch(() => null)
  if (
    !manifest ||
    manifest.sourceId !== sourceAssetId ||
    manifest.originalCopied !== (expectedItems.length > 0) ||
    manifest.downloadAllowed !== (expectedItems.length > 0) ||
    !Array.isArray(manifest.originals) ||
    manifest.originals.length !== expectedItems.length ||
    !Array.isArray(manifest.derivatives)
  ) {
    failures.push(`${sourceAssetId}: media manifest is incomplete`)
  } else if (
    manifest.files.some((file) => file.path?.includes('/segment-')) ||
    manifest.originals.some((file) => file.path?.includes('/segment-')) ||
    manifest.derivatives.some((file) => file.path?.includes('/segment-'))
  ) {
    failures.push(`${sourceAssetId}: media manifest still contains segment output`)
  } else {
    for (const file of manifest.files) {
      if (!file.path || manifestPublicPaths.has(file.path)) {
        failures.push(
          `${sourceAssetId}: media manifest path is missing or duplicated: ${file.path ?? '(missing)'}`,
        )
        continue
      }
      manifestPublicPaths.add(file.path)
    }
  }
}

const unmanagedPublicPaths = [...seenPublicPaths].filter(
  (filePath) => !manifestPublicPaths.has(filePath),
)
const missingManifestPaths = [...manifestPublicPaths].filter(
  (filePath) => !seenPublicPaths.has(filePath),
)
if (unmanagedPublicPaths.length > 0 || missingManifestPaths.length > 0) {
  failures.push(
    `managed manifest closure failed: ${unmanagedPublicPaths.length} unmanaged public files, ${missingManifestPaths.length} missing manifest files`,
  )
}

for (const page of library.standaloneItems ?? []) {
  const source = pages.find(
    (candidate) => candidate.frontmatter.id === page.detailPageId,
  )
  if (
    !source ||
    !source.body.includes('<ResponsiveMedia') ||
    !source.body.includes('fallback-path="/wiki-media/') ||
    !source.body.includes('/original.') ||
    source.body.includes('download-path=') ||
    source.body.includes('download-allowed=') ||
    source.body.includes('segment-')
  ) {
    failures.push(`${page.detailPageId}: standalone media page is incomplete`)
  }
}
for (const gallery of library.docxGalleryPages ?? []) {
  const source = pages.find(
    (candidate) => candidate.frontmatter.id === gallery.galleryId,
  )
  if (
    !source ||
    (gallery.mediaElements > 0 &&
      !source.body.includes('<ResponsiveMedia')) ||
    (gallery.mediaElements > 0 &&
      !source.body.includes('fallback-path="/wiki-media/')) ||
    (gallery.mediaElements > 0 && !source.body.includes('/original.')) ||
    source.body.includes('download-path=') ||
    source.body.includes('download-allowed=') ||
    source.body.includes('segment-')
  ) {
    failures.push(`${gallery.galleryId}: DOCX media gallery is incomplete`)
  }
}

const report = {
  schemaVersion: 2,
  check: 'authorized-responsive-media-library',
  sourceRootAvailable,
  sourceRootAlias: sourceAssets.sourceRoot?.alias ?? null,
  summary: {
    standaloneImages: library.summary?.standaloneImages ?? 0,
    contentDocxSources: library.summary?.contentDocxSources ?? 0,
    docxMediaElements: library.summary?.docxMediaElements ?? 0,
    libraryItems: items.length,
    longImages: library.summary?.longImages ?? 0,
    publicCollections: mediaCollections.length,
    derivativeFiles: library.summary?.derivativeFiles ?? 0,
    verifiedFiles,
    verifiedBytes,
    verifiedOriginals,
    verifiedOriginalBytes,
    verifiedStandaloneSourceBytes,
    verifiedDocxPackageMedia,
    skippedStandaloneSourceBytes,
    skippedDocxPackageMedia,
    downloadsAllowed: library.summary?.downloadsAllowed ?? 0,
    sourceOriginalsCopied: library.summary?.sourceOriginalsCopied ?? 0,
    manifestFiles: manifestPublicPaths.size,
    unmanagedPublicFiles: unmanagedPublicPaths.length,
    missingManifestFiles: missingManifestPaths.length,
    buildStateClean,
    failures: failures.length,
  },
  policy: library.derivativePolicy,
  failures,
}
const reportPath = await writeReport('media-library', report)
printResult('Authorized responsive media library validation', failures, reportPath)

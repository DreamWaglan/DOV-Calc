import { createHash } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
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
const pages = await loadPages()
const pageIds = new Set(pages.map((page) => page.frontmatter.id))
const failures = []
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
  library.summary?.downloadsAllowed !== 0 ||
  library.summary?.sourceOriginalsCopied !== 0
) {
  failures.push('download/original-copy summary exceeds the authorized scope')
}

const seenSourceElements = new Set()
const seenPagePlacements = new Set()
const seenPublicPaths = new Set()
let verifiedFiles = 0
let verifiedBytes = 0
for (const item of items) {
  failures.push(...validateMediaItem(item, { maxDerivativePixels: maxPixels }))
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
    collection.download !== false ||
    !collection.manifest ||
    !collection.authorizationEvidenceId
  ) {
    failures.push(`${collection.id}: public derivative policy is incomplete`)
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
if (manifestNames.length !== expectedManifestSources.size) {
  failures.push(
    `derivative manifests: expected ${expectedManifestSources.size}, got ${manifestNames.length}`,
  )
}
for (const sourceAssetId of expectedManifestSources) {
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
    manifest.originalCopied !== false ||
    manifest.downloadAllowed !== false
  ) {
    failures.push(`${sourceAssetId}: derivative manifest is incomplete`)
  }
}

for (const page of library.standaloneItems ?? []) {
  const source = pages.find(
    (candidate) => candidate.frontmatter.id === page.detailPageId,
  )
  if (
    !source ||
    !source.body.includes('<ResponsiveMedia') ||
    source.body.includes(' download')
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
    source.body.includes(' download')
  ) {
    failures.push(`${gallery.galleryId}: DOCX media gallery is incomplete`)
  }
}

const report = {
  schemaVersion: 1,
  check: 'authorized-responsive-media-library',
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
    downloadsAllowed: library.summary?.downloadsAllowed ?? 0,
    sourceOriginalsCopied: library.summary?.sourceOriginalsCopied ?? 0,
    failures: failures.length,
  },
  policy: library.derivativePolicy,
  failures,
}
const reportPath = await writeReport('media-library', report)
printResult('Authorized responsive media library validation', failures, reportPath)

import { createHash } from 'node:crypto'
import { mkdir, readFile, readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { unzipSync } from 'fflate'
import sharp from 'sharp'
import {
  loadPages,
  root,
  writeFileWithRetry as writeFile,
} from './lib/content-utils.mjs'
import {
  loadSourceLedger,
  stableJson,
} from './lib/migration-elements.mjs'
import { pageReviewStatus } from './lib/page-review-decisions.mjs'

const GENERATED_AT = '2026-07-30T00:00:00.000Z'
const PUBLIC_ROOT = path.join(root, 'docs', 'public', 'wiki-media')
const PAGE_ROOT = path.join(root, 'docs', 'topics', 'visual-guides')
const MANIFEST_ROOT = path.join(root, 'content', 'migrations', 'media-assets')
const LIBRARY_PATH = path.join(
  root,
  'content',
  'migrations',
  'media-library.json',
)
const PUBLIC_ASSETS_PATH = path.join(
  root,
  'content',
  'governance',
  'public-assets.json',
)
const BUILD_STATE_PATH = path.join(root, '.omx', 'media-library-build.json')
const MAX_INPUT_PIXELS = 100_000_000
const MAX_DERIVATIVE_PIXELS = 4_500_000
const RESPONSIVE_WIDTHS = [480, 960]
const THUMB_WIDTH = 360
const VISUAL_INDEX_ID = 'topic-visual-guides-index'
const IMAGE_MIME_BY_EXT = new Map([
  ['.avif', 'image/avif'],
  ['.gif', 'image/gif'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
])

const STANDALONE_RELATED = new Map([
  ['src-20f9c608ccbe', ['start-new-account', 'start-first-week']],
  ['src-ec1754535996', ['start-new-account', 'start-first-week']],
  ['src-a82171ad36dd', ['topic-pve-selection', 'combat-pve-team-building']],
  ['src-3f75f2339e43', ['topic-beginner-equipment', 'tool-equipment-lookup']],
  ['src-8862e9c4e1c0', ['tool-equipment-lookup', 'topic-beginner-equipment']],
  ['src-a7efaec86736', ['combat-pve-team-building', 'combat-pvp-arena']],
  ['src-4c3487e1f8f7', ['topic-beginner-equipment', 'start-new-account']],
  ['src-fc56c0350c73', ['combat-pvp-arena', 'combat-pvp-rules-and-fleet']],
  ['src-e3a32a586e5b', ['progression-index', 'topic-pve-selection']],
  ['src-08ba2d32a9ff', ['start-index']],
  ['src-2d59aac1ac45', ['mechanics-damage-model', 'mechanics-attack-power']],
  ['src-65d25a94c550', ['mechanics-attack-power', 'tool-damage-calculator']],
  ['src-0dc5d6791056', ['start-index', 'topic-new-player-checklist']],
  ['src-1157c5077c1f', ['start-index', 'topic-new-player-checklist']],
  ['src-b8f7a77d5f36', ['start-index', 'topic-new-player-checklist']],
])

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

function repositoryPath(absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join('/')
}

function publicPath(absolutePath) {
  return `/${path
    .relative(path.join(root, 'docs', 'public'), absolutePath)
    .split(path.sep)
    .join('/')}`
}

function normalizedExtension(filePath, format) {
  const extension = path.extname(filePath).toLocaleLowerCase('en-US')
  if (IMAGE_MIME_BY_EXT.has(extension)) return extension
  if (format === 'jpeg') return '.jpg'
  if (format && IMAGE_MIME_BY_EXT.has(`.${format}`)) return `.${format}`
  throw new Error(`Unsupported image extension or format: ${filePath}`)
}

function mimeTypeForExtension(extension) {
  const mimeType = IMAGE_MIME_BY_EXT.get(extension)
  if (!mimeType) throw new Error(`Unsupported image extension: ${extension}`)
  return mimeType
}

async function writeOriginal(buffer, outputDir, filePath, metadata) {
  const extension = normalizedExtension(filePath, metadata.format)
  const outputPath = path.join(outputDir, `original${extension}`)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, buffer)
  return {
    path: repositoryPath(outputPath),
    publicPath: publicPath(outputPath),
    sha256: sha256(buffer),
    bytes: buffer.length,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    extension,
    mimeType: mimeTypeForExtension(extension),
    fileName: `original${extension}`,
  }
}

function cleanTitle(title) {
  return title.replace(/\.(?:png|jpe?g)$/i, '').trim()
}

function html(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function constrainedWidth(sourceWidth, sourceHeight, preferredWidth) {
  const pixelBound = Math.floor(
    Math.sqrt((MAX_DERIVATIVE_PIXELS * sourceWidth) / sourceHeight),
  )
  return Math.max(1, Math.min(sourceWidth, preferredWidth, pixelBound))
}

async function safeReset(absolutePath, expectedPath) {
  if (path.resolve(absolutePath) !== path.resolve(expectedPath)) {
    throw new Error(`Refusing to reset unexpected generated path: ${absolutePath}`)
  }
  await rm(absolutePath, { recursive: true, force: true })
  await mkdir(absolutePath, { recursive: true })
}

async function resetManagedMediaCollections(publicAssets) {
  const expectedRoot = path.resolve(PUBLIC_ROOT)
  await mkdir(expectedRoot, { recursive: true })
  const roots = [
    ...new Set(
      (publicAssets.collections ?? [])
        .filter((collection) => collection.id.startsWith('wiki-media-'))
        .map((collection) => path.resolve(root, collection.root)),
    ),
  ]
  for (const collectionRoot of roots) {
    const relation = path.relative(expectedRoot, collectionRoot)
    if (
      relation === '' ||
      relation.startsWith('..') ||
      path.isAbsolute(relation)
    ) {
      throw new Error(
        `Refusing to reset media collection outside wiki-media root: ${collectionRoot}`,
      )
    }
    await rm(collectionRoot, { recursive: true, force: true })
  }
}

async function writeDerivative(buffer, outputPath, format, width) {
  let pipeline = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({ width, withoutEnlargement: true })
  pipeline =
    format === 'avif'
      ? pipeline.avif({ quality: 58, effort: 5 })
      : pipeline.webp({ quality: 86, smartSubsample: true })
  const output = await pipeline.toBuffer()
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, output)
  const metadata = await sharp(output).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`Derivative has no dimensions: ${outputPath}`)
  }
  return {
    path: repositoryPath(outputPath),
    publicPath: publicPath(outputPath),
    sha256: sha256(output),
    bytes: output.length,
    width: metadata.width,
    height: metadata.height,
    format,
    exifRemoved: !metadata.exif,
  }
}

async function createVariantSet({
  buffer,
  outputDir,
  prefix,
  sourceWidth,
  sourceHeight,
  preferredWidths = RESPONSIVE_WIDTHS,
}) {
  const widths = [
    ...new Set(
      preferredWidths.map((width) =>
        constrainedWidth(sourceWidth, sourceHeight, width),
      ),
    ),
  ].sort((left, right) => left - right)
  const files = []
  for (const width of widths) {
    for (const format of ['avif', 'webp']) {
      files.push(
        await writeDerivative(
          buffer,
          path.join(
            outputDir,
            `${prefix}-${String(width).padStart(4, '0')}.${format}`,
          ),
          format,
          width,
        ),
      )
    }
  }
  return files
}

async function deriveVisual(buffer, outputDir, originalFilePath) {
  const metadata = await sharp(buffer, {
    limitInputPixels: MAX_INPUT_PIXELS,
  }).metadata()
  if (!metadata.width || !metadata.height) {
    throw new Error(`Unable to read image dimensions for ${outputDir}`)
  }
  const original = await writeOriginal(
    buffer,
    outputDir,
    originalFilePath,
    metadata,
  )
  const thumbnailWidth = constrainedWidth(
    metadata.width,
    metadata.height,
    THUMB_WIDTH,
  )
  const thumbnail = await writeDerivative(
    buffer,
    path.join(outputDir, 'thumbnail.webp'),
    'webp',
    thumbnailWidth,
  )
  const longImage =
    metadata.height > 4000 ||
    metadata.height / metadata.width > 3.5 ||
    metadata.width * metadata.height > MAX_DERIVATIVE_PIXELS
  const groups = [
    {
      kind: 'preview',
      index: 1,
      anchorId: 'preview',
      files: await createVariantSet({
        buffer,
        outputDir,
        prefix: 'preview',
        sourceWidth: metadata.width,
        sourceHeight: metadata.height,
      }),
    },
  ]
  return {
    source: {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    },
    original,
    longImage,
    thumbnail,
    groups,
    files: [thumbnail, ...groups.flatMap((group) => group.files)],
  }
}

async function findImportReports() {
  const reports = new Map()
  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name)
      if (entry.isDirectory()) await walk(absolutePath)
      if (entry.isFile() && entry.name === 'import-report.json') {
        const report = JSON.parse(await readFile(absolutePath, 'utf8'))
        reports.set(report.assetId, report)
      }
    }
  }
  await walk(path.join(root, 'content', 'imports', 'docx'))
  return reports
}

function nearestHeading(report, bodyIndex) {
  return [...(report.elements ?? [])]
    .filter(
      (element) =>
        element.elementType === 'heading' &&
        element.sourcePosition?.bodyIndex <= bodyIndex,
    )
    .sort(
      (left, right) =>
        right.sourcePosition.bodyIndex - left.sourcePosition.bodyIndex,
    )[0]?.title
}

function responsiveMediaMarkup(item, group, altSuffix = '') {
  const fallback = [...group.files]
    .filter((file) => file.format === 'webp')
    .sort((left, right) => right.width - left.width)[0]
  const variants = ['avif', 'webp'].flatMap((format) => {
    const candidates = group.files
      .filter((file) => file.format === format)
      .sort((left, right) => left.width - right.width)
      .map((file) => ({ path: file.publicPath, width: file.width }))
    return candidates.length
      ? [{ type: `image/${format}`, candidates }]
      : []
  })
  return `<ResponsiveMedia
  media-id="${html(mediaAnchor(item, group))}"
  alt="${html(`${item.alt}${altSuffix}`)}"
  display-mode="index"
  :variants='${JSON.stringify(variants)}'
  fallback-path="${html(fallback.publicPath)}"
  :width="${fallback.width}"
  :height="${fallback.height}"
/>`
}

function originalMediaMarkup(item, altSuffix = '') {
  return `<ResponsiveMedia
  media-id="${html(`${item.libraryId}-original`)}"
  alt="${html(`${item.alt}${altSuffix}`)}"
  display-mode="viewer"
  :variants='[]'
  fallback-path="${html(item.original.publicPath)}"
  :width="${item.original.width}"
  :height="${item.original.height}"
/>`
}

function mediaAnchor(item, group) {
  const placementId = item.sourceElementId.split(':').at(-1)
  return `${item.libraryId}-${placementId}-${group.anchorId}`
}

function pageFrontmatter({
  id,
  title,
  description,
  order,
  source,
  related,
  tags,
}) {
  return [
    '---',
    `id: ${id}`,
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    'section: topics',
    `order: ${order}`,
    'audience: ["beginner","regular","advanced"]',
    'contentType: topic',
    'gameVersion: "2026-07"',
    `sourceUpdatedAt: ${JSON.stringify(source.origin.updatedAt)}`,
    'verifiedAt: "2026-07-30"',
    `status: ${pageReviewStatus(id, 'draft')}`,
    'authors:',
    '  - name: DOV-Calc 媒体维护组',
    '    role: 响应式图片与来源整理',
    'reviewers:',
    '  - name: DOV-Calc 视觉审核组',
    '    role: 替代文本、说明与移动端审核',
    'sources:',
    `  - title: ${JSON.stringify(source.title)}`,
    `    assetId: ${source.id}`,
    `    sourceType: ${source.assetType}`,
    `    permission: ${source.permission}`,
    '    publicUse:',
    `      body: ${source.publicRelease.body === true}`,
    `      asset: ${source.publicRelease.asset === true}`,
    '    notes: 独立图片和 DOCX 内嵌媒体按授权范围公开原始字节；索引入口使用缩略图。',
    `tags: ${JSON.stringify(tags)}`,
    `related: ${JSON.stringify([...new Set(related)])}`,
    '---',
    '',
  ].join('\n')
}

async function writeStandalonePage(item, asset, order) {
  const figures = [
    '## 原图',
    '',
    originalMediaMarkup(item),
    '',
  ]
  const output = [
    pageFrontmatter({
      id: item.detailPageId,
      title: item.title,
      description: item.alt,
      order,
      source: asset,
      related: [VISUAL_INDEX_ID, ...item.relatedPageIds],
      tags: ['图片资料', '一图流', '响应式图片'],
    }),
    `# ${item.title}`,
    '',
    ...figures,
  ].join('\n')
  const outputPath = path.join(PAGE_ROOT, `${item.sourceAssetId}.md`)
  await writeFile(outputPath, `${output.trim()}\n`, 'utf8')
  return repositoryPath(outputPath)
}

async function writeDocxGalleryPage(items, asset, order) {
  const galleryId = `media-source-${asset.id.slice(4)}`
  const figures = items.flatMap((item, itemIndex) => [
    `## 插图 ${itemIndex + 1}`,
    '',
    originalMediaMarkup(item),
    '',
  ])
  const targetPageIds = [...new Set(items.flatMap((item) => item.targetPageIds))]
  const output = [
    pageFrontmatter({
      id: galleryId,
      title: `${cleanTitle(asset.title)}：配套图片`,
      description: `展示《${cleanTitle(asset.title)}》中的配套图片。`,
      order,
      source: asset,
      related: [
        VISUAL_INDEX_ID,
        ...targetPageIds.filter((pageId) => pageId !== galleryId),
      ],
      tags: ['图片资料', 'DOCX 媒体', '来源追溯'],
    }),
    `# ${cleanTitle(asset.title)}：配套图片`,
    '',
    `本页收录 ${items.length} 张配套图片。`,
    '',
    ...figures,
  ].join('\n')
  const outputPath = path.join(PAGE_ROOT, `docx-${asset.id}.md`)
  await writeFile(outputPath, `${output.trim()}\n`, 'utf8')
  return {
    galleryId,
    file: repositoryPath(outputPath),
    targetPageIds,
  }
}

async function writeIndexPage({
  standaloneItems,
  docxGroups,
  assetsById,
}) {
  const sourceAssets = [
    ...standaloneItems.map((item) => assetsById.get(item.sourceAssetId)),
    ...[...docxGroups.keys()].map((sourceAssetId) =>
      assetsById.get(sourceAssetId),
    ),
  ]
  const sourceLines = sourceAssets.flatMap((asset) => [
    `  - title: ${JSON.stringify(asset.title)}`,
    `    assetId: ${asset.id}`,
    `    sourceType: ${asset.assetType}`,
    `    permission: ${asset.permission}`,
    '    publicUse:',
    `      body: ${asset.publicRelease.body === true}`,
    `      asset: ${asset.publicRelease.asset === true}`,
    '    notes: 独立图片和 DOCX 内嵌媒体按授权范围公开原始字节；索引入口使用缩略图。',
  ])
  const standaloneCards = standaloneItems.flatMap((item) => {
    const asset = assetsById.get(item.sourceAssetId)
    const preview = {
      kind: 'thumbnail',
      index: 1,
      anchorId: 'thumbnail',
      files: [item.thumbnail],
    }
    return [
      `## [${item.title}](./${item.sourceAssetId})`,
      '',
      responsiveMediaMarkup(item, preview),
      '',
    ]
  })
  const docxLinks = [...docxGroups.entries()].map(([sourceAssetId, items]) => {
    const asset = assetsById.get(sourceAssetId)
    return `- [${cleanTitle(asset.title)}：${items.length} 个媒体元素](./docx-${sourceAssetId})`
  })
  const output = [
    '---',
    `id: ${VISUAL_INDEX_ID}`,
    'title: 图片与视觉资料库',
    'description: 浏览独立一图流和内容文档中的配套图片。',
    'section: topics',
    'order: 600',
    'audience: ["beginner","regular","advanced","editor"]',
    'contentType: topic',
    'gameVersion: "2026-07"',
    'sourceUpdatedAt: "2026-07-21"',
    'verifiedAt: "2026-07-30"',
    `status: ${pageReviewStatus(VISUAL_INDEX_ID, 'draft')}`,
    'authors:',
    '  - name: DOV-Calc 媒体维护组',
    '    role: 授权图片库维护',
    'reviewers:',
    '  - name: DOV-Calc 视觉审核组',
    '    role: 图片可访问性与授权审核',
    'sources:',
    ...sourceLines,
    'tags: ["图片资料","一图流","媒体索引","响应式图片"]',
    'related: ["about-sources","start-index","combat-index","mechanics-index"]',
    '---',
    '',
    '# 图片与视觉资料库',
    '',
    '按专题浏览图片，进入详情页可查看原始尺寸。',
    '',
    '## 独立一图流',
    '',
    ...standaloneCards,
    '## 文档配套图片',
    '',
    ...docxLinks,
    '',
  ].join('\n')
  const outputPath = path.join(PAGE_ROOT, 'index.md')
  await writeFile(outputPath, output, 'utf8')
  return repositoryPath(outputPath)
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(items[index], index)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  )
  return results
}

await writeFile(
  BUILD_STATE_PATH,
  stableJson({
    schemaVersion: 1,
    state: 'in-progress',
    outputs: [
      repositoryPath(PUBLIC_ROOT),
      repositoryPath(PAGE_ROOT),
      repositoryPath(MANIFEST_ROOT),
      repositoryPath(LIBRARY_PATH),
      repositoryPath(PUBLIC_ASSETS_PATH),
    ],
  }),
  'utf8',
)

const ledger = await loadSourceLedger()
const fullMap = JSON.parse(
  await readFile(
    path.join(root, 'content', 'migrations', 'full-content-map.json'),
    'utf8',
  ),
)
const publicAssets = JSON.parse(await readFile(PUBLIC_ASSETS_PATH, 'utf8'))
await resetManagedMediaCollections(publicAssets)
await safeReset(PAGE_ROOT, PAGE_ROOT)
await safeReset(MANIFEST_ROOT, MANIFEST_ROOT)
const existingPages = await loadPages()
const existingPageIds = new Set(
  existingPages.map((page) => page.frontmatter.id),
)
const assetsById = new Map(ledger.assets.map((asset) => [asset.id, asset]))
const sourceRoot = path.resolve(ledger.sourceRoot.path)
const importReports = await findImportReports()
const contentDocxIds = new Set(
  fullMap.sourceSummaries.docx
    .filter((summary) => summary.contentDocument)
    .map((summary) => summary.sourceAssetId),
)
const relationsByMedia = Object.groupBy(
  fullMap.drawingRelations,
  (relation) => relation.targetMediaElementId ?? 'unresolved',
)

const standaloneAssets = ledger.assets.filter(
  (asset) => asset.assetType === 'image',
)
const standaloneItems = await mapLimit(
  standaloneAssets,
  2,
  async (asset, index) => {
    if (
      asset.publicRelease.asset !== true ||
      asset.publicRelease.derivative !== true
    ) {
      throw new Error(`${asset.id}: standalone image is not public-derivative eligible`)
    }
    const sourcePath = path.resolve(sourceRoot, asset.origin.path)
    const relation = path.relative(sourceRoot, sourcePath)
    if (
      relation.startsWith('..') ||
      path.isAbsolute(relation)
    ) {
      throw new Error(`${asset.id}: source path escapes the registered root`)
    }
    const buffer = await readFile(sourcePath)
    if (sha256(buffer) !== asset.hashes.sha256) {
      throw new Error(`${asset.id}: source hash differs from the authorization ledger`)
    }
    const derived = await deriveVisual(
      buffer,
      path.join(PUBLIC_ROOT, asset.id),
      asset.origin.path,
    )
    const title = cleanTitle(asset.title)
    const detailPageId = `visual-guide-${asset.id.slice(4)}`
    const libraryId = `wiki-image-${asset.hashes.sha256.slice(0, 16)}`
    const relatedPageIds = (STANDALONE_RELATED.get(asset.id) ?? []).filter(
      (pageId) => existingPageIds.has(pageId),
    )
    const item = {
      libraryId,
      sourceAssetId: asset.id,
      sourceElementId:
        fullMap.elements.find(
          (element) =>
            element.sourceAssetId === asset.id &&
            element.elementType === 'image',
        )?.sourceElementId ?? null,
      kind: 'standalone',
      title,
      sourceLabel: asset.title,
      version: asset.origin.updatedAt,
      sourceSha256: asset.hashes.sha256,
      source: {
        ...derived.source,
        bytes: buffer.length,
      },
      original: derived.original,
      authorizationEvidenceId: asset.authorization.evidenceId,
      attribution: asset.authorization.attribution,
      publicRelease: asset.publicRelease,
      downloadAllowed: asset.publicRelease.download === true,
      originalPublicPath: derived.original.publicPath,
      targetPageIds: [VISUAL_INDEX_ID, detailPageId],
      relatedPageIds,
      detailPageId,
      detailRoute: `/topics/visual-guides/${asset.id}`,
      alt: `${title}一图流，包含图中列出的步骤、结论与说明`,
      caption: `${title}；版本日期 ${asset.origin.updatedAt}。原图按授权范围公开。`,
      longImage: derived.longImage,
      thumbnail: derived.thumbnail,
      groups: derived.groups,
      files: derived.files,
      order: index + 1,
    }
    item.detailFile = await writeStandalonePage(item, asset, 610 + index)
    return item
  },
)

const docxMedia = fullMap.elements.filter(
  (element) =>
    contentDocxIds.has(element.sourceAssetId) &&
    element.elementType === 'media',
)
const docxGroups = new Map()
for (const sourceAssetId of contentDocxIds) {
  const asset = assetsById.get(sourceAssetId)
  const report = importReports.get(sourceAssetId)
  if (!asset || !report) {
    throw new Error(`${sourceAssetId}: source asset or import report is missing`)
  }
  if (asset.publicRelease.derivative !== true) {
    throw new Error(`${sourceAssetId}: DOCX derivatives are not authorized`)
  }
  const sourcePath = path.resolve(sourceRoot, asset.origin.path)
  const docxBuffer = await readFile(sourcePath)
  if (sha256(docxBuffer) !== asset.hashes.sha256) {
    throw new Error(`${sourceAssetId}: DOCX hash differs from the ledger`)
  }
  const zip = unzipSync(new Uint8Array(docxBuffer))
  const sourceMedia = docxMedia.filter(
    (element) => element.sourceAssetId === sourceAssetId,
  )
  const items = await mapLimit(sourceMedia, 3, async (media) => {
    const zipEntry = zip[media.sourcePosition.packagePath]
    if (!zipEntry) {
      throw new Error(
        `${media.sourceElementId}: OOXML media entry does not exist`,
      )
    }
    const buffer = Buffer.from(zipEntry)
    if (sha256(buffer) !== media.sha256) {
      throw new Error(`${media.sourceElementId}: media hash differs from the map`)
    }
    const derived = await deriveVisual(
      buffer,
      path.join(
        PUBLIC_ROOT,
        sourceAssetId,
        media.sourceElementId.split(':').at(-1),
      ),
      media.sourcePosition.packagePath,
    )
    const relations = relationsByMedia[media.sourceElementId] ?? []
    const firstBodyIndex = Math.min(
      ...relations
        .map((relation) => relation.sourcePosition?.bodyIndex)
        .filter(Number.isInteger),
    )
    const heading = Number.isFinite(firstBodyIndex)
      ? nearestHeading(report, firstBodyIndex)
      : null
    const context = heading
      ? `“${heading}”章节`
      : `第 ${media.sourcePosition.mediaIndex} 个媒体位置`
    return {
      libraryId: media.targetAssetIds[0],
      sourceAssetId,
      sourceElementId: media.sourceElementId,
      kind: 'docx-media',
      title: `${cleanTitle(asset.title)}：插图 ${media.sourcePosition.mediaIndex}`,
      sourceLabel: asset.title,
      version: asset.origin.updatedAt,
      sourceSha256: media.sha256,
      source: {
        ...derived.source,
        bytes: buffer.length,
        packagePath: media.sourcePosition.packagePath,
        mediaIndex: media.sourcePosition.mediaIndex,
      },
      original: {
        ...derived.original,
        packagePath: media.sourcePosition.packagePath,
        mediaIndex: media.sourcePosition.mediaIndex,
      },
      authorizationEvidenceId: asset.authorization.evidenceId,
      attribution: asset.authorization.attribution,
      publicRelease: {
        ...asset.publicRelease,
        asset: true,
        download: true,
      },
      downloadAllowed: true,
      originalPublicPath: derived.original.publicPath,
      targetPageIds: [
        ...new Set([
          ...media.targetPageIds,
          `media-source-${asset.id.slice(4)}`,
        ]),
      ],
      detailPageId: `media-source-${asset.id.slice(4)}`,
      alt: `《${cleanTitle(asset.title)}》${context}的相关插图`,
      caption: `来源：《${cleanTitle(asset.title)}》${context}；DOCX 内嵌原始媒体按授权范围公开。`,
      longImage: derived.longImage,
      thumbnail: derived.thumbnail,
      groups: derived.groups,
      files: derived.files,
    }
  })
  docxGroups.set(sourceAssetId, items)
}

const docxGalleryPages = []
let docxOrder = 700
for (const [sourceAssetId, items] of docxGroups) {
  const asset = assetsById.get(sourceAssetId)
  const gallery = await writeDocxGalleryPage(items, asset, docxOrder)
  docxOrder += 1
  docxGalleryPages.push({
    sourceAssetId,
    ...gallery,
    mediaElements: items.length,
  })
}

const indexFile = await writeIndexPage({
  standaloneItems,
  docxGroups,
  assetsById,
})
const allItems = [
  ...standaloneItems,
  ...[...docxGroups.values()].flat(),
]
const collections = []
for (const asset of [
  ...standaloneAssets,
  ...[...contentDocxIds].map((id) => assetsById.get(id)),
]) {
  const items = allItems.filter((item) => item.sourceAssetId === asset.id)
  const files = items.flatMap((item) => item.files)
  const originals = items.map((item) => item.original)
  const manifest = {
    schemaVersion: 1,
    generatedAt: GENERATED_AT,
    sourceId: asset.id,
    derivedFrom: asset.hashes.sha256,
    authorizationEvidenceId: asset.authorization.evidenceId,
    downloadAllowed: originals.length > 0,
    originalCopied: originals.length > 0,
    originals,
    files: [...originals, ...files],
    derivatives: files,
  }
  const manifestPath = path.join(MANIFEST_ROOT, `${asset.id}.json`)
  await writeFile(manifestPath, stableJson(manifest), 'utf8')
  if (files.length > 0) {
    collections.push({
      id: `wiki-media-${asset.id}`,
      root: repositoryPath(path.join(PUBLIC_ROOT, asset.id)),
      glob: '**/*',
      expectedFileCount: files.length + originals.length,
      sourceId: asset.id,
      permission: asset.permission,
      publicUse: true,
      derivative: true,
      manifest: repositoryPath(manifestPath),
      download: originals.length > 0,
      pageIds:
        asset.assetType === 'image'
          ? [
              VISUAL_INDEX_ID,
              `visual-guide-${asset.id.slice(4)}`,
            ]
          : [
              VISUAL_INDEX_ID,
              `media-source-${asset.id.slice(4)}`,
            ],
      authorizationEvidenceId: asset.authorization.evidenceId,
    })
  }
}

const retainedCollections = publicAssets.collections.filter(
  (collection) => !collection.id.startsWith('wiki-media-'),
)
await writeFile(
  PUBLIC_ASSETS_PATH,
  stableJson({
    ...publicAssets,
    collections: [...retainedCollections, ...collections],
  }),
  'utf8',
)

const library = {
  schemaVersion: 1,
  generatedAt: GENERATED_AT,
  derivativePolicy: {
    formats: ['avif', 'webp'],
    responsiveWidths: RESPONSIVE_WIDTHS,
    thumbnailWidth: THUMB_WIDTH,
    segmentation: 'disabled',
    maxDerivativePixels: MAX_DERIVATIVE_PIXELS,
    exifPolicy: 'stripped',
    originalPolicy: 'copied-for-authorized-image-and-docx-embedded-media',
  },
  indexPage: {
    id: VISUAL_INDEX_ID,
    file: indexFile,
    route: '/topics/visual-guides/',
  },
  standaloneItems,
  docxGalleryPages,
  docxMediaItems: [...docxGroups.values()].flat(),
  summary: {
    standaloneImages: standaloneItems.length,
    contentDocxSources: docxGroups.size,
    docxMediaElements: [...docxGroups.values()].reduce(
      (total, items) => total + items.length,
      0,
    ),
    libraryItems: allItems.length,
    derivativeFiles: allItems.reduce(
      (total, item) => total + item.files.length,
      0,
    ),
    longImages: allItems.filter((item) => item.longImage).length,
    downloadsAllowed: allItems.filter((item) => item.downloadAllowed).length,
    sourceOriginalsCopied: allItems.filter((item) => item.original).length,
  },
}
await writeFile(LIBRARY_PATH, stableJson(library), 'utf8')

const publicFiles = []
async function collectFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) await collectFiles(absolutePath)
    if (entry.isFile()) publicFiles.push(absolutePath)
  }
}
await collectFiles(PUBLIC_ROOT)
const totalBytes = (
  await Promise.all(publicFiles.map((file) => stat(file)))
).reduce((total, metadata) => total + metadata.size, 0)

await rm(BUILD_STATE_PATH, { force: true })

console.log(
  `Media library generated: ${library.summary.libraryItems} items, ${library.summary.derivativeFiles} derivatives, ${library.summary.longImages} long images, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB.`,
)

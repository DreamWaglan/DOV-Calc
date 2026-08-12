import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  printResult,
  readJson,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

const base = normalizeBase(process.env.DOCS_BASE)
const basePrefix = base === '/' ? '' : base.slice(0, -1)
const BASE_MEDIA_PREFIX = `${basePrefix}/wiki-media/`
const ORIGINAL_PATTERN = /\/wiki-media\/[^"' <>)]+\/original\.(?:png|jpe?g)(?:\?[^"' <>)]+)?/i
const SEGMENT_PATTERN = /\/wiki-media\/[^"' <>)]+\/segment-/i
const THUMBNAIL_PATTERN = /\/wiki-media\/[^"' <>)]+\/thumbnail\.webp(?:\?[^"' <>)]+)?/i

const library = await readJson('content/migrations/media-library.json')
const core = await readJson('content/migrations/core-content-pages.json')
const advanced = await readJson('content/migrations/advanced-content-pages.json')
const fullMap = await readJson('content/migrations/full-content-map.json')
const failures = []
const distRoot = path.join(root, 'docs', '.vitepress', 'dist')

function normalizeBase(value = '/DOV-Calc/') {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

function routeToHtml(route) {
  if (route === '/') return path.join(distRoot, 'index.html')
  if (route.endsWith('/')) {
    return path.join(distRoot, route.slice(1), 'index.html')
  }
  return path.join(distRoot, `${route.slice(1)}.html`)
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1] ?? null
}

function tags(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) ?? []
}

function mediaTags(html, name, attributeName) {
  return tags(html, name).filter((tag) =>
    attribute(tag, attributeName)?.includes('/wiki-media/'),
  )
}

function countDownloadLinks(html) {
  return tags(html, 'a').filter((tag) => {
    const href = attribute(tag, 'href') ?? ''
    return /\sdownload(?:=|[\s>])/i.test(tag) && href.includes('/wiki-media/')
  }).length
}

function countMediaTriggers(html) {
  return tags(html, 'button').filter((tag) =>
    /class="[^"]*\bresponsive-media__trigger\b/i.test(tag),
  ).length
}

function validateMediaImage({ tag, id, policy }) {
  const src = attribute(tag, 'src') ?? ''
  if (!attribute(tag, 'alt')?.trim()) {
    failures.push(`${id}: media image alt is missing`)
  }
  if (!/^\d+$/.test(attribute(tag, 'width') ?? '')) {
    failures.push(`${id}: media image width is missing`)
  }
  if (!/^\d+$/.test(attribute(tag, 'height') ?? '')) {
    failures.push(`${id}: media image height is missing`)
  }
  if (attribute(tag, 'loading') !== 'lazy') {
    failures.push(`${id}: media image must be lazy-loaded`)
  }
  if (attribute(tag, 'decoding') !== 'async') {
    failures.push(`${id}: media image decoding must be async`)
  }
  if (!src.includes(BASE_MEDIA_PREFIX)) {
    failures.push(`${id}: media image does not include ${base} base path`)
  }
  if (SEGMENT_PATTERN.test(src)) {
    failures.push(`${id}: segmented media image remains in src`)
  }
  if (policy === 'thumbnail' && !THUMBNAIL_PATTERN.test(src)) {
    failures.push(`${id}: index/list image must request thumbnail.webp, got ${src}`)
  }
  if (policy === 'original' && !ORIGINAL_PATTERN.test(src)) {
    failures.push(`${id}: detail/content image must request original PNG/JPG/JPEG, got ${src}`)
  }
}

function validateSources({ sources, id, policy }) {
  for (const tag of sources) {
    const srcset = attribute(tag, 'srcset') ?? ''
    if (!srcset || !attribute(tag, 'sizes')) {
      failures.push(`${id}: source srcset/sizes is incomplete`)
    }
    if (!['image/avif', 'image/webp'].includes(attribute(tag, 'type'))) {
      failures.push(`${id}: source type is not AVIF/WebP`)
    }
    if (!srcset.includes(BASE_MEDIA_PREFIX)) {
      failures.push(`${id}: source srcset does not include ${base} base path`)
    }
    if (SEGMENT_PATTERN.test(srcset)) {
      failures.push(`${id}: segmented media source remains in srcset`)
    }
    if (policy === 'thumbnail' && !srcset.split(',').every((part) => THUMBNAIL_PATTERN.test(part))) {
      failures.push(`${id}: index/list source must use thumbnail.webp only`)
    }
    if (policy === 'original' && ORIGINAL_PATTERN.test(srcset)) {
      failures.push(`${id}: original pages should use original fallback img, not picture srcset`)
    }
  }
}

function sourcePageExpectations() {
  const contentSourceIds = new Set([
    ...(core.sources ?? []).map((source) => source.sourceAssetId),
    ...(advanced.sources ?? []).map((source) => source.sourceAssetId),
  ])
  const pages = [...(core.sources ?? []), ...(advanced.sources ?? [])]
    .flatMap((source) =>
      source.pages.map((page) => ({
        id: page.pageId,
        route: page.route,
        figures: 0,
        tableCellFigures: 0,
        policy: 'original',
        kind: 'source-page',
      })),
    )
  const byPage = new Map(pages.map((page) => [page.id, page]))
  for (const relation of fullMap.drawingRelations ?? []) {
    if (!contentSourceIds.has(relation.sourceAssetId) || relation.resolution !== 'media') continue
    for (const pageId of relation.targetPageIds ?? []) {
      const page = byPage.get(pageId)
      if (page) {
        page.figures += 1
        if (relation.placement?.slot === 'table-cell') page.tableCellFigures += 1
      }
    }
  }
  return pages.filter((page) => page.figures > 0)
}

const expectations = [
  {
    id: library.indexPage.id,
    route: library.indexPage.route,
    figures: library.standaloneItems.length,
    policy: 'thumbnail',
    kind: 'visual-index',
  },
  ...library.standaloneItems.map((item) => ({
    id: item.detailPageId,
    route: item.detailRoute,
    figures: 1,
    policy: 'original',
    kind: 'standalone-detail',
  })),
  ...library.docxGalleryPages.map((gallery) => ({
    id: gallery.galleryId,
    route: `/topics/visual-guides/docx-${gallery.sourceAssetId}`,
    figures: library.docxMediaItems.filter(
      (item) => item.sourceAssetId === gallery.sourceAssetId,
    ).length,
    policy: 'original',
    kind: 'docx-gallery',
  })),
  ...sourcePageExpectations(),
]

let auditedFigures = 0
let auditedImages = 0
let auditedDownloads = 0
let thumbnailPages = 0
let originalPages = 0

for (const expectation of expectations) {
  const html = await readFile(routeToHtml(expectation.route), 'utf8').catch(
    () => null,
  )
  if (!html) {
    failures.push(`${expectation.id}: built HTML is missing`)
    continue
  }
  const figures = tags(html, 'figure').filter((tag) =>
    /class="[^"]*\bresponsive-media\b/i.test(tag),
  )
  const pictures = tags(html, 'picture')
  const captions = tags(html, 'figcaption')
  const mediaImages = mediaTags(html, 'img', 'src')
  const mediaSources = mediaTags(html, 'source', 'srcset')
  const downloads = countDownloadLinks(html)
  const triggers = countMediaTriggers(html)
  const htmlOriginalMatches = html.match(new RegExp(ORIGINAL_PATTERN.source, 'gi')) ?? []
  const htmlSegmentMatches = html.match(new RegExp(SEGMENT_PATTERN.source, 'gi')) ?? []

  auditedFigures += figures.length
  auditedImages += mediaImages.length
  auditedDownloads += downloads
  if (expectation.policy === 'thumbnail') thumbnailPages += 1
  if (expectation.policy === 'original') originalPages += 1

  if (
    figures.length !== expectation.figures ||
    pictures.length < expectation.figures ||
    mediaImages.length !== expectation.figures
  ) {
    failures.push(
      `${expectation.id}: expected ${expectation.figures} responsive figures, got ${figures.length}/${pictures.length}/${mediaImages.length}`,
    )
  }
  const modes = figures.map((tag) => attribute(tag, 'data-media-mode'))
  const expectedTableCellFigures = expectation.tableCellFigures ?? 0
  const expectedViewerFigures =
    expectation.policy === 'original'
      ? expectation.figures - expectedTableCellFigures
      : 0
  const actualTableCellFigures = modes.filter((mode) => mode === 'table-cell').length
  const actualViewerFigures = modes.filter((mode) => mode === 'viewer').length
  const actualIndexFigures = modes.filter((mode) => mode === 'index').length
  if (
    actualTableCellFigures !== expectedTableCellFigures ||
    actualViewerFigures !== expectedViewerFigures ||
    actualIndexFigures !== (expectation.policy === 'thumbnail' ? expectation.figures : 0)
  ) {
    failures.push(
      `${expectation.id}: display modes differ (viewer ${actualViewerFigures}/${expectedViewerFigures}, table-cell ${actualTableCellFigures}/${expectedTableCellFigures}, index ${actualIndexFigures})`,
    )
  }
  const governanceAttributes = figures.filter(
    (tag) => attribute(tag, 'data-download-allowed') !== null,
  )
  if (governanceAttributes.length) {
    failures.push(`${expectation.id}: ${governanceAttributes.length} media figures expose download governance attributes`)
  }
  if (htmlSegmentMatches.length) {
    failures.push(`${expectation.id}: segmented media references remain`)
  }
  if (expectation.policy === 'thumbnail') {
    if (captions.length !== 0 || downloads !== 0) {
      failures.push(
        `${expectation.id}: index cards must not expose captions or download links (${captions.length}/${downloads})`,
      )
    }
    if (triggers !== 0) {
      failures.push(`${expectation.id}: index cards must not use original viewer triggers`)
    }
    const originalImageTags = mediaImages.filter((tag) =>
      ORIGINAL_PATTERN.test(attribute(tag, 'src') ?? ''),
    )
    const originalSourceTags = mediaSources.filter((tag) =>
      ORIGINAL_PATTERN.test(attribute(tag, 'srcset') ?? ''),
    )
    if (originalImageTags.length || originalSourceTags.length) {
      failures.push(`${expectation.id}: index/list requested original media in img/source`)
    }
  }
  if (expectation.policy === 'original') {
    if (captions.length !== 0 || downloads !== 0) {
      failures.push(
        `${expectation.id}: original content must not expose inline captions/download cards (${captions.length}/${downloads})`,
      )
    }
    if (triggers !== expectation.figures) {
      failures.push(
        `${expectation.id}: expected ${expectation.figures} viewer triggers, got ${triggers}`,
      )
    }
    if (htmlOriginalMatches.length < expectation.figures) {
      failures.push(
        `${expectation.id}: original image paths are missing from built HTML (${htmlOriginalMatches.length})`,
      )
    }
    if (mediaSources.length !== 0) {
      failures.push(
        `${expectation.id}: original media pages must render variants=[] with no picture source tags`,
      )
    }
  }
  for (const tag of mediaImages) {
    validateMediaImage({ tag, id: expectation.id, policy: expectation.policy })
  }
  validateSources({
    sources: mediaSources,
    id: expectation.id,
    policy: expectation.policy,
  })
}

const expectedFigures = expectations.reduce(
  (total, expectation) => total + expectation.figures,
  0,
)
const report = {
  schemaVersion: 2,
  check: 'built-media-pages',
  base,
  summary: {
    pages: expectations.length,
    thumbnailPages,
    originalPages,
    expectedFigures,
    auditedFigures,
    auditedImages,
    auditedDownloads,
    failures: failures.length,
  },
  policies: {
    thumbnail: 'visual index/list pages request only thumbnail.webp and expose no original path or download link',
    original: 'standalone detail, DOCX gallery and source content pages render original images in an interaction-only viewer',
    presentation: 'public media has no inline caption, source, version, authorization or download UI; governance remains in repository records',
    segmentedMediaAllowed: false,
  },
  expectations,
  failures,
}
const reportPath = await writeReport('media-page-audit', report)
printResult('Built media page audit', failures, reportPath)

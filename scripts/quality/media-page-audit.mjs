import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  printResult,
  readJson,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

const library = await readJson('content/migrations/media-library.json')
const failures = []
const distRoot = path.join(root, 'docs', '.vitepress', 'dist')

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

const expectations = [
  {
    id: library.indexPage.id,
    route: library.indexPage.route,
    figures: library.standaloneItems.length,
  },
  ...library.standaloneItems.map((item) => ({
    id: item.detailPageId,
    route: item.detailRoute,
    figures: item.groups.length,
  })),
  ...library.docxGalleryPages.map((gallery) => ({
    id: gallery.galleryId,
    route: `/topics/visual-guides/docx-${gallery.sourceAssetId}`,
    figures: library.docxMediaItems
      .filter((item) => item.sourceAssetId === gallery.sourceAssetId)
      .reduce((total, item) => total + item.groups.length, 0),
  })),
]

let auditedFigures = 0
let auditedImages = 0
for (const expectation of expectations) {
  const html = await readFile(routeToHtml(expectation.route), 'utf8').catch(
    () => null,
  )
  if (!html) {
    failures.push(`${expectation.id}: built HTML is missing`)
    continue
  }
  const figures = html.match(/<figure\b[^>]*class="responsive-media"[^>]*>/g) ?? []
  const pictures = html.match(/<picture>/g) ?? []
  const captions = html.match(/<figcaption>/g) ?? []
  const images = html.match(/<img\b[^>]*>/g) ?? []
  const mediaImages = images.filter((tag) =>
    attribute(tag, 'src')?.includes('/wiki-media/'),
  )
  const sources = html.match(/<source\b[^>]*>/g) ?? []
  const mediaSources = sources.filter((tag) =>
    attribute(tag, 'srcset')?.includes('/wiki-media/'),
  )
  auditedFigures += figures.length
  auditedImages += mediaImages.length
  if (
    figures.length !== expectation.figures ||
    pictures.length < expectation.figures ||
    captions.length < expectation.figures ||
    mediaImages.length !== expectation.figures
  ) {
    failures.push(
      `${expectation.id}: expected ${expectation.figures} responsive figures, got ${figures.length}/${pictures.length}/${captions.length}/${mediaImages.length}`,
    )
  }
  for (const tag of mediaImages) {
    if (
      !attribute(tag, 'alt')?.trim() ||
      !/^\d+$/.test(attribute(tag, 'width') ?? '') ||
      !/^\d+$/.test(attribute(tag, 'height') ?? '') ||
      attribute(tag, 'loading') !== 'lazy' ||
      attribute(tag, 'decoding') !== 'async'
    ) {
      failures.push(`${expectation.id}: media image attributes are incomplete`)
    }
    const src = attribute(tag, 'src') ?? ''
    if (
      !src.includes('/DOV-Calc/wiki-media/') ||
      /\.(?:png|jpe?g)(?:$|\?)/i.test(src)
    ) {
      failures.push(`${expectation.id}: media fallback path violates base/format policy`)
    }
  }
  for (const tag of mediaSources) {
    if (
      !attribute(tag, 'srcset') ||
      !attribute(tag, 'sizes') ||
      !['image/avif', 'image/webp'].includes(attribute(tag, 'type'))
    ) {
      failures.push(`${expectation.id}: source srcset/sizes/type is incomplete`)
    }
  }
  if (/<a\b[^>]*\sdownload(?:=|[\s>])/i.test(html)) {
    failures.push(`${expectation.id}: unauthorized download link is rendered`)
  }
  if (
    /\/wiki-media\/[^"' ]+\.(?:png|jpe?g)/i.test(html) ||
    html.includes('originalPublicPath')
  ) {
    failures.push(`${expectation.id}: original image path is present in HTML`)
  }
}

const report = {
  schemaVersion: 1,
  check: 'built-media-pages',
  summary: {
    pages: expectations.length,
    expectedFigures: expectations.reduce(
      (total, expectation) => total + expectation.figures,
      0,
    ),
    auditedFigures,
    auditedImages,
    downloadsRendered: 0,
    originalPathsRendered: 0,
    failures: failures.length,
  },
  failures,
}
const reportPath = await writeReport('media-page-audit', report)
printResult('Built media page audit', failures, reportPath)

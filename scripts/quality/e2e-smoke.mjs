import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import puppeteer from 'puppeteer-core'
import {
  printResult,
  readJson,
  relative,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'
import { launchBrowser } from './lib/browser-launch.mjs'

const port = Number(process.env.DOCS_E2E_PORT || 4174)
const base = normalizeBase(process.env.DOCS_BASE)
const previewOrigin = `http://127.0.0.1:${port}`
const vitepressCli = path.join(
  root,
  'node_modules',
  'vitepress',
  'bin',
  'vitepress.js',
)
const screenshotRoot = path.join(
  root,
  'content',
  'reports',
  'screenshots',
)
const failures = []
const browserErrors = []
const pageChecks = []
const screenshots = []
const mediaRequests = []
const mediaPolicyChecks = {
  indexThumbnail: 0,
  longOriginal: 0,
  sourceOriginal: 0,
}
const imageViewerChecks = {
  pureImagePresentation: 0,
  intrinsicSize: 0,
  openAndClose: 0,
  controls: 0,
  wheelAndDoubleClick: 0,
  keyboardShortcuts: 0,
  keyboardPan: 0,
  pointerPan: 0,
  touchGestures: 0,
  mobileSafeArea: 0,
  noGovernanceUi: 0,
  focusReturn: 0,
}
let legacyRedirectChecks = 0
let tabletNavigationChecks = 0
const redirectLedger = JSON.parse(
  await readFile(
    path.join(root, 'content', 'governance', 'redirects.json'),
    'utf8',
  ),
)
const mediaLibrary = await readJson('content/migrations/media-library.json')
const corePages = await readJson('content/migrations/core-content-pages.json')
const advancedPages = await readJson('content/migrations/advanced-content-pages.json')
const fullContentMap = await readJson('content/migrations/full-content-map.json')
const sourceMediaProbeRoute = selectSourceMediaProbeRoute()

function normalizeBase(value = '/DOV-Calc/') {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

function routeUrl(route) {
  const suffix = route === '/' ? '' : route.replace(/^\//, '')
  return new URL(suffix, `${previewOrigin}${base}`).toString()
}

function isOriginalMediaUrl(url) {
  return /\/wiki-media\/.+\/original\.(?:png|jpe?g)(?:[\s?]|$)/i.test(url)
}

function isThumbnailMediaUrl(url) {
  return /\/wiki-media\/.+\/thumbnail\.webp(?:[\s?]|$)/i.test(url)
}

function isSegmentMediaUrl(url) {
  return /\/wiki-media\/.+\/segment-/i.test(url)
}

function mediaPolicyForRoute(route) {
  if (route === '/topics/visual-guides/') return 'thumbnail'
  if (route.startsWith('/topics/visual-guides/') || route === sourceMediaProbeRoute) return 'original'
  return 'mixed'
}

function selectSourceMediaProbeRoute() {
  const contentSourceIds = new Set([
    ...(corePages.sources ?? []).map((source) => source.sourceAssetId),
    ...(advancedPages.sources ?? []).map((source) => source.sourceAssetId),
  ])
  const routeByPageId = new Map(
    [...(corePages.sources ?? []), ...(advancedPages.sources ?? [])].flatMap(
      (source) => source.pages.map((page) => [page.pageId, page.route]),
    ),
  )
  const counts = new Map()
  for (const relation of fullContentMap.drawingRelations ?? []) {
    if (!contentSourceIds.has(relation.sourceAssetId) || relation.resolution !== 'media') continue
    for (const pageId of relation.targetPageIds ?? []) {
      counts.set(pageId, (counts.get(pageId) ?? 0) + 1)
    }
  }
  const [pageId] = [...counts.entries()]
    .filter(([id]) => routeByPageId.has(id))
    .sort((left, right) => left[1] - right[1])[0] ?? []
  return pageId ? routeByPageId.get(pageId) : '/start/game-introduction'
}

async function waitForPreview(url, timeoutMs = 30_000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`preview did not become ready at ${url}`)
}

async function findBrowserPath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Continue to the next installed Chromium browser.
    }
  }
  throw new Error('No Chromium browser was found for end-to-end tests.')
}

async function inspectLayout(page, route, viewport, options = {}) {
  const response = await page.goto(routeUrl(route), {
    waitUntil: 'networkidle0',
    timeout: 45_000,
  })
  const metrics = await page.evaluate(() => {
    const visible = (element) => {
      const style = window.getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return (
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        rect.width > 0 &&
        rect.height > 0
      )
    }
    const toolTargets = [
      ...document.querySelectorAll(
        '.damage-calculator button, .damage-calculator input, .damage-calculator select, .equipment-lookup button, .equipment-lookup input, .equipment-lookup select, .basic-attack-explorer button, .basic-attack-explorer input, .basic-attack-explorer select',
      ),
    ]
      .filter(visible)
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          element: element.tagName.toLowerCase(),
          label:
            element.getAttribute('aria-label') ||
            element.textContent?.trim().slice(0, 80) ||
            element.getAttribute('placeholder') ||
            '',
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        }
      })
    const undersizedTargets = toolTargets.filter(
      (target) => target.width < 44 || target.height < 44,
    )
    const tables = [...document.querySelectorAll('.vp-doc table')].map(
      (table) => {
        const style = window.getComputedStyle(table)
        return {
          scrollWidth: table.scrollWidth,
          clientWidth: table.clientWidth,
          overflowX: style.overflowX,
          focusable: table.getAttribute('tabindex') === '0',
          label: table.getAttribute('aria-label'),
        }
      },
    )
    const viewportWidth = document.documentElement.clientWidth
    const overflowingElements = [...document.querySelectorAll('body *')]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return visible(element) && rect.right > viewportWidth + 1
      })
      .slice(0, 12)
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          element: element.tagName.toLowerCase(),
          className:
            typeof element.className === 'string'
              ? element.className.slice(0, 120)
              : '',
          text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        }
      })

    const responsiveMedia = [
      ...document.querySelectorAll('.responsive-media'),
    ].map((figure) => {
      const image = figure.querySelector('img')
      const sources = [...figure.querySelectorAll('source')]
      const download = figure.querySelector('a[download]')
      const figureStyle = window.getComputedStyle(figure)
      const imageRect = image?.getBoundingClientRect()
      return {
        mode: figure.getAttribute('data-media-mode') ?? '',
        alt: image?.getAttribute('alt') ?? '',
        imgSrc: image?.getAttribute('src') ?? '',
        width: image?.getAttribute('width') ?? '',
        height: image?.getAttribute('height') ?? '',
        naturalWidth: image?.naturalWidth ?? 0,
        renderedWidth: imageRect?.width ?? 0,
        loading: image?.getAttribute('loading') ?? '',
        decoding: image?.getAttribute('decoding') ?? '',
        downloadHref: download?.getAttribute('href') ?? '',
        hasTrigger: Boolean(figure.querySelector('.responsive-media__trigger')),
        sourceCount: sources.length,
        sourceSrcsets: sources.map((source) => source.getAttribute('srcset') ?? ''),
        completeSources: sources.filter(
          (source) =>
            source.hasAttribute('srcset') &&
            source.hasAttribute('sizes') &&
            ['image/avif', 'image/webp'].includes(
              source.getAttribute('type') ?? '',
            ),
        ).length,
        caption: figure.querySelector('figcaption')?.textContent?.trim() ?? '',
        borderTopWidth: figureStyle.borderTopWidth,
        backgroundColor: figureStyle.backgroundColor,
      }
    })

    return {
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      documentScrollWidth: document.documentElement.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
      overflowingElements,
      statusVisible: Boolean(document.querySelector('.page-status')),
      sourcesVisible: Boolean(document.querySelector('.source-list')),
      relatedVisible: Boolean(document.querySelector('.related-pages')),
      tables,
      toolTargets: toolTargets.length,
      undersizedTargets,
      responsiveMedia,
    }
  })

  if (!response || response.status() < 200 || response.status() >= 400) {
    failures.push(`${viewport}:${route}: HTTP ${response?.status() ?? 'none'}`)
  }
  if (metrics.h1Count !== 1) {
    failures.push(`${viewport}:${route}: expected one H1, found ${metrics.h1Count}`)
  }
  if (metrics.documentOverflow) {
    failures.push(
      `${viewport}:${route}: document overflows ${metrics.documentScrollWidth}/${metrics.documentClientWidth}`,
    )
  }
  if (options.requirePageChrome) {
    if (!metrics.statusVisible) failures.push(`${viewport}:${route}: status missing`)
    if (!metrics.relatedVisible) failures.push(`${viewport}:${route}: related pages missing`)
  }
  if (metrics.sourcesVisible) {
    failures.push(`${viewport}:${route}: public source list must not be rendered`)
  }
  if (metrics.undersizedTargets.length) {
    failures.push(
      `${viewport}:${route}: undersized tool targets ${JSON.stringify(metrics.undersizedTargets.slice(0, 5))}`,
    )
  }
  for (const table of metrics.tables) {
    if (!table.focusable || !table.label) {
      failures.push(`${viewport}:${route}: table lacks keyboard label`)
    }
    if (
      table.scrollWidth > table.clientWidth + 1 &&
      !['auto', 'scroll'].includes(table.overflowX)
    ) {
      failures.push(`${viewport}:${route}: wide table lacks local scrolling`)
    }
  }
  for (const media of metrics.responsiveMedia) {
    const mediaPolicy = options.mediaPolicy ?? mediaPolicyForRoute(route)
    if (
      !media.alt ||
      !/^\d+$/.test(media.width) ||
      !/^\d+$/.test(media.height) ||
      media.loading !== 'lazy' ||
      media.decoding !== 'async' ||
      media.completeSources !== media.sourceCount ||
      !media.mode
    ) {
      failures.push(`${viewport}:${route}: responsive media contract is incomplete`)
    }
    if (isSegmentMediaUrl(media.imgSrc) || media.sourceSrcsets.some(isSegmentMediaUrl)) {
      failures.push(`${viewport}:${route}: segmented media URL was rendered`)
    }
    if (mediaPolicy === 'thumbnail') {
      if (
        media.mode !== 'index' ||
        media.caption ||
        media.downloadHref ||
        media.hasTrigger
      ) {
        failures.push(`${viewport}:${route}: thumbnail media must be image-only with no download UI`)
      }
      if (!isThumbnailMediaUrl(media.imgSrc)) {
        failures.push(`${viewport}:${route}: index media img is not thumbnail.webp`)
      }
      if (
        media.sourceCount === 0 ||
        !media.sourceSrcsets.every((srcset) =>
          srcset.split(',').every((part) => isThumbnailMediaUrl(part)),
        )
      ) {
        failures.push(`${viewport}:${route}: index media sources are not thumbnail-only`)
      }
    }
    if (mediaPolicy === 'original') {
      if (
        media.mode !== 'viewer' ||
        media.caption ||
        media.downloadHref ||
        !media.hasTrigger ||
        media.borderTopWidth !== '0px' ||
        media.backgroundColor !== 'rgba(0, 0, 0, 0)'
      ) {
        failures.push(`${viewport}:${route}: original media is not a pure-image viewer trigger`)
      }
      if (!isOriginalMediaUrl(media.imgSrc)) {
        failures.push(`${viewport}:${route}: content/detail media img is not original PNG/JPG/JPEG`)
      }
      if (media.sourceSrcsets.some((srcset) => srcset.includes('/wiki-media/'))) {
        failures.push(`${viewport}:${route}: original media page should not use derivative source srcset`)
      }
      if (
        media.naturalWidth > 0 &&
        media.renderedWidth > media.naturalWidth + 1
      ) {
        failures.push(
          `${viewport}:${route}: original media was upscaled ${media.renderedWidth}/${media.naturalWidth}`,
        )
      }
    }
  }

  pageChecks.push({ viewport, route, ...metrics })
}

async function capture(page, name) {
  const filePath = path.join(screenshotRoot, `${name}.png`)
  await page.screenshot({ path: filePath, fullPage: false })
  const bytes = await readFile(filePath)
  screenshots.push({
    file: relative(filePath),
    bytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  })
}

async function captureMediaRequestsDuring(action) {
  const start = mediaRequests.length
  await action()
  return mediaRequests.slice(start)
}

function assertNoSegmentRequests(label, requests) {
  const segmentRequests = requests.filter(isSegmentMediaUrl)
  if (segmentRequests.length) {
    failures.push(`${label}: segmented media was requested ${segmentRequests.slice(0, 3).join(' | ')}`)
  }
}

function assertThumbnailRequestPolicy(label, requests) {
  assertNoSegmentRequests(label, requests)
  const thumbnailRequests = requests.filter(isThumbnailMediaUrl)
  const originalRequests = requests.filter(isOriginalMediaUrl)
  if (thumbnailRequests.length === 0) {
    failures.push(`${label}: no thumbnail.webp media request was observed`)
  }
  if (originalRequests.length) {
    failures.push(`${label}: index/list requested original media ${originalRequests.slice(0, 3).join(' | ')}`)
  }
}

function assertOriginalRequestPolicy(label, requests) {
  assertNoSegmentRequests(label, requests)
  const originalRequests = requests.filter(isOriginalMediaUrl)
  if (originalRequests.length === 0) {
    failures.push(`${label}: no original PNG/JPG/JPEG media request was observed`)
  }
}

await mkdir(screenshotRoot, { recursive: true })
const browserPath = await findBrowserPath()
const preview = spawn(
  process.execPath,
  [
    vitepressCli,
    'preview',
    'docs',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
  ],
  {
    cwd: root,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  },
)
let previewOutput = ''
preview.stdout.on('data', (chunk) => {
  previewOutput += chunk.toString()
})
preview.stderr.on('data', (chunk) => {
  previewOutput += chunk.toString()
})

let chromium
let browserProfile
try {
  await waitForPreview(routeUrl('/'))
  const browserProfileRoot = path.join(root, '.omx', 'browser-profiles')
  await mkdir(browserProfileRoot, { recursive: true })
  browserProfile = await mkdtemp(path.join(browserProfileRoot, 'e2e-'))
  chromium = await launchBrowser(puppeteer, {
    executablePath: browserPath,
    userDataDir: browserProfile,
    args: ['--no-sandbox', '--disable-gpu'],
  })
  const page = await chromium.newPage()
  page.on('request', (request) => {
    if (request.url().includes('/wiki-media/')) {
      mediaRequests.push(request.url())
    }
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })

  for (const redirect of redirectLedger.redirects.filter(
    (entry) => entry.status === 'active',
  )) {
    await page.goto(routeUrl(redirect.legacyPath), {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    })
    const expected = new URL(routeUrl(redirect.targetPath))
    await page
      .waitForFunction(
        (expectedPathname, expectedHash) =>
          location.pathname === expectedPathname &&
          decodeURIComponent(location.hash) === expectedHash,
        { timeout: 10_000 },
        expected.pathname,
        decodeURIComponent(expected.hash),
      )
      .then(() => {
        legacyRedirectChecks += 1
      })
      .catch(() => {
        failures.push(
          `legacy redirect unresolved: ${redirect.legacyPath} -> ${redirect.targetPath}`,
        )
      })
  }

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  for (const route of [
    '/',
    '/start/game-introduction',
    '/start/first-week',
    '/progression/leveling',
    '/combat/pve-team-building',
    '/data/basic-attack-cd',
    '/tools/dov-basic',
    '/tools/equipment-lookup',
    '/tools/basic-attack-lookup',
    '/topics/visual-guides/',
    '/topics/visual-guides/src-ec1754535996',
    sourceMediaProbeRoute,
  ]) {
    await inspectLayout(page, route, 'desktop-1440', {
      requirePageChrome: route !== '/',
    })
  }

  await page.setViewport({ width: 360, height: 640, deviceScaleFactor: 2 })
  for (const route of [
    '/',
    '/progression/leveling',
    '/data/basic-attack-cd',
    '/topics/new-player-checklist',
    '/tools/dov-basic',
    '/tools/equipment-lookup',
    '/tools/basic-attack-lookup',
    '/topics/visual-guides/',
    '/topics/visual-guides/src-ec1754535996',
    sourceMediaProbeRoute,
  ]) {
    await inspectLayout(page, route, 'mobile-360', {
      requirePageChrome: route !== '/',
    })
    if (route === '/') await capture(page, 'home-mobile-360')
    if (route === '/tools/dov-basic') {
      await capture(page, 'damage-calculator-mobile-360')
    }
    if (route === '/tools/equipment-lookup') {
      await capture(page, 'equipment-lookup-mobile-360')
    }
    if (route === '/tools/basic-attack-lookup') {
      await page.waitForSelector('.tool-loading button', { timeout: 10_000 })
      await page.click('.tool-loading button')
      await page.waitForSelector('.basic-attack-explorer', {
        timeout: 10_000,
      })
      await page.$eval('.basic-attack-explorer', (element) =>
        element.scrollIntoView({ block: 'start' }),
      )
      await capture(page, 'basic-attack-lookup-mobile-360')
    }
    if (route === '/topics/visual-guides/') {
      await page.$eval('.responsive-media', (element) =>
        element.scrollIntoView({ block: 'start' }),
      )
      await page.waitForFunction(
        () => {
          const image = document.querySelector('.responsive-media img')
          return image?.complete && image.naturalWidth > 0
        },
        { timeout: 15_000 },
      )
      await capture(page, 'visual-media-index-mobile-360')
    }
    if (route === '/topics/visual-guides/src-ec1754535996') {
      await page.$eval('.responsive-media', (element) =>
        element.scrollIntoView({ block: 'start' }),
      )
      await page.waitForFunction(
        () => {
          const image = document.querySelector('.responsive-media img')
          return image?.complete && image.naturalWidth > 0
        },
        { timeout: 15_000 },
      )
      await capture(page, 'long-original-image-mobile-360')
    }
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
  for (const route of [
    '/',
    '/start/first-week',
    '/data/basic-attack-cd',
    '/tools/equipment-lookup',
    '/topics/visual-guides/',
  ]) {
    await inspectLayout(page, route, 'mobile-390', {
      requirePageChrome: route !== '/',
    })
  }

  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 })
  for (const route of [
    '/',
    '/progression/leveling',
    '/combat/pve-team-building',
    '/tools/dov-basic',
    '/topics/visual-guides/src-ec1754535996',
    sourceMediaProbeRoute,
  ]) {
    await inspectLayout(page, route, 'tablet-768', {
      requirePageChrome: route !== '/',
    })
  }

  const tabletMenuButton = await page.$('.VPNavBarHamburger')
  if (!tabletMenuButton) {
    failures.push('tablet navigation: hamburger button is missing')
  } else {
    const tabletMenuVisible = await tabletMenuButton.evaluate((element) => {
      const style = getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width >= 44 &&
        rect.height >= 44
      )
    })
    if (!tabletMenuVisible) {
      failures.push('tablet navigation: hamburger button is not usable')
    } else {
      await tabletMenuButton.click()
      await page.waitForSelector('.VPNavScreen', {
        visible: true,
        timeout: 10_000,
      })
      const tabletMenuLinks = await page.$$eval(
        '.VPNavScreen a',
        (links) => links.length,
      )
      if (tabletMenuLinks < 5) {
        failures.push(
          `tablet navigation: only ${tabletMenuLinks} menu links are rendered`,
        )
      } else {
        tabletNavigationChecks += 1
      }
      await tabletMenuButton.click()
      await page.waitForSelector('.VPNavScreen', {
        hidden: true,
        timeout: 10_000,
      })
    }
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
  const indexRequests = await captureMediaRequestsDuring(async () => {
    await page.goto(routeUrl('/topics/visual-guides/'), {
      waitUntil: 'networkidle0',
      timeout: 45_000,
    })
    await page.$eval('.responsive-media', (element) =>
      element.scrollIntoView({ block: 'center' }),
    )
    await page.waitForFunction(
      () => {
        const image = document.querySelector('.responsive-media img')
        return image?.complete && image.naturalWidth > 0
      },
      { timeout: 15_000 },
    )
  })
  assertThumbnailRequestPolicy('visual media index', indexRequests)
  mediaPolicyChecks.indexThumbnail += 1

  const longImageRoute =
    mediaLibrary.standaloneItems.find((item) => item.longImage)?.detailRoute ??
    '/topics/visual-guides/src-ec1754535996'
  const longImageRequests = await captureMediaRequestsDuring(async () => {
    await page.goto(routeUrl(longImageRoute), {
      waitUntil: 'networkidle0',
      timeout: 45_000,
    })
    await page.$eval('.responsive-media', (element) =>
      element.scrollIntoView({ block: 'center' }),
    )
    await page.waitForFunction(
      () => {
        const figures = document.querySelectorAll('.responsive-media')
        const figure = document.querySelector('.responsive-media')
        const image = document.querySelector('.responsive-media img')
        return (
          figures.length === 1 &&
          figure?.getAttribute('data-media-mode') === 'viewer' &&
          Boolean(figure.querySelector('.responsive-media__trigger')) &&
          !figure.querySelector('figcaption') &&
          !figure.querySelector('a[download]') &&
          image?.complete &&
          image.naturalWidth > 0 &&
          /\/wiki-media\/.+\/original\.(png|jpe?g)$/i.test(image.getAttribute('src') ?? '') &&
          !document.body.innerHTML.includes('segment-')
        )
      },
      { timeout: 15_000 },
    )
  })
  assertOriginalRequestPolicy('long original detail', longImageRequests)
  mediaPolicyChecks.longOriginal += 1

  const sourceRequests = await captureMediaRequestsDuring(async () => {
    await page.goto(routeUrl(sourceMediaProbeRoute), {
      waitUntil: 'networkidle0',
      timeout: 45_000,
    })
    await page.$eval('.responsive-media', (element) =>
      element.scrollIntoView({ block: 'center' }),
    )
    await page.waitForFunction(
      () => {
        const figure = document.querySelector('.responsive-media')
        const image = document.querySelector('.responsive-media img')
        return (
          figure?.getAttribute('data-media-mode') === 'viewer' &&
          Boolean(figure.querySelector('.responsive-media__trigger')) &&
          !figure.querySelector('figcaption') &&
          !figure.querySelector('a[download]') &&
          image?.complete &&
          image.naturalWidth > 0 &&
          /\/wiki-media\/.+\/original\.(png|jpe?g)$/i.test(image.getAttribute('src') ?? '')
        )
      },
      { timeout: 15_000 },
    )
  })
  assertOriginalRequestPolicy('source content media', sourceRequests)
  mediaPolicyChecks.sourceOriginal += 1

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await page.goto(routeUrl('/start/new-account'), {
    waitUntil: 'networkidle0',
    timeout: 45_000,
  })
  const intrinsicImageSelector = '.responsive-media img[width="606"][height="164"]'
  await page.$eval(intrinsicImageSelector, (element) =>
    element.scrollIntoView({ block: 'center' }),
  )
  await page.waitForFunction(
    (selector) => {
      const image = document.querySelector(selector)
      return image?.complete && image.naturalWidth === 606
    },
    { timeout: 15_000 },
    intrinsicImageSelector,
  )
  const pureImageMetrics = await page.$eval(intrinsicImageSelector, (image) => {
    const figure = image.closest('.responsive-media')
    const trigger = image.closest('.responsive-media__trigger')
    const figureStyle = figure ? getComputedStyle(figure) : null
    const rect = image.getBoundingClientRect()
    return {
      mode: figure?.getAttribute('data-media-mode'),
      hasCaption: Boolean(figure?.querySelector('figcaption')),
      hasInlineDownload: Boolean(figure?.querySelector('a[download]')),
      triggerLabel: trigger?.getAttribute('aria-label') ?? '',
      renderedWidth: rect.width,
      naturalWidth: image.naturalWidth,
      borderTopWidth: figureStyle?.borderTopWidth,
      backgroundColor: figureStyle?.backgroundColor,
    }
  })
  if (
    pureImageMetrics.mode !== 'viewer' ||
    pureImageMetrics.hasCaption ||
    pureImageMetrics.hasInlineDownload ||
    !pureImageMetrics.triggerLabel.startsWith('查看原图：') ||
    pureImageMetrics.borderTopWidth !== '0px' ||
    pureImageMetrics.backgroundColor !== 'rgba(0, 0, 0, 0)'
  ) {
    failures.push(`image viewer: default media is not image-only ${JSON.stringify(pureImageMetrics)}`)
  } else {
    imageViewerChecks.pureImagePresentation += 1
  }
  if (pureImageMetrics.renderedWidth > pureImageMetrics.naturalWidth + 1) {
    failures.push(
      `image viewer: 606px original was upscaled to ${pureImageMetrics.renderedWidth}px`,
    )
  } else {
    imageViewerChecks.intrinsicSize += 1
  }
  await capture(page, 'pure-original-image-desktop-1440')

  await page.$eval(intrinsicImageSelector, (image) => {
    const trigger = image.closest('.responsive-media__trigger')
    if (!(trigger instanceof HTMLButtonElement)) throw new Error('viewer trigger missing')
    trigger.focus()
    trigger.click()
  })
  await page.waitForSelector('.image-viewer__dialog', {
    visible: true,
    timeout: 10_000,
  })
  const viewerMetrics = await page.$eval('.image-viewer__dialog', (element) => {
    const buttons = [...element.querySelectorAll('button')]
    return {
      role: element.getAttribute('role'),
      ariaModal: element.getAttribute('aria-modal'),
      activeLabel: document.activeElement?.getAttribute('aria-label') ?? '',
      hasDownload: Boolean(element.querySelector('[download], .image-viewer__download')),
      hasInfo: Boolean(element.querySelector('.image-viewer__info, details')),
      text: element.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      buttonLabels: buttons.map(
        (button) => button.getAttribute('aria-label') || button.textContent?.trim() || '',
      ),
      viewerImageSrc: element.querySelector('img')?.getAttribute('src') ?? '',
    }
  })
  if (
    viewerMetrics.role !== 'dialog' ||
    viewerMetrics.ariaModal !== 'true' ||
    viewerMetrics.activeLabel !== '关闭原图查看器'
  ) {
    failures.push(`image viewer: dialog semantics/focus are incomplete ${JSON.stringify(viewerMetrics)}`)
  } else {
    imageViewerChecks.openAndClose += 1
  }
  if (
    !['缩小图片', '放大图片', '适应窗口', '100%', '关闭原图查看器'].every((label) =>
      viewerMetrics.buttonLabels.includes(label),
    )
  ) {
    failures.push(`image viewer: controls are incomplete ${JSON.stringify(viewerMetrics.buttonLabels)}`)
  } else {
    imageViewerChecks.controls += 1
  }
  if (
    !isOriginalMediaUrl(viewerMetrics.viewerImageSrc) ||
    viewerMetrics.hasDownload ||
    viewerMetrics.hasInfo ||
    /(来源|版本|授权|下载原图)/.test(viewerMetrics.text)
  ) {
    failures.push(`image viewer: public governance UI was rendered ${JSON.stringify(viewerMetrics)}`)
  } else {
    imageViewerChecks.noGovernanceUi += 1
  }

  await page.click('button[aria-label="放大图片"]')
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() === '125%',
    { timeout: 10_000 },
  )
  await page.click('button[aria-label="缩小图片"]')
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() === '100%',
    { timeout: 10_000 },
  )
  const wheelAnchorBefore = await page.$eval('.image-viewer__stage', (element) => {
    const rect = element.getBoundingClientRect()
    const image = element.querySelector('img')
    const imageRect = image?.getBoundingClientRect()
    const clientX = rect.left + rect.width * 0.65
    const clientY = rect.top + rect.height * 0.55
    const imagePoint = imageRect
      ? {
          x: (clientX - imageRect.left) / imageRect.width,
          y: (clientY - imageRect.top) / imageRect.height,
        }
      : null
    element.dispatchEvent(
      new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: -100,
        clientX,
        clientY,
      }),
    )
    return { clientX, clientY, imagePoint, pageScrollY: window.scrollY }
  })
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() !== '100%',
    { timeout: 10_000 },
  )
  const wheelAnchorAfter = await page.$eval(
    '.image-viewer__stage',
    (element, before) => {
      const imageRect = element.querySelector('img')?.getBoundingClientRect()
      return {
        imagePoint: imageRect
          ? {
              x: (before.clientX - imageRect.left) / imageRect.width,
              y: (before.clientY - imageRect.top) / imageRect.height,
            }
          : null,
        pageScrollY: window.scrollY,
      }
    },
    wheelAnchorBefore,
  )
  await page.$eval('.image-viewer__stage', (element) => {
    const rect = element.getBoundingClientRect()
    element.dispatchEvent(
      new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      }),
    )
  })
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() === '100%',
    { timeout: 10_000 },
  )
  const anchorDrift =
    wheelAnchorBefore.imagePoint && wheelAnchorAfter.imagePoint
      ? Math.hypot(
          wheelAnchorBefore.imagePoint.x - wheelAnchorAfter.imagePoint.x,
          wheelAnchorBefore.imagePoint.y - wheelAnchorAfter.imagePoint.y,
        )
      : Number.POSITIVE_INFINITY
  if (
    anchorDrift > 0.03 ||
    wheelAnchorAfter.pageScrollY !== wheelAnchorBefore.pageScrollY
  ) {
    failures.push(
      `image viewer: plain wheel did not preserve the pointer anchor ${JSON.stringify({ anchorDrift, wheelAnchorBefore, wheelAnchorAfter })}`,
    )
  } else {
    imageViewerChecks.wheelAndDoubleClick += 1
  }

  await page.$eval('.image-viewer__stage', (element) => element.focus())
  await page.keyboard.press('+')
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() === '125%',
    { timeout: 10_000 },
  )
  await page.keyboard.press('-')
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() === '100%',
    { timeout: 10_000 },
  )
  await page.keyboard.press('+')
  await page.keyboard.press('f')
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() === '100%',
    { timeout: 10_000 },
  )
  await page.keyboard.press('+')
  await page.keyboard.press('0')
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() === '100%',
    { timeout: 10_000 },
  )
  imageViewerChecks.keyboardShortcuts += 1

  for (let index = 0; index < 5; index += 1) {
    await page.click('button[aria-label="放大图片"]')
  }
  await page.waitForFunction(
    () => {
      const stage = document.querySelector('.image-viewer__stage')
      return Boolean(stage && stage.scrollWidth > stage.clientWidth + 1)
    },
    { timeout: 10_000 },
  )
  const keyboardPanBefore = await page.$eval('.image-viewer__stage', (element) => {
    element.focus()
    element.scrollLeft = 0
    return {
      activeLabel: document.activeElement?.getAttribute('aria-label') ?? '',
      scrollLeft: element.scrollLeft,
    }
  })
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(
    () => (document.querySelector('.image-viewer__stage')?.scrollLeft ?? 0) > 0,
    { timeout: 10_000 },
  )
  const keyboardPanAfter = await page.$eval(
    '.image-viewer__stage',
    (element) => element.scrollLeft,
  )
  if (
    !keyboardPanBefore.activeLabel.includes('方向键') ||
    keyboardPanAfter <= keyboardPanBefore.scrollLeft
  ) {
    failures.push(
      `image viewer: keyboard pan failed ${JSON.stringify({ keyboardPanBefore, keyboardPanAfter })}`,
    )
  } else {
    imageViewerChecks.keyboardPan += 1
  }

  const stageHandle = await page.$('.image-viewer__stage')
  const stageBox = await stageHandle?.boundingBox()
  if (!stageBox) {
    failures.push('image viewer: scroll stage has no pointer target')
  } else {
    await page.$eval('.image-viewer__stage', (element) => {
      element.scrollLeft = Math.floor((element.scrollWidth - element.clientWidth) / 2)
    })
    const pointerPanBefore = await page.$eval(
      '.image-viewer__stage',
      (element) => element.scrollLeft,
    )
    const pointerX = stageBox.x + stageBox.width / 2
    const pointerY = stageBox.y + stageBox.height / 2
    await page.mouse.move(pointerX, pointerY)
    await page.mouse.down()
    await page.mouse.move(pointerX + 120, pointerY, { steps: 6 })
    await page.mouse.up()
    const pointerPanAfter = await page.$eval(
      '.image-viewer__stage',
      (element) => element.scrollLeft,
    )
    if (pointerPanAfter >= pointerPanBefore - 10) {
      failures.push(
        `image viewer: pointer drag did not pan ${pointerPanBefore}/${pointerPanAfter}`,
      )
    } else {
      imageViewerChecks.pointerPan += 1
    }
  }

  await page.$$eval('.image-viewer__toolbar button', (buttons) => {
    const actualSize = buttons.find((button) => button.textContent?.trim() === '100%')
    if (!(actualSize instanceof HTMLButtonElement)) throw new Error('100% control missing')
    actualSize.click()
  })
  await page.waitForFunction(
    () => document.querySelector('.image-viewer__zoom')?.textContent?.trim() === '100%',
    { timeout: 10_000 },
  )
  await capture(page, 'original-image-viewer-desktop-1440')
  await page.keyboard.press('Escape')
  await page.waitForFunction(
    () => !document.querySelector('.image-viewer__dialog'),
    { timeout: 10_000 },
  )
  const focusReturned = await page.evaluate(
    () => document.activeElement?.classList.contains('responsive-media__trigger') ?? false,
  )
  if (!focusReturned) {
    failures.push('image viewer: focus did not return to the triggering image')
  } else {
    imageViewerChecks.focusReturn += 1
  }

  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
  await page.$eval(intrinsicImageSelector, (image) => {
    const trigger = image.closest('.responsive-media__trigger')
    if (!(trigger instanceof HTMLButtonElement)) throw new Error('mobile viewer trigger missing')
    trigger.click()
  })
  await page.waitForSelector('.image-viewer__dialog', {
    visible: true,
    timeout: 10_000,
  })
  const mobileViewerMetrics = await page.$eval('.image-viewer__dialog', (element) => {
    const rect = element.getBoundingClientRect()
    const stage = element.querySelector('.image-viewer__stage')
    const buttons = [...element.querySelectorAll('button')].map((button) => {
      const buttonRect = button.getBoundingClientRect()
      return { width: buttonRect.width, height: buttonRect.height }
    })
    return {
      width: rect.width,
      height: rect.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      touchAction: stage ? getComputedStyle(stage).touchAction : '',
      buttons,
      hasHorizontalOverflow:
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }
  })
  if (
    mobileViewerMetrics.width > mobileViewerMetrics.viewportWidth + 1 ||
    mobileViewerMetrics.height > mobileViewerMetrics.viewportHeight + 1 ||
    mobileViewerMetrics.touchAction !== 'none' ||
    mobileViewerMetrics.hasHorizontalOverflow ||
    mobileViewerMetrics.buttons.some(
      (button) => button.width < 44 || button.height < 44,
    )
  ) {
    failures.push(`image viewer: mobile safe-area layout failed ${JSON.stringify(mobileViewerMetrics)}`)
  } else {
    imageViewerChecks.mobileSafeArea += 1
  }

  const mobileFitZoom = await page.$eval(
    '.image-viewer__zoom',
    (element) => Number.parseInt(element.textContent ?? '0', 10),
  )
  await page.$eval('.image-viewer__stage', (element) => {
    const rect = element.getBoundingClientRect()
    const y = rect.top + rect.height / 2
    const send = (type, pointerId, x, buttons) => {
      element.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId,
          pointerType: 'touch',
          isPrimary: pointerId === 11,
          clientX: x,
          clientY: y,
          button: type === 'pointerdown' ? 0 : -1,
          buttons,
        }),
      )
    }
    const center = rect.left + rect.width / 2
    send('pointerdown', 11, center - 30, 1)
    send('pointerdown', 12, center + 30, 1)
    send('pointermove', 11, center - 90, 1)
    send('pointermove', 12, center + 90, 1)
  })
  await page.waitForFunction(
    (fitZoom) =>
      Number.parseInt(
        document.querySelector('.image-viewer__zoom')?.textContent ?? '0',
        10,
      ) >= fitZoom * 2.5,
    { timeout: 10_000 },
    mobileFitZoom,
  )
  const pinchZoom = await page.$eval(
    '.image-viewer__zoom',
    (element) => Number.parseInt(element.textContent ?? '0', 10),
  )
  await page.$eval('.image-viewer__stage', (element) => {
    const rect = element.getBoundingClientRect()
    const y = rect.top + rect.height / 2
    const center = rect.left + rect.width / 2
    const send = (type, pointerId, x, buttons) => {
      element.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          pointerId,
          pointerType: 'touch',
          isPrimary: pointerId === 11,
          clientX: x,
          clientY: y,
          button: -1,
          buttons,
        }),
      )
    }
    send('pointerup', 11, center - 90, 0)
    send('pointerup', 12, center + 90, 0)
    element.scrollLeft = Math.floor((element.scrollWidth - element.clientWidth) / 2)
    const before = element.scrollLeft
    send('pointerdown', 13, rect.left + rect.width * 0.7, 1)
    send('pointermove', 13, rect.left + rect.width * 0.3, 1)
    send('pointerup', 13, rect.left + rect.width * 0.3, 0)
    element.dataset.touchPanBefore = String(before)
    element.dataset.touchPanAfter = String(element.scrollLeft)
  })
  const touchPan = await page.$eval('.image-viewer__stage', (element) => ({
    before: Number(element.dataset.touchPanBefore),
    after: Number(element.dataset.touchPanAfter),
  }))
  await page.$eval('.image-viewer__stage', (element) => {
    const rect = element.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const tap = (pointerId) => {
      element.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          pointerId,
          pointerType: 'touch',
          isPrimary: true,
          clientX: x,
          clientY: y,
          button: 0,
          buttons: 1,
        }),
      )
      element.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          pointerId,
          pointerType: 'touch',
          isPrimary: true,
          clientX: x,
          clientY: y,
          button: -1,
          buttons: 0,
        }),
      )
    }
    tap(14)
    tap(15)
  })
  await page.waitForFunction(
    (fitZoom) =>
      Number.parseInt(
        document.querySelector('.image-viewer__zoom')?.textContent ?? '0',
        10,
      ) === fitZoom,
    { timeout: 10_000 },
    mobileFitZoom,
  )
  if (pinchZoom < mobileFitZoom * 2.5 || touchPan.after <= touchPan.before + 10) {
    failures.push(
      `image viewer: touch gestures failed ${JSON.stringify({ pinchZoom, touchPan })}`,
    )
  } else {
    imageViewerChecks.touchGestures += 1
  }
  await capture(page, 'original-image-viewer-mobile-390')
  await page.keyboard.press('Escape')
  await page.waitForFunction(
    () => !document.querySelector('.image-viewer__dialog'),
    { timeout: 10_000 },
  )

  await page.goto(routeUrl('/'), {
    waitUntil: 'networkidle0',
    timeout: 45_000,
  })
  const searchButton = await page.$('button[aria-label="搜索文档"]')
  if (!searchButton) {
    failures.push('keyboard search: search button is missing')
  } else {
    await searchButton.focus()
    await page.keyboard.press('Enter')
    await page.waitForSelector('.VPLocalSearchBox input', {
      visible: true,
      timeout: 10_000,
    })
    const searchInput = await page.$('.VPLocalSearchBox input')
    await searchInput?.focus()
    await page.keyboard.type('伤害计算器')
    await page
      .waitForFunction(
        () => document.querySelectorAll('.VPLocalSearchBox a').length > 0,
        { timeout: 15_000 },
      )
      .catch(() => null)
    const searchState = await page.evaluate(() => ({
      value: document.querySelector('#localsearch-input')?.value ?? '',
      text: document
        .querySelector('.VPLocalSearchBox')
        ?.textContent?.trim()
        .replace(/\s+/g, ' ')
        .slice(0, 500),
      results: [...document.querySelectorAll('.VPLocalSearchBox a')].map(
        (link) => ({
          href: link.getAttribute('href'),
          text: link.textContent?.trim().replace(/\s+/g, ' ').slice(0, 160),
        }),
      ),
    }))
    const searchResults = searchState.results
    const damageResult = searchResults.find((result) =>
      result.href?.includes('/tools/dov-basic'),
    )
    if (!damageResult) {
      failures.push(
        `keyboard search: damage calculator not found; state=${JSON.stringify({ ...searchState, results: searchResults.slice(0, 8) })}`,
      )
      await page.keyboard.press('Escape')
      await page.goto(routeUrl('/tools/dov-basic'), {
        waitUntil: 'networkidle0',
        timeout: 45_000,
      })
    } else {
      await page.$eval(
        `.VPLocalSearchBox a[href="${damageResult.href}"]`,
        (element) => element.focus(),
      )
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        () => location.pathname.includes('/tools/dov-basic'),
        { timeout: 10_000 },
      )
    }
  }

  await page.waitForSelector('.damage-calculator', { timeout: 10_000 })
  const defaultDamage = await page.$eval(
    'output[aria-label="单次期望伤害"]',
    (element) => element.textContent?.trim(),
  )
  const changedNumberInput = await page.$(
    '.damage-calculator__group:nth-of-type(2) input[type="number"]',
  )
  if (!changedNumberInput) {
    failures.push('damage calculator: numeric input is missing')
  } else {
    const originalValue = Number(
      await changedNumberInput.evaluate((element) => element.value),
    )
    const changedValue = String(originalValue + 100)
    await changedNumberInput.focus()
    await page.keyboard.down('Control')
    await page.keyboard.press('A')
    await page.keyboard.up('Control')
    await page.keyboard.type(changedValue)
    await page.keyboard.press('Tab')
    await page.waitForFunction(
      (previous) =>
        document
          .querySelector('output[aria-label="单次期望伤害"]')
          ?.textContent?.trim() !== previous,
      { timeout: 10_000 },
      defaultDamage,
    )
    const changedDamage = await page.$eval(
      'output[aria-label="单次期望伤害"]',
      (element) => element.textContent?.trim(),
    )
    await page.reload({ waitUntil: 'networkidle0' })
    const restoredValue = await page.$eval(
      '.damage-calculator__group:nth-of-type(2) input[type="number"]',
      (element) => element.value,
    )
    const restoredDamage = await page.$eval(
      'output[aria-label="单次期望伤害"]',
      (element) => element.textContent?.trim(),
    )
    if (restoredValue !== changedValue || restoredDamage !== changedDamage) {
      failures.push('damage calculator: persisted value/result did not restore')
    }
  }

  await page.goto(routeUrl('/tools/equipment-lookup'), {
    waitUntil: 'networkidle0',
    timeout: 45_000,
  })
  const equipmentSearch = await page.$('.equipment-lookup input[type="search"]')
  if (!equipmentSearch) {
    failures.push('equipment lookup: search input is missing')
  } else {
    const initialEquipmentPage = await page.evaluate(() => ({
      cards: document.querySelectorAll('.equipment-card').length,
      pager: document
        .querySelector('.equipment-lookup__pager')
        ?.textContent?.trim()
        .replace(/\s+/g, ' '),
      firstItem: document
        .querySelector('.equipment-card strong')
        ?.textContent?.trim(),
    }))
    if (
      initialEquipmentPage.cards !== 12 ||
      !initialEquipmentPage.pager?.includes('第 1 / 8 页')
    ) {
      failures.push(
        `equipment lookup: unexpected initial pagination ${JSON.stringify(initialEquipmentPage)}`,
      )
    }
    const nextEquipmentPage = await page.$(
      '.equipment-lookup__pager button:last-of-type',
    )
    await nextEquipmentPage?.click()
    await page.waitForFunction(
      (previousItem) =>
        document
          .querySelector('.equipment-card strong')
          ?.textContent?.trim() !== previousItem &&
        document
          .querySelector('.equipment-lookup__pager')
          ?.textContent?.includes('第 2 / 8 页'),
      { timeout: 10_000 },
      initialEquipmentPage.firstItem,
    )
    await equipmentSearch.focus()
    await page.keyboard.type('305')
    await page.waitForFunction(
      () => {
        const value = Number(
          document.querySelector('output[aria-label="当前结果数量"]')
            ?.textContent,
        )
        return value > 0 && value < 93
      },
      { timeout: 10_000 },
    )
    const resetButton = await page.$('.equipment-lookup__toolbar button')
    await resetButton?.focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        document
          .querySelector('output[aria-label="当前结果数量"]')
          ?.textContent?.trim() === '93',
      { timeout: 10_000 },
    )
  }

  await page.goto(routeUrl('/tools/basic-attack-lookup'), {
    waitUntil: 'networkidle0',
    timeout: 45_000,
  })
  await page.waitForSelector('.tool-loading button', { timeout: 10_000 })
  await page.click('.tool-loading button')
  await page.waitForSelector('.basic-attack-explorer', { timeout: 10_000 })
  const basicAttackSearch = await page.$(
    '.basic-attack-explorer input[type="search"]',
  )
  const basicAttackWorksheet = await page.$(
    '.basic-attack-explorer select[aria-label="工作表筛选"]',
  )
  const basicAttackSort = await page.$(
    '.basic-attack-explorer select[aria-label="排序字段"]',
  )
  const basicAttackDirection = await page.$(
    '.basic-attack-explorer button[aria-label*="序"]',
  )
  const basicAttackReset = await page.$(
    '.basic-attack-explorer__reset',
  )
  const basicAttackCountSelector =
    '.basic-attack-explorer output[aria-label="当前普攻结果数量"]'
  const basicAttackDefaultCount = await page
    .$eval(basicAttackCountSelector, (element) => element.textContent?.trim())
    .catch(() => null)
  if (
    !basicAttackSearch ||
    !basicAttackWorksheet ||
    !basicAttackSort ||
    !basicAttackDirection ||
    !basicAttackReset ||
    basicAttackDefaultCount !== '225'
  ) {
    failures.push(
      `basic attack lookup: controls/count are incomplete (${basicAttackDefaultCount})`,
    )
  } else {
    await basicAttackSearch.focus()
    await page.keyboard.type('DD-724')
    await page.waitForFunction(
      (selector) => {
        const value = Number(document.querySelector(selector)?.textContent)
        return value > 0 && value < 225
      },
      { timeout: 10_000 },
      basicAttackCountSelector,
    )
    await basicAttackReset.focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      (selector) => document.querySelector(selector)?.textContent?.trim() === '225',
      { timeout: 10_000 },
      basicAttackCountSelector,
    )

    const worksheetOption = await basicAttackWorksheet.evaluate((element) =>
      [...element.options].find(
        (option) => option.value && option.value !== 'all',
      )?.value,
    )
    if (!worksheetOption) {
      failures.push('basic attack lookup: worksheet filter has no options')
    } else {
      await page.select(
        '.basic-attack-explorer select[aria-label="工作表筛选"]',
        worksheetOption,
      )
      await page.waitForFunction(
        (selector) => {
          const value = Number(document.querySelector(selector)?.textContent)
          return value > 0 && value < 225
        },
        { timeout: 10_000 },
        basicAttackCountSelector,
      )
    }

    const sortOption = await basicAttackSort.evaluate((element) =>
      [...element.options].find((option) => option.value)?.value,
    )
    if (!sortOption) {
      failures.push('basic attack lookup: sort control has no options')
    } else {
      await page.select(
        '.basic-attack-explorer select[aria-label="排序字段"]',
        sortOption,
      )
      const firstBefore = await page.$eval(
        '.basic-attack-explorer tbody tr',
        (element) => element.textContent?.trim(),
      )
      await basicAttackDirection.focus()
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        (previous) =>
          document
            .querySelector('.basic-attack-explorer tbody tr')
            ?.textContent?.trim() !== previous,
        { timeout: 10_000 },
        firstBefore,
      )
    }

    await basicAttackReset.focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      (selector) => document.querySelector(selector)?.textContent?.trim() === '225',
      { timeout: 10_000 },
      basicAttackCountSelector,
    )
  }

  const cdp = await page.createCDPSession()
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await page.goto(routeUrl('/tools/dov-basic'), {
    waitUntil: 'networkidle0',
    timeout: 45_000,
  })
  const zoomOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  )
  if (zoomOverflow) failures.push('200% zoom: damage calculator overflows page')
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })

  const notFoundResponse = await page.goto(routeUrl('/definitely-missing-page'), {
    waitUntil: 'networkidle0',
    timeout: 45_000,
  })
  const notFoundHeading = await page.$eval('h1', (element) =>
    element.textContent?.trim(),
  )
  if (notFoundResponse?.status() !== 404 || !notFoundHeading) {
    failures.push(
      `404 smoke: status=${notFoundResponse?.status()} heading=${notFoundHeading}`,
    )
  }

  const segmentMediaRequests = mediaRequests.filter(isSegmentMediaUrl)
  if (segmentMediaRequests.length) {
    failures.push(
      `media requests: segmented files loaded ${segmentMediaRequests.slice(0, 5).join(' | ')}`,
    )
  }
  if (!mediaRequests.some(isThumbnailMediaUrl)) {
    failures.push('media requests: no thumbnail.webp request was observed')
  }
  if (!mediaRequests.some(isOriginalMediaUrl)) {
    failures.push('media requests: no original PNG/JPG/JPEG request was observed')
  }
} catch (error) {
  failures.push(error instanceof Error ? error.stack ?? error.message : String(error))
} finally {
  await chromium?.close()
  preview.kill()
  if (browserProfile) {
    try {
      await rm(browserProfile, {
        recursive: true,
        force: true,
        maxRetries: 20,
        retryDelay: 250,
      })
    } catch (error) {
      failures.push(
        `browser profile cleanup failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    }
  }
}

const substantiveBrowserErrors = browserErrors.filter(
  (message) =>
    !message.includes('Failed to load resource: the server responded with a status of 404'),
)
if (substantiveBrowserErrors.length) {
  failures.push(
    `browser console/page errors: ${substantiveBrowserErrors.slice(0, 5).join(' | ')}`,
  )
}

const viewportChecks = Object.fromEntries(
  [...new Set(pageChecks.map((check) => check.viewport))]
    .sort()
    .map((viewport) => [
      viewport,
      pageChecks.filter((check) => check.viewport === viewport).length,
    ]),
)
for (const viewport of [
  'mobile-360',
  'mobile-390',
  'tablet-768',
  'desktop-1440',
]) {
  if (!viewportChecks[viewport]) {
    failures.push(`required viewport was not exercised: ${viewport}`)
  }
}

const reportPath = await writeReport('e2e-smoke', {
  schemaVersion: 1,
  check: 'desktop-mobile-e2e-smoke',
  generatedAt: new Date().toISOString(),
  browser: browserPath,
  base,
  summary: {
    pageChecks: pageChecks.length,
    desktopChecks: pageChecks.filter((check) =>
      check.viewport.startsWith('desktop-'),
    ).length,
    mobileChecks: pageChecks.filter(
      (check) =>
        check.viewport.startsWith('mobile-') ||
        check.viewport.startsWith('tablet-'),
    ).length,
    viewportChecks,
    screenshots: screenshots.length,
    mediaRequests: mediaRequests.length,
    mediaPolicyChecks,
    imageViewerChecks,
    sourceMediaProbeRoute,
    legacyRedirectChecks,
    tabletNavigationChecks,
    browserErrors: substantiveBrowserErrors.length,
    failures: failures.length,
  },
  pageChecks,
  screenshots,
  mediaRequests: [...new Set(mediaRequests)],
  browserErrors: substantiveBrowserErrors,
  failures,
  previewOutput: previewOutput.trim().split(/\r?\n/).slice(-10),
})

printResult('Desktop/mobile end-to-end smoke', failures, reportPath)

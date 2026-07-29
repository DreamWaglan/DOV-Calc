import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  access,
  mkdtemp,
  readFile,
  rm,
  stat,
} from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import {
  printResult,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

const previewPort = Number(process.env.DOCS_PREVIEW_PORT || 4173)
const base = normalizeBase(process.env.DOCS_BASE)
const previewOrigin = `http://127.0.0.1:${previewPort}`
const distRoot = path.join(root, 'docs', '.vitepress', 'dist')
const vitepressCli = path.join(
  root,
  'node_modules',
  'vitepress',
  'bin',
  'vitepress.js',
)
const lighthouseCli = path.join(
  root,
  'node_modules',
  'lighthouse',
  'cli',
  'index.js',
)
const representativePages = [
  { id: 'home', route: '/', kind: 'home', seoPolicy: 'indexable' },
  {
    id: 'long-guide',
    route: '/progression/leveling',
    kind: 'long-form-guide',
    seoPolicy: 'intentional-noindex',
  },
  {
    id: 'data-table',
    route: '/data/basic-attack-cd',
    kind: 'data-page',
    seoPolicy: 'intentional-noindex',
  },
  {
    id: 'long-image-text',
    route: '/topics/new-player-checklist',
    kind: 'long-image-text-equivalent',
    seoPolicy: 'intentional-noindex',
  },
  {
    id: 'damage-calculator',
    route: '/tools/dov-basic',
    kind: 'interactive-tool',
    seoPolicy: 'indexable',
  },
]
const thresholds = {
  performance: 0.85,
  accessibility: 0.9,
  seo: 0.9,
  largestContentfulPaintMs: 2500,
  cumulativeLayoutShift: 0.1,
  initialJavaScriptGzipBytes: 250 * 1024,
}
const releaseBlockingAccessibilityAudits = new Set([
  'aria-allowed-attr',
  'aria-command-name',
  'aria-hidden-body',
  'aria-hidden-focus',
  'aria-input-field-name',
  'aria-required-attr',
  'aria-required-children',
  'aria-required-parent',
  'aria-roles',
  'button-name',
  'color-contrast',
  'document-title',
  'duplicate-id-aria',
  'form-field-multiple-labels',
  'frame-title',
  'html-has-lang',
  'html-lang-valid',
  'image-alt',
  'input-button-name',
  'label',
  'link-name',
  'meta-viewport',
  'select-name',
])

function normalizeBase(value = '/DOV-Calc/') {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

function routeUrl(route) {
  const suffix = route === '/' ? '' : route.replace(/^\//, '')
  return new URL(suffix, `${previewOrigin}${base}`).toString()
}

function htmlPathForRoute(route) {
  if (route === '/') return path.join(distRoot, 'index.html')
  const normalized = route.replace(/^\/+|\/+$/g, '')
  if (route.endsWith('/')) return path.join(distRoot, normalized, 'index.html')
  return path.join(distRoot, `${normalized}.html`)
}

function resolveDistAsset(url) {
  const parsed = new URL(url, `${previewOrigin}${base}`)
  let pathname = decodeURIComponent(parsed.pathname)
  const prefix = base === '/' ? '' : base.slice(0, -1)
  if (prefix && pathname.startsWith(prefix)) pathname = pathname.slice(prefix.length)
  return path.join(distRoot, pathname.replace(/^\/+/, ''))
}

async function calculateInitialJavaScript(route) {
  const html = await readFile(htmlPathForRoute(route), 'utf8')
  const urls = new Set()
  for (const tag of html.match(/<(?:script|link)\b[^>]*>/gi) ?? []) {
    if (!/\.js(?:["'?#]|$)/i.test(tag)) continue
    const url =
      tag.match(/\bsrc=["']([^"']+\.js(?:[^"']*)?)["']/i)?.[1] ??
      tag.match(/\bhref=["']([^"']+\.js(?:[^"']*)?)["']/i)?.[1]
    if (url) urls.add(url)
  }

  const assets = []
  let gzipBytes = 0
  for (const url of [...urls].sort()) {
    const absolutePath = resolveDistAsset(url)
    const content = await readFile(absolutePath)
    const compressedBytes = gzipSync(content).byteLength
    gzipBytes += compressedBytes
    assets.push({
      url,
      bytes: content.byteLength,
      gzipBytes: compressedBytes,
      sha256: createHash('sha256').update(content).digest('hex'),
    })
  }
  return { gzipBytes, assets }
}

async function waitForPreview(url, timeoutMs = 30_000) {
  const startedAt = Date.now()
  let lastError = ''
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return
      lastError = `HTTP ${response.status}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`preview did not become ready: ${lastError}`)
}

async function findChromePath() {
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
      // Continue to the next known Chromium installation.
    }
  }
  return ''
}

function categoryScore(lhr, id) {
  return Number(lhr.categories?.[id]?.score ?? 0)
}

function auditNumericValue(lhr, id) {
  return Number(lhr.audits?.[id]?.numericValue ?? Number.POSITIVE_INFINITY)
}

function compactAudit(audit) {
  const items = (audit.details?.items ?? []).slice(0, 10).map((item) => {
    const node = item.node ?? item
    return {
      selector: node.selector ?? null,
      snippet: node.snippet ?? null,
      explanation:
        node.explanation ?? node.failureSummary ?? item.failureSummary ?? null,
    }
  })
  return {
    id: audit.id,
    title: audit.title,
    score: audit.score,
    scoreDisplayMode: audit.scoreDisplayMode,
    displayValue: audit.displayValue ?? null,
    items,
  }
}

await Promise.all([access(distRoot), access(vitepressCli), access(lighthouseCli)])

const temporaryRoot = await mkdtemp(
  path.join(os.tmpdir(), 'dov-wiki-lighthouse-'),
)
const chromePath = await findChromePath()
const preview = spawn(
  process.execPath,
  [vitepressCli, 'preview', 'docs', '--host', '127.0.0.1', '--port', String(previewPort)],
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

const failures = []
const results = []

try {
  await waitForPreview(routeUrl('/'))

  for (const page of representativePages) {
    const outputPath = path.join(temporaryRoot, `${page.id}.json`)
    const args = [
      lighthouseCli,
      routeUrl(page.route),
      '--quiet',
      '--output=json',
      `--output-path=${outputPath}`,
      '--only-categories=performance,accessibility,seo',
      '--form-factor=mobile',
      '--screenEmulation.mobile=true',
      '--screenEmulation.width=360',
      '--screenEmulation.height=640',
      '--screenEmulation.deviceScaleFactor=2',
      '--max-wait-for-load=45000',
      '--disable-full-page-screenshot',
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    ]
    const run = spawnSync(process.execPath, args, {
      cwd: root,
      env: {
        ...process.env,
        ...(chromePath ? { CHROME_PATH: chromePath } : {}),
      },
      encoding: 'utf8',
      timeout: 120_000,
      windowsHide: true,
    })

    const outputExists = await access(outputPath)
      .then(() => true)
      .catch(() => false)
    if (run.status !== 0 && !outputExists) {
      failures.push(
        `${page.id}: Lighthouse failed (${run.status ?? 'timeout'}): ${(run.stderr || run.stdout || '').trim().slice(-800)}`,
      )
      continue
    }

    const lhr = JSON.parse(await readFile(outputPath, 'utf8'))
    const runnerWarning =
      run.status === 0
        ? null
        : 'Lighthouse completed and wrote a valid report, but the Windows browser launcher could not remove its locked temporary profile.'
    const scores = {
      performance: categoryScore(lhr, 'performance'),
      accessibility: categoryScore(lhr, 'accessibility'),
      seo: categoryScore(lhr, 'seo'),
    }
    const metrics = {
      largestContentfulPaintMs: auditNumericValue(
        lhr,
        'largest-contentful-paint',
      ),
      cumulativeLayoutShift: auditNumericValue(
        lhr,
        'cumulative-layout-shift',
      ),
    }
    const initialJavaScript = await calculateInitialJavaScript(page.route)
    const failedAccessibilityAudits = (
      lhr.categories?.accessibility?.auditRefs ?? []
    )
      .map(({ id }) => lhr.audits?.[id])
      .filter((audit) => audit && audit.score !== null && audit.score < 1)
      .map(compactAudit)
    const failedSeoAudits = (lhr.categories?.seo?.auditRefs ?? [])
      .map(({ id }) => lhr.audits?.[id])
      .filter((audit) => audit && audit.score !== null && audit.score < 1)
      .map(compactAudit)
    const releaseBlockingAudits = failedAccessibilityAudits.filter((audit) =>
      releaseBlockingAccessibilityAudits.has(audit.id),
    )

    if (scores.performance < thresholds.performance) {
      failures.push(`${page.id}: Performance ${scores.performance} < 0.85`)
    }
    if (scores.accessibility < thresholds.accessibility) {
      failures.push(`${page.id}: Accessibility ${scores.accessibility} < 0.90`)
    }
    const unexpectedSeoAudits = failedSeoAudits.filter(
      (audit) =>
        page.seoPolicy !== 'intentional-noindex' ||
        audit.id !== 'is-crawlable',
    )
    if (page.seoPolicy === 'indexable' && scores.seo < thresholds.seo) {
      failures.push(`${page.id}: SEO ${scores.seo} < 0.90`)
    }
    if (
      page.seoPolicy === 'intentional-noindex' &&
      !failedSeoAudits.some((audit) => audit.id === 'is-crawlable')
    ) {
      failures.push(`${page.id}: draft page is unexpectedly crawlable`)
    }
    if (unexpectedSeoAudits.length) {
      failures.push(
        `${page.id}: unexpected SEO audits: ${unexpectedSeoAudits.map((audit) => audit.id).join(', ')}`,
      )
    }
    if (
      metrics.largestContentfulPaintMs >
      thresholds.largestContentfulPaintMs
    ) {
      failures.push(
        `${page.id}: LCP ${metrics.largestContentfulPaintMs} ms > 2500 ms`,
      )
    }
    if (metrics.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) {
      failures.push(
        `${page.id}: CLS ${metrics.cumulativeLayoutShift} > 0.1`,
      )
    }
    if (
      initialJavaScript.gzipBytes >
      thresholds.initialJavaScriptGzipBytes
    ) {
      failures.push(
        `${page.id}: initial JavaScript ${initialJavaScript.gzipBytes} B gzip > 256000 B`,
      )
    }
    if (releaseBlockingAudits.length) {
      failures.push(
        `${page.id}: release-blocking accessibility audits: ${releaseBlockingAudits.map((audit) => audit.id).join(', ')}`,
      )
    }

    results.push({
      id: page.id,
      kind: page.kind,
      route: page.route,
      seoPolicy: page.seoPolicy,
      finalUrl: lhr.finalDisplayedUrl ?? lhr.finalUrl,
      lighthouseVersion: lhr.lighthouseVersion,
      fetchTime: lhr.fetchTime,
      userAgent: lhr.userAgent,
      runnerWarning,
      scores,
      metrics,
      initialJavaScript,
      failedAccessibilityAudits,
      failedSeoAudits,
      releaseBlockingAudits,
    })
  }
} finally {
  preview.kill()
  await rm(temporaryRoot, { recursive: true, force: true })
}

if (results.length !== representativePages.length) {
  failures.push(
    `only ${results.length}/${representativePages.length} Lighthouse reports completed`,
  )
}

const reportPath = await writeReport('performance-accessibility', {
  schemaVersion: 1,
  check: 'lighthouse-mobile',
  generatedAt: new Date().toISOString(),
  auditProfile: {
    formFactor: 'mobile',
    viewport: '360x640@2',
    throttling: 'Lighthouse simulated mobile defaults',
    browser: chromePath || 'auto-detected by Lighthouse',
  },
  thresholds,
  summary: {
    representativePages: representativePages.length,
    completedPages: results.length,
    minimumPerformance:
      results.length > 0
        ? Math.min(...results.map((result) => result.scores.performance))
        : 0,
    minimumAccessibility:
      results.length > 0
        ? Math.min(...results.map((result) => result.scores.accessibility))
        : 0,
    minimumSeoForIndexablePages:
      results.some((result) => result.seoPolicy === 'indexable')
        ? Math.min(
            ...results
              .filter((result) => result.seoPolicy === 'indexable')
              .map((result) => result.scores.seo),
          )
        : 0,
    intentionalNoindexPages: results.filter(
      (result) => result.seoPolicy === 'intentional-noindex',
    ).length,
    maximumLcpMs:
      results.length > 0
        ? Math.max(
            ...results.map(
              (result) => result.metrics.largestContentfulPaintMs,
            ),
          )
        : null,
    maximumCls:
      results.length > 0
        ? Math.max(
            ...results.map(
              (result) => result.metrics.cumulativeLayoutShift,
            ),
          )
        : null,
    maximumInitialJavaScriptGzipBytes:
      results.length > 0
        ? Math.max(
            ...results.map(
              (result) => result.initialJavaScript.gzipBytes,
            ),
          )
        : null,
    failures: failures.length,
  },
  pages: results,
  failures,
  previewOutput: previewOutput.trim().split(/\r?\n/).slice(-10),
})

printResult('Lighthouse mobile audit', failures, reportPath)

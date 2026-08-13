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
import {
  effectivePerformanceThresholds,
  requiresPerformanceConfirmation,
  resolvePerformanceBudgetEnforcement,
  summarizePerformanceMeasurements,
} from './lighthouse-policy.mjs'

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
const originalLongImageContract = {
  exceptionId: 'authorized-original-media-transfer-bound',
  route: '/topics/visual-guides/src-ec1754535996',
  sourceAssetId: 'src-ec1754535996',
  manifestPath: 'content/migrations/media-assets/src-ec1754535996.json',
  originalPath:
    'docs/public/wiki-media/src-ec1754535996/original.png',
  publicPath: '/wiki-media/src-ec1754535996/original.png',
  bytes: 5_972_619,
  width: 1081,
  height: 12_800,
  format: 'png',
  sha256: 'f1bdd7e39067db6db0f510c5694a36d8896ab7cc2dc904be397bf9c9808b6993',
}
const representativePages = [
  { id: 'home', route: '/', kind: 'home', seoPolicy: 'indexable' },
  {
    id: 'long-guide',
    route: '/progression/leveling',
    kind: 'long-form-guide',
    seoPolicy: 'indexable',
  },
  {
    id: 'data-table',
    route: '/data/basic-attacks/destroyer',
    kind: 'static-data-table',
    seoPolicy: 'indexable',
  },
  {
    id: 'long-image-text',
    route: '/topics/new-player-checklist',
    kind: 'long-image-text-equivalent',
    seoPolicy: 'indexable',
  },
  {
    id: 'visual-media-index',
    route: '/topics/visual-guides/',
    kind: 'responsive-media-index',
    seoPolicy: 'indexable',
  },
  {
    id: 'original-long-image',
    route: originalLongImageContract.route,
    kind: 'original-long-image',
    seoPolicy: 'indexable',
    performanceBudgetException: {
      id: originalLongImageContract.exceptionId,
      sourceAssetId: originalLongImageContract.sourceAssetId,
      manifestPath: originalLongImageContract.manifestPath,
      exemptBudgets: ['performance', 'largestContentfulPaintMs'],
      rationale:
        'The accepted Wiki fidelity contract requires this 1081x12800 source image to remain one original PNG in article and detail views. Lighthouse simulated-mobile transfer time for the registered 5.97 MB original exceeds the global LCP budget by construction; accessibility, SEO, CLS, and initial-JavaScript budgets remain enforced.',
    },
  },
  {
    id: 'damage-calculator',
    route: '/tools/dov-basic',
    kind: 'interactive-tool',
    seoPolicy: 'indexable',
  },
  {
    id: 'equipment-lookup',
    route: '/tools/equipment-lookup',
    kind: 'interactive-data-tool',
    seoPolicy: 'indexable',
  },
  {
    id: 'basic-attack-lookup',
    route: '/tools/basic-attack-lookup',
    kind: 'interactive-data-tool',
    seoPolicy: 'indexable',
  },
]
const thresholds = {
  performance: 0.85,
  accessibility: 0.9,
  seo: 0.9,
  largestContentfulPaintMs: 2500,
  cumulativeLayoutShift: 0.1,
  initialJavaScriptGzipBytes: 250_000,
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

async function verifyPerformanceBudgetException(page) {
  const exception = page.performanceBudgetException
  if (!exception) return null

  const expectedBudgets = ['largestContentfulPaintMs', 'performance']
  const actualBudgets = [...new Set(exception.exemptBudgets)].sort()
  if (
    page.route !== originalLongImageContract.route ||
    exception.id !== originalLongImageContract.exceptionId ||
    exception.sourceAssetId !== originalLongImageContract.sourceAssetId ||
    exception.manifestPath !== originalLongImageContract.manifestPath ||
    JSON.stringify(actualBudgets) !== JSON.stringify(expectedBudgets)
  ) {
    throw new Error(
      `${exception.id} is not bound to the single registered original-media transfer constraint`,
    )
  }

  const manifest = JSON.parse(
    await readFile(path.join(root, exception.manifestPath), 'utf8'),
  )
  const original = manifest.originals?.[0]
  if (
    manifest.sourceId !== exception.sourceAssetId ||
    manifest.originalCopied !== true ||
    manifest.originals?.length !== 1 ||
    !original
  ) {
    throw new Error(`${exception.id} has invalid original-media evidence`)
  }

  const publicRoot = path.resolve(root, 'docs', 'public')
  const originalPath = path.resolve(root, original.path)
  if (
    originalPath !== publicRoot &&
    !originalPath.startsWith(`${publicRoot}${path.sep}`)
  ) {
    throw new Error(`${exception.id} original asset escapes docs/public`)
  }

  const [asset, assetStat] = await Promise.all([
    readFile(originalPath),
    stat(originalPath),
  ])
  const sha256 = createHash('sha256').update(asset).digest('hex')
  if (
    original.path !== originalLongImageContract.originalPath ||
    original.publicPath !== originalLongImageContract.publicPath ||
    original.bytes !== originalLongImageContract.bytes ||
    assetStat.size !== originalLongImageContract.bytes ||
    original.sha256 !== originalLongImageContract.sha256 ||
    sha256 !== originalLongImageContract.sha256 ||
    original.width !== originalLongImageContract.width ||
    original.height !== originalLongImageContract.height ||
    original.format !== originalLongImageContract.format
  ) {
    throw new Error(`${exception.id} original asset no longer matches its evidence`)
  }

  const builtHtml = await readFile(htmlPathForRoute(page.route), 'utf8')
  const originalImageElements = (builtHtml.match(/<img\b[^>]*>/gi) ?? []).filter(
    (tag) => {
      const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1]
      if (!src) return false
      const pathname = new URL(src, `${previewOrigin}${base}`).pathname
      const basePrefix = base === '/' ? '' : base.slice(0, -1)
      const publicPath =
        basePrefix && pathname.startsWith(`${basePrefix}/`)
          ? pathname.slice(basePrefix.length)
          : pathname
      return publicPath === originalLongImageContract.publicPath
    },
  )
  if (originalImageElements.length !== 1) {
    throw new Error(
      `${exception.id} requires exactly one built original-image element, got ${originalImageElements.length}`,
    )
  }

  return {
    ...exception,
    originalAsset: {
      publicPath: original.publicPath,
      bytes: original.bytes,
      width: original.width,
      height: original.height,
      format: original.format,
      sha256: original.sha256,
    },
  }
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

async function executeLighthouse(page, outputPath) {
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
  let run
  let outputExists = false
  let attempts = 0
  while (!outputExists && attempts < 2) {
    attempts += 1
    await rm(outputPath, { force: true }).catch(() => null)
    run = spawnSync(process.execPath, args, {
      cwd: root,
      env: {
        ...process.env,
        ...(chromePath ? { CHROME_PATH: chromePath } : {}),
      },
      encoding: 'utf8',
      timeout: 120_000,
      windowsHide: true,
    })
    outputExists = await access(outputPath)
      .then(() => true)
      .catch(() => false)
  }
  if (run.status !== 0 && !outputExists) {
    return {
      failure: `Lighthouse failed (${run.status ?? 'timeout'}): ${(run.stderr || run.stdout || '').trim().slice(-800)}`,
    }
  }

  const lhr = JSON.parse(await readFile(outputPath, 'utf8'))
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
  return {
    lhr,
    scores,
    metrics,
    attempts,
    runnerWarning:
      run.status === 0
        ? null
        : 'Lighthouse completed and wrote a valid report, but the Windows browser launcher could not remove its locked temporary profile.',
  }
}

try {
  await waitForPreview(routeUrl('/'))

  for (const page of representativePages) {
    const performanceBudgetEnforcement =
      resolvePerformanceBudgetEnforcement(page)
    let performanceBudgetException = null
    try {
      performanceBudgetException =
        await verifyPerformanceBudgetException(page)
    } catch (error) {
      failures.push(
        `${page.id}: invalid performance budget exception: ${error instanceof Error ? error.message : String(error)}`,
      )
      continue
    }

    const measurements = []
    const initialMeasurement = await executeLighthouse(
      page,
      path.join(temporaryRoot, `${page.id}.json`),
    )
    if (initialMeasurement.failure) {
      failures.push(`${page.id}: ${initialMeasurement.failure}`)
      continue
    }
    measurements.push(initialMeasurement)

    const pageThresholds = effectivePerformanceThresholds(page, thresholds)
    const requiresConfirmation = requiresPerformanceConfirmation(
      initialMeasurement,
      pageThresholds,
    )
    if (requiresConfirmation) {
      for (let index = 1; index <= 2; index += 1) {
        const confirmation = await executeLighthouse(
          page,
          path.join(temporaryRoot, `${page.id}-confirmation-${index}.json`),
        )
        if (confirmation.failure) {
          failures.push(
            `${page.id}: confirmation ${index} ${confirmation.failure}`,
          )
          break
        }
        measurements.push(confirmation)
      }
    }
    if (measurements.length !== (requiresConfirmation ? 3 : 1)) continue

    const selectedMeasurement = [...measurements].sort(
      (left, right) =>
        left.metrics.largestContentfulPaintMs -
        right.metrics.largestContentfulPaintMs,
    )[Math.floor(measurements.length / 2)]
    const { lhr } = selectedMeasurement
    const { scores, metrics } =
      summarizePerformanceMeasurements(measurements)
    const runnerWarning =
      measurements
        .map((measurement) => measurement.runnerWarning)
        .filter(Boolean)
        .join(' ') || null
    const attempts = measurements.reduce(
      (total, measurement) => total + measurement.attempts,
      0,
    )
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

    if (
      performanceBudgetEnforcement.performance &&
      scores.performance < thresholds.performance
    ) {
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
      failures.push(`${page.id}: noindex page is unexpectedly crawlable`)
    }
    if (unexpectedSeoAudits.length) {
      failures.push(
        `${page.id}: unexpected SEO audits: ${unexpectedSeoAudits.map((audit) => audit.id).join(', ')}`,
      )
    }
    if (
      performanceBudgetEnforcement.largestContentfulPaintMs &&
      metrics.largestContentfulPaintMs >
      thresholds.largestContentfulPaintMs
    ) {
      failures.push(
        `${page.id}: LCP ${metrics.largestContentfulPaintMs} ms > 2500 ms`,
      )
    }
    if (
      performanceBudgetEnforcement.cumulativeLayoutShift &&
      metrics.cumulativeLayoutShift > thresholds.cumulativeLayoutShift
    ) {
      failures.push(
        `${page.id}: CLS ${metrics.cumulativeLayoutShift} > 0.1`,
      )
    }
    if (
      performanceBudgetEnforcement.initialJavaScriptGzipBytes &&
      initialJavaScript.gzipBytes >
      thresholds.initialJavaScriptGzipBytes
    ) {
      failures.push(
        `${page.id}: initial JavaScript ${initialJavaScript.gzipBytes} B gzip > 250000 B`,
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
      attempts,
      performanceBudgetException,
      performanceBudgetEnforcement,
      measurementPolicy: requiresConfirmation
        ? 'median-lcp-of-three-after-initial-budget-failure'
        : 'single-run-within-budget',
      measurementSamples: measurements.map((measurement) => ({
        performance: measurement.scores.performance,
        largestContentfulPaintMs:
          measurement.metrics.largestContentfulPaintMs,
        cumulativeLayoutShift: measurement.metrics.cumulativeLayoutShift,
      })),
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

const performanceBudgetResults = results.filter(
  (result) => result.performanceBudgetEnforcement.performance,
)
const lcpBudgetResults = results.filter(
  (result) =>
    result.performanceBudgetEnforcement.largestContentfulPaintMs,
)

const reportPath = await writeReport('performance-accessibility', {
  schemaVersion: 2,
  check: 'lighthouse-mobile',
  generatedAt: new Date().toISOString(),
  auditProfile: {
    formFactor: 'mobile',
    viewport: '360x640@2',
    throttling: 'Lighthouse simulated mobile defaults',
    browser: chromePath || 'auto-detected by Lighthouse',
  },
  thresholds,
  performanceBudgetExceptions: results
    .filter((result) => result.performanceBudgetException)
    .map((result) => ({
      pageId: result.id,
      route: result.route,
      ...result.performanceBudgetException,
    })),
  summary: {
    representativePages: representativePages.length,
    completedPages: results.length,
    minimumPerformance:
      performanceBudgetResults.length > 0
        ? Math.min(
            ...performanceBudgetResults.map(
              (result) => result.scores.performance,
            ),
          )
        : 0,
    observedMinimumPerformance:
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
      lcpBudgetResults.length > 0
        ? Math.max(
            ...lcpBudgetResults.map(
              (result) => result.metrics.largestContentfulPaintMs,
            ),
          )
        : null,
    observedMaximumLcpMs:
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
    registeredBudgetExceptions: results.filter(
      (result) => result.performanceBudgetException,
    ).length,
    failures: failures.length,
  },
  pages: results,
  failures,
  previewOutput: previewOutput.trim().split(/\r?\n/).slice(-10),
})

printResult('Lighthouse mobile audit', failures, reportPath)

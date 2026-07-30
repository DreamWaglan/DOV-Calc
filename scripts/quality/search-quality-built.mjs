import { spawn } from 'node:child_process'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import puppeteer from 'puppeteer-core'
import {
  printResult,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

const fixturePath = path.join(
  root,
  'tests',
  'fixtures',
  'search-quality.zh-CN.json',
)
const docsRoot = path.join(root, 'docs')
const vitepressCli = path.join(
  root,
  'node_modules',
  'vitepress',
  'bin',
  'vitepress.js',
)
const port = Number(process.env.DOCS_SEARCH_PORT || 4175)
const base = normalizeBase(process.env.DOCS_BASE)
const origin = `http://127.0.0.1:${port}`
const failures = []

function normalizeBase(value = '/DOV-Calc/') {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

function routeUrl(route = '/') {
  const suffix = route === '/' ? '' : route.replace(/^\//, '')
  return new URL(suffix, `${origin}${base}`).toString()
}

function routeFromRelative(relativePath) {
  const normalized = relativePath.split(path.sep).join('/').replace(/\.md$/, '')
  if (normalized === 'index') return '/'
  if (normalized.endsWith('/index')) return `/${normalized.slice(0, -6)}/`
  return `/${normalized}`
}

function normalizeResultRoute(href) {
  const pathname = new URL(href, routeUrl('/')).pathname
  const basePrefix = base === '/' ? '' : base.slice(0, -1)
  const withoutBase =
    basePrefix && pathname.startsWith(basePrefix)
      ? pathname.slice(basePrefix.length) || '/'
      : pathname
  const normalized = withoutBase.replace(/\/+$/, '')
  return normalized || '/'
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(
    new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|(.+?))\\s*$`, 'm'),
  )
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? '').trim()
}

async function listMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'public') continue
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listMarkdown(absolutePath)))
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolutePath)
  }
  return files
}

async function buildRouteMap() {
  const entries = await Promise.all(
    (await listMarkdown(docsRoot)).map(async (absolutePath) => {
      const source = await readFile(absolutePath, 'utf8')
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      if (!match) return null
      const id = scalar(match[1], 'id')
      if (!id) return null
      return [
        id,
        routeFromRelative(path.relative(docsRoot, absolutePath)),
      ]
    }),
  )
  return new Map(entries.filter(Boolean))
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
  throw new Error('No Chromium browser was found for built-search tests.')
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

function percentage(numerator, denominator) {
  return denominator
    ? Number(((numerator / denominator) * 100).toFixed(2))
    : 0
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'))
const routeByPageId = await buildRouteMap()
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

let browser
const queryResults = []
const noResultChecks = []
try {
  await waitForPreview(routeUrl('/'))
  browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await page.goto(routeUrl('/'), {
    waitUntil: 'networkidle0',
    timeout: 45_000,
  })
  await page.click('button[aria-label="搜索文档"]')
  await page.waitForSelector('#localsearch-input', {
    visible: true,
    timeout: 10_000,
  })

  let searchIndexReady = false
  async function runQuery(query) {
    const input = await page.$('#localsearch-input')
    await input.focus()
    await page.keyboard.down('Control')
    await page.keyboard.press('A')
    await page.keyboard.up('Control')
    await page.keyboard.type(query)
    await page.waitForFunction(
      (expected) =>
        document.querySelector('#localsearch-input')?.value === expected,
      { timeout: 5_000 },
      query,
    )
    await new Promise((resolve) => setTimeout(resolve, 750))
    if (!searchIndexReady) {
      await page.waitForFunction(
        () => {
          const box = document.querySelector('.VPLocalSearchBox')
          return (
            Boolean(box?.querySelector('a[href]')) ||
            box?.textContent?.includes('没有找到相关结果')
          )
        },
        { timeout: 10_000 },
      )
      searchIndexReady = true
    }
    return page.evaluate(() => ({
      text:
        document.querySelector('.VPLocalSearchBox')?.textContent?.trim() ?? '',
      hrefs: [
        ...document.querySelectorAll('.VPLocalSearchBox a[href]'),
      ].map((link) => link.getAttribute('href')),
    }))
  }

  for (const sample of fixture.queries) {
    const state = await runQuery(sample.query)
    const resultRoutes = [
      ...new Set(
        state.hrefs
          .filter(Boolean)
          .map(normalizeResultRoute),
      ),
    ]
    const targetRoutes = sample.targetPageIds
      .map((id) => routeByPageId.get(id))
      .filter(Boolean)
      .map(normalizeResultRoute)
    const targetRanks = targetRoutes
      .map((route) => resultRoutes.indexOf(route) + 1)
      .filter((rank) => rank > 0)
    const bestTargetRank = targetRanks.length ? Math.min(...targetRanks) : null
    const topFivePassed = bestTargetRank !== null && bestTargetRank <= 5
    const topOnePassed = !sample.mustBeTop1 || bestTargetRank === 1
    if (!topOnePassed) {
      failures.push(
        `${sample.id}: exact query target ranked ${bestTargetRank ?? 'not found'}`,
      )
    }
    queryResults.push({
      id: sample.id,
      query: sample.query,
      targetPageIds: sample.targetPageIds,
      targetRoutes,
      mustBeTop1: Boolean(sample.mustBeTop1),
      bestTargetRank,
      topFivePassed,
      topOnePassed,
      topFiveRoutes: resultRoutes.slice(0, 5),
    })
  }

  for (const sample of fixture.noResultQueries) {
    const state = await runQuery(sample.query)
    const resultRoutes = [
      ...new Set(
        state.hrefs
          .filter(Boolean)
          .map(normalizeResultRoute),
      ),
    ]
    const hasChapterSuggestions = [
      '新手路线',
      '战斗攻略',
      '数据目录',
    ].every((term) => state.text.includes(term))
    const passed = resultRoutes.length === 0 && hasChapterSuggestions
    if (!passed) {
      failures.push(
        `${sample.id}: expected no direct result plus chapter suggestions`,
      )
    }
    noResultChecks.push({
      id: sample.id,
      query: sample.query,
      directResultCount: resultRoutes.length,
      hasChapterSuggestions,
      passed,
    })
  }
} catch (error) {
  failures.push(error instanceof Error ? error.stack ?? error.message : String(error))
} finally {
  await browser?.close()
  preview.kill()
}

const topFivePassCount = queryResults.filter((item) => item.topFivePassed).length
const topOneCandidates = queryResults.filter((item) => item.mustBeTop1)
const topOnePassCount = topOneCandidates.filter((item) => item.topOnePassed).length
const topFiveRatePercent = percentage(topFivePassCount, queryResults.length)
const exactTopOneRatePercent = percentage(
  topOnePassCount,
  topOneCandidates.length,
)

if (topFiveRatePercent < fixture.thresholds.topFiveRatePercent) {
  failures.push(
    `built index Top 5 ${topFiveRatePercent}% is below ${fixture.thresholds.topFiveRatePercent}%`,
  )
}
if (exactTopOneRatePercent < fixture.thresholds.exactTopOneRatePercent) {
  failures.push(
    `built index exact Top 1 ${exactTopOneRatePercent}% is below ${fixture.thresholds.exactTopOneRatePercent}%`,
  )
}

const reportPath = await writeReport('search-quality-built', {
  schemaVersion: 1,
  check: 'vitepress-built-search-black-box',
  generatedAt: new Date().toISOString(),
  fixture: {
    path: 'tests/fixtures/search-quality.zh-CN.json',
    fixtureVersion: fixture.fixtureVersion,
    queryCount: fixture.queries.length,
    noResultQueryCount: fixture.noResultQueries.length,
  },
  browser: browserPath,
  base,
  thresholds: fixture.thresholds,
  metrics: {
    topFivePassCount,
    topFiveRatePercent,
    exactTopOneCandidateCount: topOneCandidates.length,
    exactTopOnePassCount: topOnePassCount,
    exactTopOneRatePercent,
    noResultSuggestionPassCount: noResultChecks.filter((item) => item.passed)
      .length,
  },
  queryResults,
  noResultChecks,
  failures,
  passed: failures.length === 0,
  previewOutput: previewOutput.trim().split(/\r?\n/).slice(-10),
})

printResult('VitePress built-search black-box quality', failures, reportPath)

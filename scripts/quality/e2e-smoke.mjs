import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import puppeteer from 'puppeteer-core'
import {
  printResult,
  relative,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

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

function normalizeBase(value = '/DOV-Calc/') {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

function routeUrl(route) {
  const suffix = route === '/' ? '' : route.replace(/^\//, '')
  return new URL(suffix, `${previewOrigin}${base}`).toString()
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
        '.damage-calculator button, .damage-calculator input, .damage-calculator select, .equipment-lookup button, .equipment-lookup input, .equipment-lookup select',
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
  if (options.requireMetadata) {
    if (!metrics.statusVisible) failures.push(`${viewport}:${route}: status missing`)
    if (!metrics.sourcesVisible) failures.push(`${viewport}:${route}: sources missing`)
    if (!metrics.relatedVisible) failures.push(`${viewport}:${route}: related pages missing`)
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
try {
  await waitForPreview(routeUrl('/'))
  chromium = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  })
  const page = await chromium.newPage()
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })

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
  ]) {
    await inspectLayout(page, route, 'desktop', {
      requireMetadata: route !== '/',
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
  ]) {
    await inspectLayout(page, route, 'mobile-360', {
      requireMetadata: route !== '/',
    })
    if (route === '/') await capture(page, 'home-mobile-360')
    if (route === '/tools/dov-basic') {
      await capture(page, 'damage-calculator-mobile-360')
    }
    if (route === '/tools/equipment-lookup') {
      await capture(page, 'equipment-lookup-mobile-360')
    }
  }

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
    await new Promise((resolve) => setTimeout(resolve, 750))
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
} catch (error) {
  failures.push(error instanceof Error ? error.stack ?? error.message : String(error))
} finally {
  await chromium?.close()
  preview.kill()
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

const reportPath = await writeReport('e2e-smoke', {
  schemaVersion: 1,
  check: 'desktop-mobile-e2e-smoke',
  generatedAt: new Date().toISOString(),
  browser: browserPath,
  base,
  summary: {
    pageChecks: pageChecks.length,
    desktopChecks: pageChecks.filter((check) => check.viewport === 'desktop')
      .length,
    mobileChecks: pageChecks.filter(
      (check) => check.viewport === 'mobile-360',
    ).length,
    screenshots: screenshots.length,
    browserErrors: substantiveBrowserErrors.length,
    failures: failures.length,
  },
  pageChecks,
  screenshots,
  browserErrors: substantiveBrowserErrors,
  failures,
  previewOutput: previewOutput.trim().split(/\r?\n/).slice(-10),
})

printResult('Desktop/mobile end-to-end smoke', failures, reportPath)

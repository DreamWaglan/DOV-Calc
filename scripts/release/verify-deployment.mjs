import { createHash } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import puppeteer from 'puppeteer-core'
import { writeFileWithRetry as writeFile } from '../lib/file-utils.mjs'
import {
  loadJson,
  relativeFrom,
  resolveFrom,
  sha256File,
} from './release-utils.mjs'
import { parseDeploymentArguments } from './deployment-arguments.mjs'

const rootDir = process.cwd()

function normalizeSiteUrl(value) {
  const url = new URL(value)
  url.hash = ''
  url.search = ''
  if (!url.pathname.endsWith('/')) url.pathname += '/'
  return url
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function artifactUrl(siteUrl, filePath) {
  return new URL(filePath.replace(/^\/+/, ''), siteUrl)
}

async function fetchBytes(url, failures, label) {
  let response

  try {
    response = await fetch(url, {
      headers: { 'user-agent': 'DOV-Calc-release-verifier/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(45_000),
    })
  } catch (error) {
    failures.push(`${label} 请求失败：${error.message}`)
    return null
  }

  if (!response.ok) {
    failures.push(`${label} 返回 HTTP ${response.status}：${url}`)
    return null
  }

  return Buffer.from(await response.arrayBuffer())
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

  throw new Error('未找到可用于线上交互验证的 Chromium 浏览器')
}

async function verifyBrowserInteractions(siteUrl, failures) {
  const browserPath = await findBrowserPath()
  const profileRoot = path.join(rootDir, '.omx', 'browser-profiles')
  await mkdir(profileRoot, { recursive: true })
  const profile = await mkdtemp(path.join(profileRoot, 'deployment-'))
  let browser
  const browserErrors = []
  const checks = {
    homeNavigation: false,
    search: false,
    deepPage: false,
    damageCalculator: false,
    equipmentLookup: false,
    basicAttackLookup: false,
    notFoundPage: false,
  }

  try {
    browser = await puppeteer.launch({
      executablePath: browserPath,
      headless: true,
      userDataDir: profile,
      args: ['--no-sandbox', '--disable-gpu'],
    })
    const page = await browser.newPage()
    page.on('pageerror', (error) => browserErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text())
    })

    const homeResponse = await page.goto(siteUrl.toString(), {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    })
    checks.homeNavigation =
      homeResponse?.ok() === true &&
      Boolean(await page.$('.VPNav')) &&
      Boolean(await page.$('button[aria-label="搜索文档"]'))

    const searchButton = await page.$('button[aria-label="搜索文档"]')
    await searchButton?.click()
    await page.waitForSelector('#localsearch-input', {
      visible: true,
      timeout: 15_000,
    })
    await page.type('#localsearch-input', '伤害计算器')
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll('.VPLocalSearchBox a')].some((link) =>
          link.getAttribute('href')?.includes('/tools/dov-basic'),
        ),
      { timeout: 20_000 },
    )
    checks.search = true

    const deepUrl = new URL('combat/pvp-fundamentals', siteUrl)
    const deepResponse = await page.goto(deepUrl.toString(), {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    })
    checks.deepPage =
      deepResponse?.ok() === true &&
      (await page.title()).includes('争锋竞技')

    await page.goto(new URL('tools/dov-basic', siteUrl).toString(), {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    })
    await page.waitForSelector('.damage-calculator', { timeout: 15_000 })
    const initialDamage = await page.$eval(
      'output[aria-label="单次期望伤害"]',
      (element) => element.textContent?.trim(),
    )
    const damageInput = await page.$(
      '.damage-calculator__group:nth-of-type(2) input[type="number"]',
    )
    if (damageInput) {
      await damageInput.click({ clickCount: 3 })
      await damageInput.type('999')
      await damageInput.press('Tab')
      await page.waitForFunction(
        (previous) =>
          document
            .querySelector('output[aria-label="单次期望伤害"]')
            ?.textContent?.trim() !== previous,
        { timeout: 10_000 },
        initialDamage,
      )
      checks.damageCalculator = true
    }

    await page.goto(new URL('tools/equipment-lookup', siteUrl).toString(), {
      waitUntil: 'networkidle0',
      timeout: 60_000,
    })
    const equipmentSearch = await page.$(
      '.equipment-lookup input[type="search"]',
    )
    if (equipmentSearch) {
      await equipmentSearch.type('305')
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
      checks.equipmentLookup = true
    }

    await page.goto(
      new URL('tools/basic-attack-lookup', siteUrl).toString(),
      {
        waitUntil: 'networkidle0',
        timeout: 60_000,
      },
    )
    const basicAttackSearch = await page.$(
      '.basic-attack-explorer input[type="search"]',
    )
    if (basicAttackSearch) {
      const initialCount = Number(
        await page.$eval(
          '.basic-attack-explorer output[aria-label="当前普攻结果数量"]',
          (element) => element.textContent?.trim(),
        ),
      )
      await basicAttackSearch.type('100')
      await page.waitForFunction(
        (previous) => {
          const current = Number(
            document.querySelector(
              '.basic-attack-explorer output[aria-label="当前普攻结果数量"]',
            )?.textContent,
          )
          return current > 0 && current < previous
        },
        { timeout: 10_000 },
        initialCount,
      )
      checks.basicAttackLookup = true
    }

    page.removeAllListeners('pageerror')
    page.removeAllListeners('console')
    const missingResponse = await page.goto(
      new URL('__release-verification-missing__', siteUrl).toString(),
      {
        waitUntil: 'networkidle0',
        timeout: 60_000,
      },
    )
    checks.notFoundPage =
      [200, 404].includes(missingResponse?.status()) &&
      Boolean(await page.$('a[href$="/DOV-Calc/"], a[href="/DOV-Calc/"]'))
  } finally {
    await browser?.close()
    await rm(profile, { recursive: true, force: true })
  }

  for (const [name, passed] of Object.entries(checks)) {
    if (!passed) failures.push(`线上浏览器交互未通过：${name}`)
  }
  if (browserErrors.length > 0) {
    failures.push(
      `线上浏览器出现 ${browserErrors.length} 个错误：${browserErrors
        .slice(0, 5)
        .join(' | ')}`,
    )
  }

  return { browserPath, checks, browserErrors }
}

async function main() {
  const options = parseDeploymentArguments(process.argv.slice(2))
  const manifestPath = resolveFrom(rootDir, options.manifest)
  const reportPath = resolveFrom(rootDir, options.report)
  const manifest = await loadJson(manifestPath)
  const siteUrl = normalizeSiteUrl(options.url)
  const failures = []

  if (manifest.release?.state !== 'tagged') {
    failures.push('线上验证要求 release.state 为 tagged')
  }
  if (
    !manifest.repository?.tag?.present ||
    !manifest.repository?.tag?.matchesHead
  ) {
    failures.push('线上验证要求候选标签存在并指向清单 HEAD')
  }
  if (!options.deployedCommit) {
    failures.push('必须通过 --deployed-commit 提供工作流部署提交')
  } else if (options.deployedCommit !== manifest.repository?.head) {
    failures.push(
      `部署提交与清单 HEAD 不一致：${options.deployedCommit} != ${manifest.repository?.head}`,
    )
  }
  if (!options.workflowRunId || !options.workflowUrl) {
    failures.push('必须记录 GitHub Actions workflow run ID 与 URL')
  }
  if (siteUrl.pathname !== manifest.release?.siteBase) {
    failures.push(
      `线上 URL 基路径与清单不一致：${siteUrl.pathname} != ${manifest.release?.siteBase}`,
    )
  }

  const criticalFiles = (manifest.artifact?.files ?? []).filter((file) =>
    /\.(?:html|css|js|xml|svg|json)$/i.test(file.path),
  )
  const remoteFiles = []

  for (const file of criticalFiles) {
    const url = artifactUrl(siteUrl, file.path)
    const bytes = await fetchBytes(url, failures, `关键产物 ${file.path}`)
    if (!bytes) continue
    const actualHash = sha256(bytes)
    const passed = bytes.length === file.bytes && actualHash === file.sha256
    if (!passed) {
      failures.push(
        `线上产物与发布清单不一致：${file.path}（bytes ${bytes.length}/${file.bytes}, sha256 ${actualHash}/${file.sha256}）`,
      )
    }
    remoteFiles.push({
      path: file.path,
      url: url.toString(),
      bytes: bytes.length,
      sha256: actualHash,
      passed,
    })
  }

  const homeFile = criticalFiles.find((file) => file.path === 'index.html')
  const home = remoteFiles.find((file) => file.path === 'index.html')
  if (!homeFile || !home?.passed) {
    failures.push('线上首页未与发布清单一致')
  }

  const sitemapBytes = await fetchBytes(
    new URL('sitemap.xml', siteUrl),
    failures,
    'sitemap.xml',
  )
  const sitemap = sitemapBytes?.toString('utf8') ?? ''
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  )
  const forbiddenSitemapEntries = sitemapUrls.filter((url) =>
    /(?:\/draft\/|\/quarantine\/|content\/imports|content\/governance)/i.test(
      url,
    ),
  )
  if (sitemapUrls.length !== 97) {
    failures.push(`线上 sitemap 应包含 97 个公开路由，实际 ${sitemapUrls.length}`)
  }
  if (forbiddenSitemapEntries.length > 0) {
    failures.push(
      `线上 sitemap 出现隔离或草稿路径：${forbiddenSitemapEntries.join(', ')}`,
    )
  }

  const htmlFiles = remoteFiles.filter((file) => file.path.endsWith('.html'))
  const canonicalFailures = []
  for (const file of htmlFiles) {
    const localHtml = await readFile(
      path.join(resolveFrom(rootDir, manifest.artifact.root), file.path),
      'utf8',
    )
    const canonical = localHtml.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    )?.[1]
    if (canonical && !canonical.startsWith(siteUrl.origin + siteUrl.pathname)) {
      canonicalFailures.push(`${file.path}: ${canonical}`)
    }
  }
  if (canonicalFailures.length > 0) {
    failures.push(
      `canonical 未使用生产域名与基路径：${canonicalFailures
        .slice(0, 10)
        .join(', ')}`,
    )
  }

  let browserVerification = {
    browserPath: null,
    checks: {},
    browserErrors: [],
  }
  try {
    browserVerification = await verifyBrowserInteractions(siteUrl, failures)
  } catch (error) {
    failures.push(`线上浏览器验证失败：${error.message}`)
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    status: failures.length === 0 ? 'verified' : 'failed',
    deployment: {
      target: manifest.release?.deploymentTarget,
      url: siteUrl.toString(),
      commit: options.deployedCommit,
      tag: manifest.release?.candidateTag,
      workflowRunId: options.workflowRunId,
      workflowUrl: options.workflowUrl,
    },
    releaseManifest: relativeFrom(rootDir, manifestPath),
    artifact: {
      aggregateSha256: manifest.artifact?.aggregateSha256,
      criticalFilesExpected: criticalFiles.length,
      criticalFilesVerified: remoteFiles.filter((file) => file.passed).length,
      htmlFilesVerified: htmlFiles.filter((file) => file.passed).length,
      remoteFiles,
    },
    sitemap: {
      publicRoutes: sitemapUrls.length,
      forbiddenEntries: forbiddenSitemapEntries,
    },
    canonical: {
      checkedHtmlFiles: htmlFiles.length,
      failures: canonicalFailures,
    },
    browser: browserVerification,
    failures,
  }

  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  if (failures.length === 0) {
    manifest.release.deploymentState = 'verified'
    manifest.deploymentEvidence = {
      path: relativeFrom(rootDir, reportPath),
      sha256: await sha256File(reportPath),
      status: report.status,
      url: siteUrl.toString(),
      deployedCommit: options.deployedCommit,
      workflowRunId: options.workflowRunId,
      workflowUrl: options.workflowUrl,
      verifiedAt: report.generatedAt,
    }
    manifest.notes =
      '源码、构建产物、不可变标签与 GitHub Pages 线上关键产物及交互均已验证。'
    await writeFile(
      manifestPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8',
    )
  }

  console.log(
    JSON.stringify(
      {
        report: relativeFrom(rootDir, reportPath),
        status: report.status,
        deploymentState: manifest.release?.deploymentState,
        criticalFilesExpected: criticalFiles.length,
        criticalFilesVerified: report.artifact.criticalFilesVerified,
        htmlFilesVerified: report.artifact.htmlFilesVerified,
        sitemapRoutes: sitemapUrls.length,
        browserChecks: browserVerification.checks,
        failures,
      },
      null,
      2,
    ),
  )

  if (failures.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(`[deployment-verification] ${error.message}`)
  process.exitCode = 1
})

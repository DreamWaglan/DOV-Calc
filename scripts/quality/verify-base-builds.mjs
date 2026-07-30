import { spawn } from 'node:child_process'
import {
  access,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
} from 'node:fs/promises'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import puppeteer from 'puppeteer-core'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

const vitepressCli = path.join(
  root,
  'node_modules',
  'vitepress',
  'bin',
  'vitepress.js',
)
const failures = []
const builds = []
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'dov-wiki-base-builds-'))
const pages = await loadPages()
const redirectLedger = await readJson('content/governance/redirects.json')
const siteOrigin = (process.env.DOCS_ORIGIN || 'https://dreamwaglan.github.io')
  .trim()
  .replace(/\/+$/g, '')

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath)))
    if (entry.isFile()) files.push(entryPath)
  }
  return files
}

function runBuild(base, outDir) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [vitepressCli, 'build', 'docs', '--outDir', outDir],
      {
        cwd: root,
        env: {
          ...process.env,
          DOCS_BASE: base,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      },
    )
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      output += chunk.toString()
    })
    child.on('close', (status) => resolve({ status, output }))
  })
}

function routeHtmlPath(outDir, route) {
  if (route === '/') return path.join(outDir, 'index.html')
  const normalized = route.replace(/^\/+|\/+$/g, '')
  if (route.endsWith('/')) {
    return path.join(outDir, normalized, 'index.html')
  }
  return path.join(outDir, `${normalized}.html`)
}

function routeUrl(origin, base, route) {
  const suffix = route === '/' ? '' : route.replace(/^\//, '')
  return new URL(suffix, `${origin}${base}`).toString()
}

function expectedCanonical(base, route) {
  return routeUrl(siteOrigin, base, route)
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase()
  return (
    {
      '.avif': 'image/avif',
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.woff2': 'font/woff2',
    }[extension] || 'application/octet-stream'
  )
}

async function existingFile(candidates, outDir) {
  const rootPrefix = `${path.resolve(outDir)}${path.sep}`
  for (const candidate of candidates) {
    const resolved = path.resolve(candidate)
    if (!resolved.startsWith(rootPrefix)) continue
    try {
      if ((await stat(resolved)).isFile()) return resolved
    } catch {
      // Try the next clean-URL candidate.
    }
  }
  return ''
}

async function startStaticServer(outDir, base) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url || '/', 'http://127.0.0.1').pathname,
      )
      if (base !== '/' && !pathname.startsWith(base)) {
        response.writeHead(404)
        response.end()
        return
      }
      const localPath =
        base === '/'
          ? pathname.replace(/^\/+/, '')
          : pathname.slice(base.length)
      const candidates = localPath
        ? path.extname(localPath)
          ? [path.join(outDir, localPath)]
          : [
              path.join(outDir, `${localPath}.html`),
              path.join(outDir, localPath, 'index.html'),
            ]
        : [path.join(outDir, 'index.html')]
      const filePath = await existingFile(candidates, outDir)
      if (!filePath) {
        response.writeHead(404)
        response.end(await readFile(path.join(outDir, '404.html')))
        return
      }
      response.writeHead(200, { 'content-type': contentType(filePath) })
      response.end(await readFile(filePath))
    } catch (error) {
      response.writeHead(500)
      response.end(error instanceof Error ? error.message : String(error))
    }
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  }
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
  return ''
}

function htmlUrls(html) {
  const urls = []
  for (const tag of html.match(/<(?:a|img|link|script|source)\b[^>]*>/gi) ?? []) {
    for (const attribute of ['href', 'src']) {
      const value = tag.match(
        new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'i'),
      )?.[1]
      if (value) urls.push(value)
    }
    const srcset = tag.match(/\bsrcset=["']([^"']+)["']/i)?.[1]
    if (srcset) {
      urls.push(
        ...srcset
          .split(',')
          .map((candidate) => candidate.trim().split(/\s+/, 1)[0])
          .filter(Boolean),
      )
    }
  }
  return urls
}

function localAssetPath(url, base, outDir) {
  if (
    !url ||
    /^(?:[a-z]+:|#|\/\/)/i.test(url) ||
    !/\.(?:avif|css|gif|jpe?g|js|json|png|svg|webp|woff2?)(?:[?#]|$)/i.test(
      url,
    )
  ) {
    return ''
  }
  const pathname = decodeURIComponent(url.split(/[?#]/, 1)[0])
  if (!pathname.startsWith('/')) return path.join(outDir, pathname)
  if (base !== '/' && !pathname.startsWith(base)) return null
  const relativePath =
    base === '/'
      ? pathname.replace(/^\/+/, '')
      : pathname.slice(base.length)
  return path.join(outDir, relativePath)
}

let chromium
let browserPath = ''
try {
  browserPath = await findBrowserPath()
  if (!browserPath) {
    failures.push('dual-base browser checks: no Chromium browser was found')
  } else {
    chromium = await puppeteer.launch({
      executablePath: browserPath,
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    })
  }

  for (const buildCase of [
    { name: 'root', base: '/' },
    { name: 'github-project', base: '/DOV-Calc/' },
  ]) {
    const outDir = path.join(tempRoot, buildCase.name)
    const result = await runBuild(buildCase.base, outDir)
    if (result.status !== 0) {
      failures.push(
        `${buildCase.name}: VitePress exited with ${result.status ?? 'unknown'}`,
      )
      builds.push({
        ...buildCase,
        status: result.status,
        passed: false,
        output: result.output.trim().split(/\r?\n/).slice(-20),
      })
      continue
    }

    const files = await listFiles(outDir)
    const relativeFiles = files.map((file) =>
      path.relative(outDir, file).split(path.sep).join('/'),
    )
    const requiredFiles = [
      'index.html',
      'start/game-introduction.html',
      'tools/dov-basic.html',
      'tools/equipment-lookup.html',
      'sitemap.xml',
    ]
    const missingFiles = requiredFiles.filter(
      (file) => !relativeFiles.includes(file),
    )
    const indexHtml = await readFile(path.join(outDir, 'index.html'), 'utf8')
    const expectedAssetPrefix =
      buildCase.base === '/' ? '/assets/' : '/DOV-Calc/assets/'
    const assetPrefixPresent = indexHtml.includes(expectedAssetPrefix)
    const unexpectedProjectPrefix =
      buildCase.base === '/' && indexHtml.includes('/DOV-Calc/assets/')

    if (missingFiles.length) {
      failures.push(
        `${buildCase.name}: missing ${missingFiles.join(', ')}`,
      )
    }
    if (!assetPrefixPresent) {
      failures.push(
        `${buildCase.name}: home page does not use ${expectedAssetPrefix}`,
      )
    }
    if (unexpectedProjectPrefix) {
      failures.push(`${buildCase.name}: root build leaked project base`)
    }

    const missingPageFiles = []
    const canonicalFailures = []
    const brokenAssetReferences = []
    let baseLeakCount = 0
    for (const page of pages) {
      const htmlPath = routeHtmlPath(outDir, page.route)
      let html
      try {
        html = await readFile(htmlPath, 'utf8')
      } catch {
        missingPageFiles.push(
          path.relative(outDir, htmlPath).split(path.sep).join('/'),
        )
        continue
      }
      const canonical = expectedCanonical(buildCase.base, page.route)
      if (
        !html.includes(`rel="canonical" href="${canonical}"`) &&
        !html.includes(`href="${canonical}" rel="canonical"`)
      ) {
        canonicalFailures.push(`${page.route} -> ${canonical}`)
      }
      for (const url of htmlUrls(html)) {
        if (
          buildCase.base === '/' &&
          /^\/DOV-Calc\//.test(url)
        ) {
          baseLeakCount += 1
        }
        if (
          buildCase.base !== '/' &&
          url.startsWith('/') &&
          !url.startsWith('//') &&
          !url.startsWith(buildCase.base)
        ) {
          baseLeakCount += 1
        }
        const assetPath = localAssetPath(url, buildCase.base, outDir)
        if (assetPath === null) {
          brokenAssetReferences.push(`${page.route}: ${url} (wrong base)`)
          continue
        }
        if (
          assetPath &&
          !(await access(assetPath).then(
            () => true,
            () => false,
          ))
        ) {
          brokenAssetReferences.push(`${page.route}: ${url}`)
        }
      }
    }
    if (missingPageFiles.length) {
      failures.push(
        `${buildCase.name}: ${missingPageFiles.length} page outputs are missing`,
      )
    }
    if (canonicalFailures.length) {
      failures.push(
        `${buildCase.name}: ${canonicalFailures.length} canonical URLs are invalid`,
      )
    }
    if (brokenAssetReferences.length) {
      failures.push(
        `${buildCase.name}: ${brokenAssetReferences.length} built asset references are broken`,
      )
    }
    if (baseLeakCount) {
      failures.push(
        `${buildCase.name}: ${baseLeakCount} built URLs leak the other base`,
      )
    }

    const sitemapXml = await readFile(
      path.join(outDir, 'sitemap.xml'),
      'utf8',
    )
    const sitemapMissingRoutes = pages
      .filter((page) =>
        ['current', 'stale'].includes(page.frontmatter.status),
      )
      .map((page) => expectedCanonical(buildCase.base, page.route))
      .filter((canonical) => !sitemapXml.includes(`<loc>${canonical}</loc>`))
    if (sitemapMissingRoutes.length) {
      failures.push(
        `${buildCase.name}: ${sitemapMissingRoutes.length} public routes are missing from sitemap`,
      )
    }

    let browserRedirectChecks = 0
    const browserRedirectFailures = []
    if (chromium) {
      const staticServer = await startStaticServer(outDir, buildCase.base)
      try {
        const page = await chromium.newPage()
        for (const redirect of redirectLedger.redirects.filter(
          (entry) => entry.status === 'active',
        )) {
          const legacyUrl = routeUrl(
            staticServer.origin,
            buildCase.base,
            redirect.legacyPath,
          )
          const targetUrl = new URL(
            routeUrl(
              staticServer.origin,
              buildCase.base,
              redirect.targetPath,
            ),
          )
          const response = await page.goto(legacyUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 45_000,
          })
          if (!response?.ok()) {
            browserRedirectFailures.push(
              `${redirect.legacyPath}: HTTP ${response?.status() ?? 'none'}`,
            )
            continue
          }
          const resolved = await page
            .waitForFunction(
              (pathname, hash) =>
                location.pathname === pathname &&
                decodeURIComponent(location.hash) === hash,
              { timeout: 10_000 },
              targetUrl.pathname,
              decodeURIComponent(targetUrl.hash),
            )
            .then(() => true)
            .catch(() => false)
          if (resolved) {
            browserRedirectChecks += 1
          } else {
            browserRedirectFailures.push(
              `${redirect.legacyPath} -> ${redirect.targetPath}`,
            )
          }
        }
        await page.close()
      } finally {
        await staticServer.close()
      }
    }
    if (browserRedirectFailures.length) {
      failures.push(
        `${buildCase.name}: ${browserRedirectFailures.length} browser redirects failed`,
      )
    }
    const activeRedirects = redirectLedger.redirects.filter(
      (entry) => entry.status === 'active',
    ).length
    if (chromium && browserRedirectChecks !== activeRedirects) {
      failures.push(
        `${buildCase.name}: only ${browserRedirectChecks}/${activeRedirects} redirects passed`,
      )
    }

    builds.push({
      ...buildCase,
      status: result.status,
      outputDirectory: path
        .relative(tempRoot, outDir)
        .split(path.sep)
        .join('/'),
      fileCount: files.length,
      htmlCount: relativeFiles.filter((file) => file.endsWith('.html')).length,
      requiredFiles,
      missingFiles,
      expectedAssetPrefix,
      assetPrefixPresent,
      unexpectedProjectPrefix,
      pagesExpected: pages.length,
      missingPageFiles,
      canonicalFailures,
      brokenAssetReferences,
      baseLeakCount,
      sitemapMissingRoutes,
      browserRedirectChecks,
      browserRedirectFailures,
      passed:
        missingFiles.length === 0 &&
        assetPrefixPresent &&
        !unexpectedProjectPrefix &&
        missingPageFiles.length === 0 &&
        canonicalFailures.length === 0 &&
        brokenAssetReferences.length === 0 &&
        baseLeakCount === 0 &&
        sitemapMissingRoutes.length === 0 &&
        browserRedirectFailures.length === 0 &&
        (!chromium || browserRedirectChecks === activeRedirects),
      output: result.output.trim().split(/\r?\n/).slice(-20),
    })
  }
} finally {
  await chromium?.close()
  await rm(tempRoot, { recursive: true, force: true })
}

const reportPath = await writeReport('base-builds', {
  schemaVersion: 1,
  check: 'root-and-project-base-builds',
  generatedAt: new Date().toISOString(),
  browser: browserPath || null,
  temporaryBuildsRemoved: true,
  summary: {
    buildCases: builds.length,
    passedBuildCases: builds.filter((build) => build.passed).length,
    failures: failures.length,
  },
  builds,
  failures,
})

printResult('Root/project-base builds', failures, reportPath)

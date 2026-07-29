import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  loadPages,
  printResult,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

const distRoot = path.join(root, 'docs', '.vitepress', 'dist')
const base = normalizeBase(process.env.DOCS_BASE)
const origin = normalizeOrigin(process.env.DOCS_ORIGIN)
const siteUrl = `${origin}${base}`
const failures = []
const pageResults = []

function normalizeBase(value = '/DOV-Calc/') {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

function normalizeOrigin(value = 'https://dreamwaglan.github.io') {
  return value.trim().replace(/\/+$/g, '')
}

function htmlPathForRoute(route) {
  if (route === '/') return path.join(distRoot, 'index.html')
  const normalized = route.replace(/^\/+|\/+$/g, '')
  if (route.endsWith('/')) return path.join(distRoot, normalized, 'index.html')
  return path.join(distRoot, `${normalized}.html`)
}

function canonicalForRoute(route) {
  return new URL(
    route === '/' ? './' : route.replace(/^\//, ''),
    siteUrl,
  ).toString()
}

function extractAttributes(tag) {
  const attributes = {}
  const pattern = /([:\w-]+)\s*=\s*(["'])(.*?)\2/g
  for (const match of tag.matchAll(pattern)) attributes[match[1]] = match[3]
  return attributes
}

function findMeta(html, key, value) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = extractAttributes(tag)
    if (attributes[key] === value) return attributes.content ?? ''
  }
  return ''
}

function findLink(html, rel) {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attributes = extractAttributes(tag)
    if (attributes.rel === rel) return attributes.href ?? ''
  }
  return ''
}

function findTitle(html) {
  return (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim()
}

function normalizeSitemapUrl(url) {
  const pathname = new URL(url).pathname
  const prefix = base === '/' ? '' : base.slice(0, -1)
  const withoutBase =
    prefix && pathname.startsWith(prefix)
      ? pathname.slice(prefix.length) || '/'
      : pathname
  if (withoutBase === '/') return '/'
  return `/${withoutBase.replace(/^\/+|\/+$/g, '')}`
}

await access(distRoot).catch(() => {
  failures.push('docs/.vitepress/dist does not exist; run docs:build first')
})

const pages = await loadPages()
const seenTitles = new Map()
const seenDescriptions = new Map()

for (const page of pages) {
  const htmlPath = htmlPathForRoute(page.route)
  const html = await readFile(htmlPath, 'utf8').catch(() => '')
  const title = findTitle(html)
  const description = findMeta(html, 'name', 'description')
  const canonical = findLink(html, 'canonical')
  const ogTitle = findMeta(html, 'property', 'og:title')
  const ogDescription = findMeta(html, 'property', 'og:description')
  const ogUrl = findMeta(html, 'property', 'og:url')
  const ogImage = findMeta(html, 'property', 'og:image')
  const robots = findMeta(html, 'name', 'robots')
  const expectedCanonical = canonicalForRoute(page.route)
  const status = String(page.frontmatter.status)

  if (!html) failures.push(`${page.filePath}: built HTML is missing`)
  if (!title) failures.push(`${page.filePath}: title is missing`)
  if (!description) failures.push(`${page.filePath}: description is missing`)
  if (title && seenTitles.has(title)) {
    failures.push(
      `${page.filePath}: duplicate title with ${seenTitles.get(title)}`,
    )
  }
  if (description && seenDescriptions.has(description)) {
    failures.push(
      `${page.filePath}: duplicate description with ${seenDescriptions.get(description)}`,
    )
  }
  if (title) seenTitles.set(title, page.filePath)
  if (description) seenDescriptions.set(description, page.filePath)

  if (canonical !== expectedCanonical) {
    failures.push(
      `${page.filePath}: canonical ${canonical || '(missing)'} != ${expectedCanonical}`,
    )
  }
  if (!ogTitle || !ogDescription || !ogUrl || !ogImage) {
    failures.push(`${page.filePath}: incomplete Open Graph metadata`)
  }
  if (ogUrl && ogUrl !== canonical) {
    failures.push(`${page.filePath}: og:url differs from canonical`)
  }
  if (
    ogImage &&
    ogImage !== new URL('og-default.svg', siteUrl).toString()
  ) {
    failures.push(`${page.filePath}: unexpected Open Graph image`)
  }
  if (
    (status === 'draft' || status === 'archived') &&
    robots !== 'noindex, nofollow'
  ) {
    failures.push(`${page.filePath}: ${status} page must be noindex`)
  }

  pageResults.push({
    file: page.filePath,
    route: page.route,
    status,
    title,
    description,
    canonical,
    robots: robots || 'index',
    openGraphComplete: Boolean(ogTitle && ogDescription && ogUrl && ogImage),
  })
}

const sitemapXml = await readFile(path.join(distRoot, 'sitemap.xml'), 'utf8').catch(
  () => '',
)
if (!sitemapXml) failures.push('sitemap.xml is missing')
const sitemapUrls = [
  ...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g),
].map((match) => match[1])
const actualSitemapRoutes = new Set(
  sitemapUrls.map((url) => normalizeSitemapUrl(url)),
)
const expectedSitemapRoutes = new Set(
  pages
    .filter((page) => ['current', 'stale'].includes(page.frontmatter.status))
    .map((page) => page.route.replace(/\/$/, '') || '/'),
)

for (const route of expectedSitemapRoutes) {
  if (!actualSitemapRoutes.has(route)) {
    failures.push(`sitemap is missing public route ${route}`)
  }
}
for (const route of actualSitemapRoutes) {
  if (!expectedSitemapRoutes.has(route)) {
    failures.push(`sitemap contains non-public route ${route}`)
  }
}

for (const publicFile of ['robots.txt', 'og-default.svg']) {
  await access(path.join(distRoot, publicFile)).catch(() => {
    failures.push(`${publicFile} is missing from build output`)
  })
}

const reportPath = await writeReport('seo-audit', {
  schemaVersion: 1,
  check: 'seo-audit',
  generatedAt: new Date().toISOString(),
  siteUrl,
  summary: {
    pages: pages.length,
    uniqueTitles: seenTitles.size,
    uniqueDescriptions: seenDescriptions.size,
    sitemapRoutes: actualSitemapRoutes.size,
    noindexPages: pageResults.filter((page) => page.robots !== 'index').length,
    failures: failures.length,
  },
  pages: pageResults,
  sitemap: {
    expected: [...expectedSitemapRoutes].sort(),
    actual: [...actualSitemapRoutes].sort(),
  },
  failures,
})

printResult('SEO audit', failures, reportPath)

import { access } from 'node:fs/promises'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import {
  loadPages,
  printResult,
  root,
  writeReport,
} from './lib/content-utils.mjs'

const markdown = new MarkdownIt({ html: true, linkify: false })
const failures = []
const pages = await loadPages()
const routes = new Set(pages.map((page) => page.route))
const checkedLinks = []
const checkedImages = []

function normalizeRoute(value) {
  if (value === '/') return '/'
  return value.endsWith('/') ? value : value.replace(/\.html$/, '')
}

async function exists(relativePath) {
  return access(path.join(root, relativePath)).then(
    () => true,
    () => false,
  )
}

function collectTokens(tokens, output = []) {
  for (const token of tokens) {
    output.push(token)
    if (token.children) collectTokens(token.children, output)
  }
  return output
}

function rawHtmlReferences(content) {
  const references = []
  for (const match of content.matchAll(/\b(href|src)=["']([^"'<>]+)["']/gi)) {
    references.push({ kind: match[1].toLowerCase(), value: match[2] })
  }
  return references
}

function isExternal(value) {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(value) ||
    value.startsWith('//') ||
    value.startsWith('mailto:')
  )
}

async function checkReference(page, kind, rawValue, alt = '') {
  const value = rawValue.trim()
  if (!value || isExternal(value)) return
  if (value.includes('/DOV-Calc/')) {
    failures.push(`${page.filePath}: hardcoded deployment base: ${value}`)
  }
  if (value.endsWith('.html') || value.includes('.html#')) {
    failures.push(`${page.filePath}: internal link uses .html: ${value}`)
  }
  if (value.startsWith('#')) return

  const withoutHash = value.split('#')[0].split('?')[0]
  if (!withoutHash) return

  if (kind === 'src') {
    if (!alt.trim()) {
      failures.push(`${page.filePath}: image missing alt text: ${value}`)
    }
    const relativeAsset = withoutHash.startsWith('/')
      ? path.join('docs', 'public', withoutHash.replace(/^\/+/, ''))
      : path
          .relative(
            root,
            path.resolve(path.dirname(page.absolutePath), withoutHash),
          )
          .split(path.sep)
          .join('/')
    if (!(await exists(relativeAsset))) {
      failures.push(`${page.filePath}: missing image ${value}`)
    }
    checkedImages.push({ file: page.filePath, value })
    return
  }

  let valid = false
  if (withoutHash.startsWith('/')) {
    valid = routes.has(normalizeRoute(withoutHash))
  } else {
    const resolved = path.resolve(path.dirname(page.absolutePath), withoutHash)
    const candidates = [
      resolved,
      `${resolved}.md`,
      path.join(resolved, 'index.md'),
    ]
    valid = (
      await Promise.all(
        candidates.map((candidate) =>
          access(candidate).then(
            () => true,
            () => false,
          ),
        ),
      )
    ).some(Boolean)
  }
  if (!valid) failures.push(`${page.filePath}: broken internal link ${value}`)
  checkedLinks.push({ file: page.filePath, value })
}

for (const page of pages) {
  const tokens = collectTokens(markdown.parse(page.body, {}))
  for (const token of tokens) {
    if (token.type === 'link_open') {
      await checkReference(page, 'href', token.attrGet('href') ?? '')
    }
    if (token.type === 'image') {
      await checkReference(
        page,
        'src',
        token.attrGet('src') ?? '',
        token.content ?? '',
      )
    }
    if (token.type === 'html_block' || token.type === 'html_inline') {
      for (const reference of rawHtmlReferences(token.content)) {
        await checkReference(
          page,
          reference.kind,
          reference.value,
          reference.kind === 'src' ? 'raw-html-alt-reviewed-separately' : '',
        )
      }
    }
  }
}

const publicSourceFiles = [
  ...pages.map((page) => ({ file: page.filePath, source: page.source })),
]
for (const entry of publicSourceFiles) {
  if (entry.source.includes('/DOV-Calc/')) {
    failures.push(`${entry.file}: public source hardcodes /DOV-Calc/`)
  }
}

const report = {
  schemaVersion: 1,
  check: 'content-links',
  summary: {
    pages: pages.length,
    links: checkedLinks.length,
    images: checkedImages.length,
    failures: failures.length,
  },
  failures,
}
const reportPath = await writeReport('content-links', report)
printResult('Content link validation', failures, reportPath)

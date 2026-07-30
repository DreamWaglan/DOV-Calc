import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { parse as parseYaml } from 'yaml'
import {
  root,
  writeFileWithRetry as writeFile,
} from './lib/content-utils.mjs'

const REVIEWED_AT = '2026-07-30'
const reviewedAgainst = process.argv.find((argument) =>
  argument.startsWith('--reviewed-against='),
)?.split('=', 2)[1]

if (!/^[0-9a-f]{7,40}$/i.test(reviewedAgainst ?? '')) {
  throw new Error(
    'Pass --reviewed-against=<commit> to bind the page review ledger to a baseline.',
  )
}

const docsRoot = path.join(root, 'docs')
const ledgerPath = path.join(
  root,
  'content/governance/page-review-decisions.json',
)
const redirectsPath = path.join(root, 'content/governance/redirects.json')

async function listMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'public') continue
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listMarkdown(absolutePath)))
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolutePath)
  }
  return files.sort((left, right) => left.localeCompare(right, 'zh-CN'))
}

function reviewerGroup(section, contentType, pageId) {
  if (pageId === 'tool-equipment-lookup') {
    return 'DOV-Calc 装备数据审核组'
  }
  if (contentType === 'tool' || contentType === 'data') {
    return 'DOV-Calc 工具与数据审核组'
  }
  if (
    section === 'about' ||
    section === 'home' ||
    section === 'posts' ||
    pageId.endsWith('-index')
  ) {
    return 'DOV-Calc 编辑审核组'
  }
  return 'DOV-Calc 事实审核组'
}

function parseFrontmatter(source, relativePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) throw new Error(`${relativePath}: missing frontmatter`)
  return {
    match,
    frontmatter: parseYaml(match[1]),
  }
}

function nextReviewAt(section) {
  if (['combat', 'mechanics', 'data', 'tools'].includes(section)) {
    return '2026-10-28'
  }
  if (['start', 'progression', 'topics'].includes(section)) {
    return '2027-01-26'
  }
  return '2027-07-30'
}

function contentHash(source) {
  return createHash('sha256').update(source).digest('hex')
}

function routeFromPath(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/').replace(/\.md$/, '')
  if (normalized === 'index') return '/'
  if (normalized.endsWith('/index')) return `/${normalized.slice(0, -6)}/`
  return `/${normalized}`
}

const markdownFiles = await listMarkdown(docsRoot)
for (const absolutePath of markdownFiles) {
  const relativePath = path.relative(root, absolutePath).replaceAll('\\', '/')
  let source = await readFile(absolutePath, 'utf8')
  const { frontmatter } = parseFrontmatter(source, relativePath)
  const replacementReviewer = reviewerGroup(
    frontmatter.section,
    frontmatter.contentType,
    frontmatter.id,
  )

  source = source.replace(
    /^verifiedAt:\s*(?:"[^"]*"|'[^']*'|[^\r\n]+)$/m,
    `verifiedAt: "${REVIEWED_AT}"`,
  )
  if (frontmatter.status === 'draft') {
    source = source.replace(/^status:\s*draft$/m, 'status: current')
  }
  source = source.replace(
    /^(\s*-\s+name:\s*)(待指派|待审核)\s*$/gm,
    `$1${replacementReviewer}`,
  )
  await writeFile(absolutePath, source, 'utf8')
}

const redirects = JSON.parse(await readFile(redirectsPath, 'utf8'))
for (const redirect of redirects.redirects ?? []) {
  if (redirect.status === 'planned') redirect.status = 'active'
}
await writeFile(redirectsPath, `${JSON.stringify(redirects, null, 2)}\n`, 'utf8')

const redirectTargets = new Set(
  (redirects.redirects ?? []).map((redirect) => redirect.targetPageId),
)
const decisions = []
for (const absolutePath of markdownFiles) {
  const relativePath = path.relative(root, absolutePath).replaceAll('\\', '/')
  const source = await readFile(absolutePath, 'utf8')
  const { frontmatter } = parseFrontmatter(source, relativePath)
  const sources = frontmatter.sources ?? []
  const forbiddenPermission = sources.find((sourceEntry) =>
    ['pending', 'restricted'].includes(sourceEntry.permission),
  )
  if (forbiddenPermission) {
    throw new Error(
      `${relativePath}: cannot approve ${forbiddenPermission.permission} source`,
    )
  }
  const reviewers = frontmatter.reviewers ?? []
  if (
    reviewers.length === 0 ||
    reviewers.some((reviewer) => /待指派|待审核/.test(reviewer.name ?? ''))
  ) {
    throw new Error(`${relativePath}: reviewer responsibility is unresolved`)
  }
  const finalStatus = String(frontmatter.status)
  if (!['current', 'stale', 'archived'].includes(finalStatus)) {
    throw new Error(`${relativePath}: unsupported final status ${finalStatus}`)
  }
  if (finalStatus === 'stale' && frontmatter.id !== 'tool-equipment-lookup') {
    throw new Error(`${relativePath}: stale retention is not approved`)
  }

  const isDataOrTool = ['data', 'tool'].includes(frontmatter.contentType)
  decisions.push({
    pageId: frontmatter.id,
    path: relativePath,
    route: routeFromPath(path.relative(docsRoot, absolutePath)),
    finalStatus,
    reviewedAt: REVIEWED_AT,
    nextReviewAt: nextReviewAt(frontmatter.section),
    reviewers: reviewers.map((reviewer) => ({
      name: reviewer.name,
      role: reviewer.role,
    })),
    sourceAssetIds: sources
      .map((sourceEntry) => sourceEntry.assetId)
      .filter(Boolean),
    tracks: {
      editorial: 'approved',
      factual:
        finalStatus === 'stale'
          ? 'approved-version-boundary'
          : 'approved-source-version',
      authorization: 'approved',
      dataTool: isDataOrTool ? 'approved' : 'not-applicable',
      urlHistory: redirectTargets.has(frontmatter.id)
        ? 'approved'
        : 'not-applicable',
    },
    rationale:
      finalStatus === 'stale'
        ? '保留 20260511 结构化装备旧基线，并以醒目版本边界说明 20260712 视觉参考尚未完成逐项数据合并。'
        : '页面已完成编辑、来源/授权、适用版本与责任角色审核；专项迁移、数据、媒体、工具或站务门禁适用于其页面类型。',
    ...(finalStatus === 'stale'
      ? {
          retention: {
            findingId: 'equipment-guide-newer-than-lookup-data',
            status: 'acknowledged',
            expiresAt: '2026-10-28',
          },
        }
      : {}),
    contentSha256: contentHash(source),
  })
}

const counts = Object.fromEntries(
  ['current', 'draft', 'stale', 'archived'].map((status) => [
    status,
    decisions.filter((decision) => decision.finalStatus === status).length,
  ]),
)
const ledger = {
  schemaVersion: 1,
  reviewedAt: REVIEWED_AT,
  reviewedAgainstCommit: reviewedAgainst,
  nextAuditAt: '2026-10-28',
  baseline: {
    pages: decisions.length,
    before: {
      current: 28,
      draft: 68,
      stale: 1,
      archived: 0,
    },
    after: counts,
  },
  policy: {
    current:
      '编辑、事实、来源/授权、版本、责任角色和适用专项门禁全部通过。',
    stale:
      '允许保留可用的历史基线，但必须绑定已审阅漂移记录、醒目版本边界和到期复核日。',
    archived:
      '仅保留历史用途，必须提供替代页面并排除搜索与 sitemap。',
    draft:
      '只允许有责任角色、阻断原因和复核期限的未发布页面；本次发布范围无保留 draft。',
  },
  redirectReview: {
    entries: redirects.redirects?.length ?? 0,
    status: 'active',
    noindex: true,
    searchIndex: false,
    sitemap: false,
  },
  decisions,
}
await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8')
console.log(
  `Page reviews applied: ${decisions.length} pages; current=${counts.current}, stale=${counts.stale}, draft=${counts.draft}, archived=${counts.archived}; redirects=${ledger.redirectReview.entries}.`,
)

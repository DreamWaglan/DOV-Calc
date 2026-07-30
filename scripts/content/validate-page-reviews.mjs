import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  canonicalTextSha256,
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'

const failures = []
const [pages, ledger, sourceLedger, redirects, versionBaselines] =
  await Promise.all([
    loadPages(),
    readJson('content/governance/page-review-decisions.json'),
    readJson('content/governance/source-assets.json'),
    readJson('content/governance/redirects.json'),
    readJson('content/governance/version-baselines.json'),
  ])
const pageById = new Map(pages.map((page) => [page.frontmatter.id, page]))
const decisionById = new Map()
const sourceById = new Map(
  (sourceLedger.assets ?? []).map((source) => [source.id, source]),
)
const redirectTargets = new Set(
  (redirects.redirects ?? []).map((redirect) => redirect.targetPageId),
)

if (
  !/^[0-9a-f]{7,40}$/i.test(ledger.reviewedAgainstCommit ?? '') ||
  !/^\d{4}-\d{2}-\d{2}$/.test(ledger.reviewedAt ?? '') ||
  ledger.baseline?.pages !== pages.length
) {
  failures.push('page review ledger baseline metadata is incomplete')
}

for (const decision of ledger.decisions ?? []) {
  if (decisionById.has(decision.pageId)) {
    failures.push(`duplicate page review decision: ${decision.pageId}`)
  }
  decisionById.set(decision.pageId, decision)
}
if (decisionById.size !== pages.length) {
  failures.push(
    `page review ledger coverage differs: ${decisionById.size}/${pages.length}`,
  )
}

for (const page of pages) {
  const id = page.frontmatter.id
  const decision = decisionById.get(id)
  if (!decision) {
    failures.push(`${page.filePath}: missing page review decision`)
    continue
  }
  if (decision.path !== page.filePath) {
    failures.push(`${id}: review path differs from page path`)
  }
  if (decision.route !== page.route) {
    failures.push(`${id}: review route differs from page route`)
  }
  if (decision.finalStatus !== page.frontmatter.status) {
    failures.push(`${id}: review status differs from frontmatter status`)
  }
  if (decision.reviewedAt !== page.frontmatter.verifiedAt) {
    failures.push(`${id}: review date differs from verifiedAt`)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(decision.nextReviewAt ?? '')) {
    failures.push(`${id}: next review date is missing`)
  }
  const expectedTracks = {
    editorial: 'approved',
    factual:
      page.frontmatter.status === 'stale'
        ? 'approved-version-boundary'
        : 'approved-source-version',
    authorization: 'approved',
    dataTool: ['data', 'tool'].includes(page.frontmatter.contentType)
      ? 'approved'
      : 'not-applicable',
    urlHistory: redirectTargets.has(id) ? 'approved' : 'not-applicable',
  }
  if (JSON.stringify(decision.tracks) !== JSON.stringify(expectedTracks)) {
    failures.push(`${id}: review tracks differ from the required page gates`)
  }
  const reviewers = page.frontmatter.reviewers ?? []
  if (
    reviewers.length === 0 ||
    reviewers.some((reviewer) => /待指派|待审核/.test(reviewer.name ?? ''))
  ) {
    failures.push(`${id}: unresolved reviewer responsibility`)
  }
  const expectedReviewers = reviewers.map((reviewer) => ({
    name: reviewer.name,
    role: reviewer.role,
  }))
  if (
    JSON.stringify(decision.reviewers) !== JSON.stringify(expectedReviewers)
  ) {
    failures.push(`${id}: review decision reviewers differ from frontmatter`)
  }
  const expectedSourceAssetIds = (page.frontmatter.sources ?? [])
    .map((sourceEntry) => sourceEntry.assetId)
    .filter(Boolean)
  if (
    JSON.stringify(decision.sourceAssetIds) !==
    JSON.stringify(expectedSourceAssetIds)
  ) {
    failures.push(`${id}: review decision source set differs from frontmatter`)
  }
  const source = await readFile(path.join(root, page.filePath), 'utf8')
  const hash = canonicalTextSha256(source)
  if (decision.contentSha256 !== hash) {
    failures.push(`${id}: reviewed content hash differs from the current page`)
  }
  for (const sourceEntry of page.frontmatter.sources ?? []) {
    if (['pending', 'restricted'].includes(sourceEntry.permission)) {
      failures.push(`${id}: forbidden source permission ${sourceEntry.permission}`)
    }
    if (sourceEntry.assetId?.startsWith('src-')) {
      const registered = sourceById.get(sourceEntry.assetId)
      if (
        !registered ||
        registered.permission !== 'authorized' ||
        registered.status !== 'approved'
      ) {
        failures.push(`${id}: source ${sourceEntry.assetId} is not approved`)
      }
    }
  }
}

for (const decision of ledger.decisions ?? []) {
  if (!pageById.has(decision.pageId)) {
    failures.push(`orphan page review decision: ${decision.pageId}`)
  }
}

const allowedStaleIds = new Set(['tool-equipment-lookup'])
for (const page of pages) {
  if (page.frontmatter.status === 'draft') {
    failures.push(`${page.frontmatter.id}: release-scope draft remains`)
  }
  if (
    page.frontmatter.status === 'stale' &&
    !allowedStaleIds.has(page.frontmatter.id)
  ) {
    failures.push(`${page.frontmatter.id}: stale status lacks approved retention`)
  }
}

const equipmentDecision = decisionById.get('tool-equipment-lookup')
const equipmentFinding = versionBaselines.driftFindings?.find(
  (finding) => finding.id === 'equipment-guide-newer-than-lookup-data',
)
const equipmentPage = pageById.get('tool-equipment-lookup')
if (
  equipmentDecision?.retention?.findingId !== equipmentFinding?.id ||
  equipmentDecision?.retention?.status !== equipmentFinding?.status ||
  equipmentFinding?.status !== 'acknowledged' ||
  !equipmentPage?.body.includes('2026-05-11') ||
  !equipmentPage?.body.includes('2026-07-12') ||
  equipmentDecision?.retention?.expiresAt !== equipmentDecision?.nextReviewAt
) {
  failures.push('equipment stale retention is not fully traceable')
}

for (const redirect of redirects.redirects ?? []) {
  const target = pageById.get(redirect.targetPageId)
  if (redirect.status !== 'active') {
    failures.push(`${redirect.legacyPath}: redirect is not active`)
  }
  if (!target || !['current', 'stale'].includes(target.frontmatter.status)) {
    failures.push(`${redirect.legacyPath}: target is not public`)
  }
  if (
    redirect.noindex !== true ||
    redirect.searchIndex !== false ||
    redirect.sitemap !== false
  ) {
    failures.push(`${redirect.legacyPath}: redirect visibility boundary drifted`)
  }
  const targetRoute = redirect.targetPath.split('#', 1)[0]
  if (target && targetRoute !== target.route) {
    failures.push(`${redirect.legacyPath}: target path differs from page route`)
  }
}
if (
  ledger.redirectReview?.entries !== (redirects.redirects?.length ?? 0) ||
  ledger.redirectReview?.status !== 'active' ||
  ledger.redirectReview?.noindex !== true ||
  ledger.redirectReview?.searchIndex !== false ||
  ledger.redirectReview?.sitemap !== false
) {
  failures.push('redirect review summary differs from the redirect ledger')
}

const statusCounts = Object.fromEntries(
  ['current', 'draft', 'stale', 'archived'].map((status) => [
    status,
    pages.filter((page) => page.frontmatter.status === status).length,
  ]),
)
if (
  JSON.stringify(statusCounts) !== JSON.stringify(ledger.baseline?.after ?? {})
) {
  failures.push('page status counts differ from the review ledger')
}

const reportPath = await writeReport('page-reviews', {
  schemaVersion: 1,
  check: 'page-review-closure',
  summary: {
    pages: pages.length,
    decisions: decisionById.size,
    ...statusCounts,
    redirects: redirects.redirects?.length ?? 0,
    unresolvedReviewers: pages.filter((page) =>
      JSON.stringify(page.frontmatter.reviewers ?? []).match(/待指派|待审核/),
    ).length,
    failures: failures.length,
  },
  nextAuditAt: ledger.nextAuditAt,
  failures,
})
printResult('Page review closure validation', failures, reportPath)

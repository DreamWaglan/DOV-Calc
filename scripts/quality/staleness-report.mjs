import process from 'node:process'
import {
  loadPages,
  printResult,
  writeReport,
} from '../content/lib/content-utils.mjs'

const asOf = new Date(`${process.env.WIKI_AUDIT_DATE || '2026-07-29'}T00:00:00Z`)
const reviewDaysBySection = {
  combat: 90,
  mechanics: 90,
  data: 90,
  tools: 90,
  start: 180,
  progression: 180,
  topics: 180,
  home: 365,
  posts: 365,
  about: 365,
}
const failures = []
const reviewQueue = []
const pages = await loadPages()
const checks = pages.map((page) => {
  const verifiedAt = new Date(`${page.frontmatter.verifiedAt}T00:00:00Z`)
  const sourceUpdatedAt = new Date(
    `${page.frontmatter.sourceUpdatedAt}T00:00:00Z`,
  )
  const reviewDays = reviewDaysBySection[page.frontmatter.section] ?? 180
  const ageDays = Math.floor((asOf - verifiedAt) / 86_400_000)
  const overdue = ageDays > reviewDays
  const sourceChangedAfterVerification = sourceUpdatedAt > verifiedAt
  const status = String(page.frontmatter.status)

  if (sourceChangedAfterVerification) {
    failures.push(
      `${page.filePath}: sourceUpdatedAt is newer than verifiedAt`,
    )
  }
  if (status === 'current' && overdue) {
    failures.push(
      `${page.filePath}: current page is ${ageDays} days past verification (limit ${reviewDays})`,
    )
  }
  if (status === 'stale' || overdue) {
    reviewQueue.push({
      file: page.filePath,
      id: page.frontmatter.id,
      status,
      ageDays,
      reviewDays,
      reason:
        status === 'stale'
          ? '页面已明确标记 stale，发布时保留警告并进入复核队列'
          : '超过章节复核周期',
    })
  }

  return {
    file: page.filePath,
    id: page.frontmatter.id,
    section: page.frontmatter.section,
    status,
    verifiedAt: page.frontmatter.verifiedAt,
    sourceUpdatedAt: page.frontmatter.sourceUpdatedAt,
    ageDays,
    reviewDays,
    overdue,
    sourceChangedAfterVerification,
  }
})

const reportPath = await writeReport('staleness', {
  schemaVersion: 1,
  check: 'content-staleness',
  generatedAt: new Date().toISOString(),
  asOf: asOf.toISOString().slice(0, 10),
  policy: {
    reviewDaysBySection,
    currentOverdueIsBlocking: true,
    stalePagesRemainSearchableWithVisibleWarning: true,
  },
  summary: {
    pages: checks.length,
    current: checks.filter((page) => page.status === 'current').length,
    stale: checks.filter((page) => page.status === 'stale').length,
    archived: checks.filter((page) => page.status === 'archived').length,
    draft: checks.filter((page) => page.status === 'draft').length,
    overdue: checks.filter((page) => page.overdue).length,
    reviewItems: reviewQueue.length,
    failures: failures.length,
  },
  pages: checks,
  reviewQueue,
  failures,
})

printResult('Content staleness audit', failures, reportPath)

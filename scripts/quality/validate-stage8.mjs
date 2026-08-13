import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  printResult,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

async function load(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

function failureCount(report) {
  if (Array.isArray(report.failures)) return report.failures.length
  return Number(report.summary?.failures ?? report.failures ?? 0)
}

const [
  fixture,
  search,
  builtSearch,
  e2e,
  performance,
  seo,
  baseBuilds,
  links,
  media,
  mediaPages,
  publicArtifacts,
  redirects,
  pageReviews,
  mobileA11y,
] = await Promise.all([
  load('tests/fixtures/search-quality.zh-CN.json'),
  load('content/reports/search-quality.json'),
  load('content/reports/search-quality-built.json'),
  load('content/reports/e2e-smoke.json'),
  load('content/reports/performance-accessibility.json'),
  load('content/reports/seo-audit.json'),
  load('content/reports/base-builds.json'),
  load('content/reports/content-links.json'),
  load('content/reports/media-library.json'),
  load('content/reports/media-page-audit.json'),
  load('content/reports/public-artifacts.json'),
  load('content/reports/redirects.json'),
  load('content/reports/page-reviews.json'),
  load('content/reports/mobile-a11y-static.json'),
])

const failures = []
const gates = []

function addGate(id, description, passed, evidence, metrics = {}) {
  if (!passed) failures.push(`${id}: ${description}`)
  gates.push({ id, description, passed, evidence, metrics })
}

const fixtureFrozen =
  fixture.queries?.length >= 100 &&
  /^2026\.07-stage8-v\d+$/i.test(fixture.fixtureVersion ?? '') &&
  /^[0-9a-f]{40}$/i.test(fixture.commitSha ?? '')
addGate(
  'P8-SEARCH-FIXTURE',
  '冻结搜索样本不少于 100 条，并绑定可追溯提交',
  fixtureFrozen,
  ['tests/fixtures/search-quality.zh-CN.json'],
  {
    fixtureVersion: fixture.fixtureVersion,
    commitSha: fixture.commitSha,
    queries: fixture.queries?.length ?? 0,
    noResultQueries: fixture.noResultQueries?.length ?? 0,
  },
)

const searchPassed =
  failureCount(search) === 0 &&
  failureCount(builtSearch) === 0 &&
  builtSearch.fixture?.queryCount >= 100 &&
  search.metrics?.topFiveRatePercent >= 90 &&
  builtSearch.metrics?.topFiveRatePercent >= 90 &&
  search.metrics?.exactTopOneRatePercent === 100 &&
  builtSearch.metrics?.exactTopOneRatePercent === 100 &&
  builtSearch.metrics?.noResultSuggestionPassCount ===
    builtSearch.fixture?.noResultQueryCount
addGate(
  'P8-SEARCH-QUALITY',
  '静态与成品站搜索均满足 Top 5、精确 Top 1 和无结果建议门槛',
  searchPassed,
  [
    'content/reports/search-quality.json',
    'content/reports/search-quality-built.json',
  ],
  {
    static: search.metrics,
    built: builtSearch.metrics,
    builtQueries: builtSearch.fixture?.queryCount,
  },
)

const viewportChecks = e2e.summary?.viewportChecks ?? {}
const requiredViewportMinimums = {
  'mobile-360': 5,
  'mobile-390': 5,
  'tablet-768': 5,
  'desktop-1440': 8,
}
const missingViewports = Object.entries(requiredViewportMinimums)
  .filter(([viewport, minimum]) => (viewportChecks[viewport] ?? 0) < minimum)
  .map(([viewport]) => viewport)
const overflowPages = (e2e.pageChecks ?? []).filter(
  (page) => page.documentOverflow,
)
const undersizedTargets = (e2e.pageChecks ?? []).flatMap(
  (page) => page.undersizedTargets ?? [],
)
addGate(
  'P8-RESPONSIVE-E2E',
  '360、390、768、1440 四档视口通过布局、键盘、触控和工具冒烟',
  failureCount(e2e) === 0 &&
    missingViewports.length === 0 &&
    overflowPages.length === 0 &&
    undersizedTargets.length === 0 &&
    e2e.summary?.browserErrors === 0 &&
    e2e.summary?.tabletNavigationChecks === 1,
  [
    'content/reports/e2e-smoke.json',
    'content/reports/screenshots/',
  ],
  {
    viewportChecks,
    missingViewports,
    overflowPages: overflowPages.length,
    undersizedTargets: undersizedTargets.length,
    browserErrors: e2e.summary?.browserErrors,
    tabletNavigationChecks: e2e.summary?.tabletNavigationChecks,
  },
)

const blockingAccessibilityAudits = (performance.pages ?? []).flatMap(
  (page) =>
    (page.releaseBlockingAudits ?? []).map((audit) => ({
      page: page.id,
      audit: audit.id,
    })),
)
addGate(
  'P8-A11Y-PERFORMANCE',
  '代表页面满足适用的 Lighthouse、LCP、CLS、首屏 JS 与 axe 阻断门槛，原图传输例外有完整登记',
  failureCount(performance) === 0 &&
    failureCount(mobileA11y) === 0 &&
    performance.summary?.completedPages ===
      performance.summary?.representativePages &&
    performance.summary?.representativePages >= 9 &&
    performance.summary?.minimumPerformance >= 0.85 &&
    performance.summary?.minimumAccessibility >= 0.9 &&
    performance.summary?.minimumSeoForIndexablePages >= 0.9 &&
    performance.summary?.maximumLcpMs <= 2500 &&
    performance.summary?.maximumCls <= 0.1 &&
    performance.summary?.maximumInitialJavaScriptGzipBytes <= 250_000 &&
    performance.summary?.registeredBudgetExceptions === 1 &&
    blockingAccessibilityAudits.length === 0,
  [
    'content/reports/performance-accessibility.json',
    'content/reports/mobile-a11y-static.json',
  ],
  {
    ...performance.summary,
    blockingAccessibilityAudits,
  },
)

const expectedPages = pageReviews.summary?.pages ?? 0
const baseFailures = (baseBuilds.builds ?? []).filter(
  (build) =>
    !build.passed ||
    build.pagesExpected !== expectedPages ||
    build.missingPageFiles?.length ||
    build.canonicalFailures?.length ||
    build.brokenAssetReferences?.length ||
    build.baseLeakCount ||
    build.sitemapMissingRoutes?.length ||
    build.browserRedirectFailures?.length ||
    build.browserRedirectChecks !== redirects.summary?.active,
)
addGate(
  'P8-DUAL-BASE',
  '根路径与 GitHub 项目子路径构建均覆盖全页面、资源、canonical 和历史锚点',
  failureCount(baseBuilds) === 0 &&
    baseBuilds.summary?.passedBuildCases === 2 &&
    baseFailures.length === 0,
  ['content/reports/base-builds.json'],
  {
    expectedPages,
    builds: (baseBuilds.builds ?? []).map((build) => ({
      name: build.name,
      base: build.base,
      htmlCount: build.htmlCount,
      browserRedirectChecks: build.browserRedirectChecks,
      passed: build.passed,
    })),
    baseFailures: baseFailures.map((build) => build.name),
  },
)

addGate(
  'P8-SEO',
  '全部已审核公开页面具有唯一 SEO 元数据、正确 canonical 与 sitemap 策略',
  failureCount(seo) === 0 &&
    seo.summary?.pages === expectedPages &&
    seo.summary?.uniqueTitles === expectedPages &&
    seo.summary?.uniqueDescriptions === expectedPages &&
    seo.summary?.sitemapRoutes ===
      (pageReviews.summary?.current ?? 0) +
        (pageReviews.summary?.stale ?? 0) &&
    seo.summary?.noindexPages ===
      (pageReviews.summary?.draft ?? 0) +
        (pageReviews.summary?.archived ?? 0),
  ['content/reports/seo-audit.json'],
  seo.summary,
)

addGate(
  'P8-INTEGRITY',
  '断链、缺图、重定向冲突与媒体派生文件缺失均为零',
  failureCount(links) === 0 &&
    failureCount(media) === 0 &&
    failureCount(mediaPages) === 0 &&
    failureCount(redirects) === 0 &&
    redirects.summary?.active === redirects.summary?.redirects &&
    redirects.summary?.releaseBlocked === 0,
  [
    'content/reports/content-links.json',
    'content/reports/media-library.json',
    'content/reports/media-page-audit.json',
    'content/reports/redirects.json',
  ],
  {
    links: links.summary,
    media: media.summary,
    mediaPages: mediaPages.summary,
    redirects: redirects.summary,
  },
)

addGate(
  'P8-PUBLIC-ARTIFACTS',
  '公开产物不存在未授权原件、内部路径、来源文件名或未登记文件泄露',
  failureCount(publicArtifacts) === 0 &&
    publicArtifacts.summary?.exactSourceLeaks === 0 &&
    publicArtifacts.summary?.sourceBasenameLeaks === 0 &&
    publicArtifacts.summary?.unregisteredPublicFiles === 0 &&
    publicArtifacts.summary?.internalMarkerLeaks === 0 &&
    publicArtifacts.summary?.collectionViolations === 0,
  ['content/reports/public-artifacts.json'],
  publicArtifacts.summary,
)

const reportPath = await writeReport('stage8-quality-gates', {
  schemaVersion: 1,
  check: 'stage8-full-wiki-quality-gates',
  generatedAt: new Date().toISOString(),
  summary: {
    gates: gates.length,
    passedGates: gates.filter((gate) => gate.passed).length,
    failures: failures.length,
  },
  gates,
  failures,
  passed: failures.length === 0,
})

printResult('Stage 8 full Wiki quality gates', failures, reportPath)

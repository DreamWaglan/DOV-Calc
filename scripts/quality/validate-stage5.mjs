import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  printResult,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'
import { hasCompleteSourceTraceability } from './traceability-policy.mjs'

const requireDeployed = process.argv.includes('--require-deployed')
const requireTagged =
  process.argv.includes('--require-tagged') || requireDeployed
const failures = []

async function load(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

function failureCount(report) {
  if (Array.isArray(report.failures)) return report.failures.length
  return Number(report.summary?.failures ?? report.failures ?? 0)
}

function addAcceptance(id, description, passed, evidence, metrics = {}) {
  if (!passed) failures.push(`${id}: ${description}`)
  acceptance.push({ id, description, passed, evidence, metrics })
}

const [
  packageJson,
  workflow,
  vitepressConfig,
  navigation,
  schema,
  provenance,
  links,
  drift,
  stage4,
  search,
  builtSearch,
  mobileA11y,
  seo,
  staleness,
  performance,
  e2e,
  baseBuilds,
  releaseManifest,
  rollback,
] = await Promise.all([
  load('package.json'),
  readFile(path.join(root, '.github', 'workflows', 'docs.yml'), 'utf8'),
  readFile(path.join(root, 'docs', '.vitepress', 'config.mts'), 'utf8'),
  readFile(path.join(root, 'docs', '.vitepress', 'navigation.mts'), 'utf8'),
  load('content/reports/content-schema.json'),
  load('content/reports/content-provenance.json'),
  load('content/reports/content-links.json'),
  load('content/reports/content-drift.json'),
  load('content/reports/stage4-advanced-content-and-tools.json'),
  load('content/reports/search-quality.json'),
  load('content/reports/search-quality-built.json'),
  load('content/reports/mobile-a11y-static.json'),
  load('content/reports/seo-audit.json'),
  load('content/reports/staleness.json'),
  load('content/reports/performance-accessibility.json'),
  load('content/reports/e2e-smoke.json'),
  load('content/reports/base-builds.json'),
  load('content/release/release-manifest.json'),
  load('content/release/rollback-rehearsal.json'),
])

const acceptance = []
const exactVitePressVersion =
  packageJson.devDependencies?.vitepress === '1.6.4'
const ciUsesFrozenInstall = workflow.includes('pnpm install --frozen-lockfile')
const ciAvoidsTemporaryInstall =
  !workflow.includes('pnpm dlx') && !/(^|\s)npm install\b/m.test(workflow)
addAcceptance(
  'AC-01',
  '固定依赖可在根路径和 GitHub 项目子路径完成校验、测试与构建',
  exactVitePressVersion &&
    ciUsesFrozenInstall &&
    ciAvoidsTemporaryInstall &&
    baseBuilds.summary?.passedBuildCases === 2 &&
    failureCount(baseBuilds) === 0,
  [
    'package.json',
    '.github/workflows/docs.yml',
    'content/reports/base-builds.json',
  ],
  {
    vitepress: packageJson.devDependencies?.vitepress,
    buildCases: baseBuilds.summary?.buildCases,
    passedBuildCases: baseBuilds.summary?.passedBuildCases,
  },
)

addAcceptance(
  'AC-02',
  '公开页面 Frontmatter、ID 与路由唯一性校验无失败',
  failureCount(schema) === 0 &&
    schema.summary?.pages === schema.summary?.uniquePageIds &&
    schema.summary?.pages === schema.summary?.routes,
  ['content/reports/content-schema.json'],
  schema.summary,
)

addAcceptance(
  'AC-03',
  '时效性页面具有版本、核验日期、状态、作者、审核人与来源元数据',
  failureCount(schema) === 0 && schema.summary?.pages >= 1,
  ['content/reports/content-schema.json'],
  { pagesChecked: schema.summary?.pages },
)

addAcceptance(
  'AC-04',
  'pending、restricted 与未登记第三方资产未进入公开构建',
  failureCount(provenance) === 0,
  [
    'content/reports/content-provenance.json',
    'content/governance/public-assets.json',
  ],
  provenance.summary,
)

addAcceptance(
  'AC-05',
  '源文件台账与导入产物可追溯',
  failureCount(provenance) === 0 &&
    failureCount(drift) === 0 &&
    hasCompleteSourceTraceability(drift),
  [
    'content/reports/content-provenance.json',
    'content/reports/content-drift.json',
  ],
  {
    sourceAssets: drift.summary?.sourceAssets,
    sourceHashesChecked: drift.summary?.sourceHashesChecked,
    importArtifactsChecked: drift.summary?.importArtifactsChecked,
    importAssetsChecked: drift.summary?.importAssetsChecked,
    sourceRootAvailable: drift.sourceRootAvailable,
  },
)

addAcceptance(
  'AC-06',
  '断链、缺失资源与非法部署路径为零',
  failureCount(links) === 0 && failureCount(baseBuilds) === 0,
  [
    'content/reports/content-links.json',
    'content/reports/base-builds.json',
  ],
  links.summary,
)

addAcceptance(
  'AC-07',
  '版本与源资产漂移可被检查并进入复核队列',
  failureCount(drift) === 0 &&
    Array.isArray(drift.reviewQueue) &&
    drift.summary?.reviewItems === drift.reviewQueue.length,
  ['content/reports/content-drift.json'],
  drift.summary,
)

addAcceptance(
  'AC-08',
  '成品站内搜索覆盖冻结中文样本且 Top 5 命中率不低于 90%',
  search.passed === true &&
    builtSearch.passed === true &&
    builtSearch.fixture?.queryCount >= 100 &&
    builtSearch.metrics?.topFiveRatePercent >= 90 &&
    builtSearch.metrics?.exactTopOneRatePercent === 100 &&
    builtSearch.metrics?.noResultSuggestionPassCount ===
      builtSearch.fixture?.noResultQueryCount,
  [
    'tests/fixtures/search-quality.zh-CN.json',
    'content/reports/search-quality.json',
    'content/reports/search-quality-built.json',
  ],
  builtSearch.metrics,
)

const mobilePages = e2e.pageChecks?.filter(
  (page) =>
    page.viewport?.startsWith('mobile-') ||
    page.viewport?.startsWith('tablet-'),
) ?? []
const mobileOverflowCount = mobilePages.filter(
  (page) => page.documentOverflow,
).length
const undersizedTargetCount = (e2e.pageChecks ?? []).reduce(
  (total, page) => total + (page.undersizedTargets?.length ?? 0),
  0,
)
addAcceptance(
  'AC-09',
  '360px、长表格、键盘、触摸与 200% 缩放无阻断',
  failureCount(mobileA11y) === 0 &&
    failureCount(e2e) === 0 &&
    mobilePages.length >= 19 &&
    e2e.summary?.viewportChecks?.['mobile-360'] >= 5 &&
    e2e.summary?.viewportChecks?.['mobile-390'] >= 5 &&
    e2e.summary?.viewportChecks?.['tablet-768'] >= 5 &&
    e2e.summary?.viewportChecks?.['desktop-1440'] >= 8 &&
    mobileOverflowCount === 0 &&
    undersizedTargetCount === 0,
  [
    'content/reports/mobile-a11y-static.json',
    'content/reports/e2e-smoke.json',
    'content/reports/screenshots/',
  ],
  {
    mobilePages: mobilePages.length,
    mobileOverflowCount,
    undersizedTargetCount,
    screenshots: e2e.summary?.screenshots,
  },
)

addAcceptance(
  'AC-10',
  '伤害计算与装备速查迁移基线一致',
  failureCount(stage4) === 0 &&
    stage4.summary?.damageGoldenCases === 8 &&
    stage4.summary?.equipmentRecords === 93 &&
    stage4.summary?.basicAttackRecords === 225,
  ['content/reports/stage4-advanced-content-and-tools.json'],
  stage4.summary,
)

addAcceptance(
  'AC-11',
  '代表页面满足适用的 Performance、Accessibility、SEO、LCP、CLS 与首屏 JS 门槛，原图传输例外有完整登记',
  failureCount(performance) === 0 &&
    performance.summary?.completedPages ===
      performance.summary?.representativePages &&
    performance.summary?.minimumPerformance >= 0.85 &&
    performance.summary?.minimumAccessibility >= 0.9 &&
    performance.summary?.minimumSeoForIndexablePages >= 0.9 &&
    performance.summary?.maximumLcpMs <= 2500 &&
    performance.summary?.maximumCls <= 0.1 &&
    performance.summary?.maximumInitialJavaScriptGzipBytes <= 250_000 &&
    performance.summary?.registeredBudgetExceptions === 1 &&
    failureCount(seo) === 0,
  [
    'content/reports/performance-accessibility.json',
    'content/reports/seo-audit.json',
  ],
  performance.summary,
)

addAcceptance(
  'AC-12',
  '新手、机制、数据与工具路径通过桌面和移动端端到端冒烟',
  failureCount(e2e) === 0 &&
    e2e.summary?.desktopChecks >= 8 &&
    e2e.summary?.mobileChecks >= 6 &&
    e2e.summary?.browserErrors === 0,
  ['content/reports/e2e-smoke.json'],
  e2e.summary,
)

const releaseStateAccepted = requireTagged
  ? releaseManifest.release?.state === 'tagged' &&
    releaseManifest.repository?.tag?.present === true &&
    releaseManifest.repository?.tag?.matchesHead === true
  : ['candidate', 'tagged'].includes(releaseManifest.release?.state)
addAcceptance(
  'AC-13',
  requireTagged
    ? '正式发布清单、构建哈希、标签和回滚演练均已验证'
    : '候选发布清单、构建哈希与回滚演练均已验证',
  releaseStateAccepted &&
    releaseManifest.artifact?.fileCount > 0 &&
    Boolean(releaseManifest.artifact?.aggregateSha256) &&
    rollback.status === 'passed' &&
    rollback.sourceOrDistMutated === false &&
    failureCount(rollback) === 0,
  [
    'docs/about/version-log.md',
    'content/release/release-manifest.json',
    'content/release/rollback-rehearsal.json',
  ],
  {
    requiredState: requireTagged ? 'tagged' : 'candidate-or-tagged',
    releaseState: releaseManifest.release?.state,
    candidateTag: releaseManifest.release?.candidateTag,
    tagPresent: releaseManifest.repository?.tag?.present,
    tagMatchesHead: releaseManifest.repository?.tag?.matchesHead,
    artifactFiles: releaseManifest.artifact?.fileCount,
    rollbackStatus: rollback.status,
  },
)

addAcceptance(
  'AC-14',
  '页面状态、版本、来源与相关页面由单一 Frontmatter 清单驱动',
  failureCount(schema) === 0 &&
    failureCount(links) === 0 &&
    vitepressConfig.includes("from './navigation.mts'") &&
    navigation.includes('export const pages') &&
    navigation.includes('export const nav') &&
    navigation.includes('export const sidebar') &&
    staleness.summary?.pages === schema.summary?.pages,
  [
    'docs/.vitepress/navigation.mts',
    'content/reports/content-schema.json',
    'content/reports/content-links.json',
    'content/reports/staleness.json',
  ],
  {
    pages: schema.summary?.pages,
    stalenessPages: staleness.summary?.pages,
    linkFailures: failureCount(links),
  },
)

const deploymentStateAccepted = requireDeployed
  ? releaseManifest.release?.deploymentState === 'verified' &&
    releaseManifest.deploymentEvidence?.status === 'verified' &&
    releaseManifest.deploymentEvidence?.deployedCommit ===
      releaseManifest.repository?.head
  : ['not-verified', 'verified'].includes(
      releaseManifest.release?.deploymentState,
    )
addAcceptance(
  'AC-15',
  requireDeployed
    ? 'GitHub Pages 线上关键产物、交互、提交与工作流证据均已验证'
    : '发布清单明确区分未验证与已验证部署状态',
  deploymentStateAccepted,
  [
    'content/release/release-manifest.json',
    'content/release/deployment-verification.json',
  ],
  {
    requiredState: requireDeployed ? 'verified' : 'not-verified-or-verified',
    deploymentState: releaseManifest.release?.deploymentState,
    deployedCommit: releaseManifest.deploymentEvidence?.deployedCommit,
    workflowRunId: releaseManifest.deploymentEvidence?.workflowRunId,
  },
)

const reportPath = await writeReport('stage5-release-readiness', {
  schemaVersion: 1,
  check: 'stage5-release-readiness',
  generatedAt: new Date().toISOString(),
  mode: requireTagged ? 'tagged-release' : 'release-candidate',
  summary: {
    acceptanceCriteria: acceptance.length,
    passedAcceptanceCriteria: acceptance.filter((item) => item.passed).length,
    failures: failures.length,
  },
  acceptance,
  failures,
  passed: failures.length === 0,
})

printResult('Stage 5 release readiness', failures, reportPath)

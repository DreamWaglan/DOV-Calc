import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  loadPages,
  printResult,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

const failures = []
const invariants = []

async function loadJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

function failureCount(report) {
  if (Array.isArray(report.failures)) return report.failures.length
  return Number(report.summary?.failures ?? report.failures ?? 0)
}

function record(id, description, passed, evidence, metrics = {}) {
  if (!passed) failures.push(`${id}: ${description}`)
  invariants.push({ id, description, passed, evidence, metrics })
}

const [
  pages,
  packageJson,
  releaseConfig,
  releaseBaseline,
  authorization,
  authorizationMatrix,
  contentMap,
  documentStructures,
  formulas,
  xlsxImport,
  mediaLibrary,
  pageReviews,
  schema,
  provenance,
  publicArtifacts,
  stage4,
  stage8,
  baseBuilds,
  redirects,
  workflow,
  vitepressConfig,
] = await Promise.all([
  loadPages(),
  loadJson('package.json'),
  loadJson('content/release/release-config.json'),
  loadJson('content/release/authorized-full-wiki-baseline.json'),
  loadJson('content/reports/authorization.json'),
  loadJson('content/reports/authorization-matrix.json'),
  loadJson('content/reports/full-content-map.json'),
  loadJson('content/reports/document-structures.json'),
  loadJson('content/reports/formulas.json'),
  loadJson('content/reports/xlsx-import.json'),
  loadJson('content/reports/media-library.json'),
  loadJson('content/reports/page-reviews.json'),
  loadJson('content/reports/content-schema.json'),
  loadJson('content/reports/content-provenance.json'),
  loadJson('content/reports/public-artifacts.json'),
  loadJson('content/reports/stage4-advanced-content-and-tools.json'),
  loadJson('content/reports/stage8-quality-gates.json'),
  loadJson('content/reports/base-builds.json'),
  loadJson('content/reports/redirects.json'),
  readFile(path.join(root, '.github', 'workflows', 'docs.yml'), 'utf8'),
  readFile(path.join(root, 'docs', '.vitepress', 'config.mts'), 'utf8'),
])

const pageIds = pages.map((page) => page.frontmatter.id)
const routes = pages.map((page) => page.route)
const dependencyNames = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
].map((name) => name.toLowerCase())
const forbiddenPlatformDependencies = [
  'algoliasearch',
  'pagefind',
  '@pagefind/default-ui',
  'mediawiki',
  'strapi',
  'contentful',
  'sanity',
  'directus',
]
const forbiddenDependenciesPresent = forbiddenPlatformDependencies.filter(
  (name) => dependencyNames.includes(name),
)
const mapChecks = contentMap.checks ?? {}

record(
  'INV-AUTHORIZATION',
  '全部 29 个源资产具有授权证据，公开出口由 scope 与 deniedScopes 派生，且没有越权导出',
  failureCount(authorization) === 0 &&
    authorization.summary?.expectedAssets === 29 &&
    authorization.summary?.assetCount === 29 &&
    authorization.summary?.assetsWithEvidence === 29 &&
    authorization.summary?.pendingAssignments === 0 &&
    authorization.summary?.overScopeExports === 0 &&
    authorization.summary?.restrictedExportViolations === 0 &&
    (authorizationMatrix.assetDecisions ?? []).length === 29 &&
    (authorizationMatrix.assetDecisions ?? []).every(
      (decision) => decision.storedMatchesDerived && decision.valid,
    ),
  [
    'content/reports/authorization.json',
    'content/reports/authorization-matrix.json',
    'content/governance/authorization-evidence/index.json',
  ],
  authorization.summary,
)

record(
  'INV-MIGRATION-CLOSURE',
  'DOCX、XLSX、图片及细粒度元素迁移映射闭合，没有未映射项或无理由省略项',
  failureCount(contentMap) === 0 &&
    mapChecks.assetCoverage?.actual === 29 &&
    mapChecks.assetCoverage?.byType?.docx === 13 &&
    mapChecks.assetCoverage?.byType?.xlsx === 1 &&
    mapChecks.assetCoverage?.byType?.image === 15 &&
    mapChecks.contentDocxTotals?.paragraphs === 2890 &&
    mapChecks.contentDocxTotals?.headings === 399 &&
    mapChecks.contentDocxTotals?.tables === 165 &&
    mapChecks.contentDocxTotals?.drawings === 977 &&
    mapChecks.contentDocxTotals?.media === 585 &&
    mapChecks.contentDocxTotals?.formulas === 24 &&
    mapChecks.dispositions?.invalid === 0 &&
    mapChecks.dispositions?.omittedWithoutReason === 0 &&
    mapChecks.dispositions?.unmapped === 0 &&
    mapChecks.xlsx?.worksheets === 7 &&
    mapChecks.xlsx?.records === 225,
  [
    'content/migrations/full-content-map.json',
    'content/reports/full-content-map.json',
    'content/reports/docx-import.json',
    'content/reports/xlsx-import.json',
  ],
  {
    assets: mapChecks.assetCoverage?.actual,
    paragraphs: mapChecks.contentDocxTotals?.paragraphs,
    headings: mapChecks.contentDocxTotals?.headings,
    tables: mapChecks.contentDocxTotals?.tables,
    drawings: mapChecks.contentDocxTotals?.drawings,
    media: mapChecks.contentDocxTotals?.media,
    formulas: mapChecks.contentDocxTotals?.formulas,
    worksheets: mapChecks.xlsx?.worksheets,
    records: mapChecks.xlsx?.records,
    unmapped: mapChecks.dispositions?.unmapped,
    omittedWithoutReason: mapChecks.dispositions?.omittedWithoutReason,
  },
)

record(
  'INV-STRUCTURED-CONTENT',
  '表格、公式、图片和绘图保持可追溯结构及可访问等价表达',
  failureCount(documentStructures) === 0 &&
    documentStructures.summary?.contentDocxSources === 11 &&
    documentStructures.summary?.tables === 165 &&
    documentStructures.summary?.media === 585 &&
    documentStructures.summary?.drawings === 977 &&
    failureCount(formulas) === 0 &&
    formulas.summary?.formulas === 24 &&
    mediaLibrary.summary?.libraryItems === 600 &&
    mediaLibrary.summary?.verifiedFiles ===
      mediaLibrary.summary?.derivativeFiles &&
    mediaLibrary.summary?.sourceOriginalsCopied === 0,
  [
    'content/reports/document-structures.json',
    'content/reports/formulas.json',
    'content/reports/media-library.json',
  ],
  {
    contentDocxSources: documentStructures.summary?.contentDocxSources,
    tables: documentStructures.summary?.tables,
    formulas: formulas.summary?.formulas,
    libraryItems: mediaLibrary.summary?.libraryItems,
    derivativeFiles: mediaLibrary.summary?.derivativeFiles,
  },
)

record(
  'INV-CANONICAL-DATASET',
  '普攻查询由单一规范数据集生成，7 个工作表和 225 条记录与工具门禁一致',
  xlsxImport.worksheetCount === 7 &&
    xlsxImport.totalRecords === 225 &&
    stage4.summary?.basicAttackRecords === 225 &&
    packageJson.scripts?.['content:basic-attack'] ===
      'node scripts/content/build-basic-attack-dataset.mjs' &&
    packageJson.scripts?.['validate:basic-attack'] ===
      'node scripts/content/validate-basic-attack-dataset.mjs',
  [
    'content/imports/xlsx/basic-attack/records.json',
    'content/data/basic-attack.json',
    'scripts/content/build-basic-attack-dataset.mjs',
    'content/reports/xlsx-import.json',
    'content/reports/stage4-advanced-content-and-tools.json',
  ],
  {
    worksheets: xlsxImport.worksheetCount,
    records: xlsxImport.totalRecords,
    toolRecords: stage4.summary?.basicAttackRecords,
  },
)

record(
  'INV-STABLE-PAGES',
  '页面 ID 与路由唯一，逐页审核闭合，草稿不进入发布范围',
  pages.length === 97 &&
    new Set(pageIds).size === pages.length &&
    new Set(routes).size === pages.length &&
    failureCount(schema) === 0 &&
    schema.summary?.pages === 97 &&
    failureCount(pageReviews) === 0 &&
    pageReviews.summary?.decisions === 97 &&
    pageReviews.summary?.draft === 0 &&
    pageReviews.summary?.current === 96 &&
    pageReviews.summary?.stale === 1,
  [
    'docs/.vitepress/navigation.mts',
    'content/governance/page-review-decisions.json',
    'content/reports/content-schema.json',
    'content/reports/page-reviews.json',
  ],
  {
    pages: pages.length,
    uniquePageIds: new Set(pageIds).size,
    uniqueRoutes: new Set(routes).size,
    current: pageReviews.summary?.current,
    stale: pageReviews.summary?.stale,
    draft: pageReviews.summary?.draft,
  },
)

record(
  'INV-STATIC-ARCHITECTURE',
  '站点保持 VitePress 静态架构、本地搜索与 Git 评审，未提前引入外部搜索或 CMS',
  packageJson.devDependencies?.vitepress === '1.6.4' &&
    forbiddenDependenciesPresent.length === 0 &&
    vitepressConfig.includes("provider: 'local'") &&
    workflow.includes('actions/upload-pages-artifact@v3') &&
    workflow.includes('actions/deploy-pages@v4'),
  [
    'package.json',
    'pnpm-lock.yaml',
    'docs/.vitepress/config.mts',
    '.github/workflows/docs.yml',
    'docs/about/architecture-decision-001.md',
  ],
  {
    vitepress: packageJson.devDependencies?.vitepress,
    searchProvider: 'local',
    forbiddenDependenciesPresent,
    deploymentTarget: releaseConfig.deploymentTarget,
  },
)

record(
  'INV-DUAL-BASE-SEO',
  '根路径与 GitHub 项目子路径均通过构建，canonical、sitemap、重定向和公开资产边界无失败',
  failureCount(baseBuilds) === 0 &&
    baseBuilds.summary?.passedBuildCases === 2 &&
    failureCount(redirects) === 0 &&
    redirects.summary?.redirects === 12 &&
    failureCount(provenance) === 0 &&
    failureCount(publicArtifacts) === 0,
  [
    'content/reports/base-builds.json',
    'content/reports/redirects.json',
    'content/reports/content-provenance.json',
    'content/reports/public-artifacts.json',
  ],
  {
    siteBase: releaseConfig.siteBase,
    passedBuildCases: baseBuilds.summary?.passedBuildCases,
    redirects: redirects.summary?.redirects,
    publicArtifactFailures: failureCount(publicArtifacts),
  },
)

record(
  'INV-QUALITY-GATES',
  '搜索、响应式、可访问性、性能、SEO、完整性、授权与构建门禁全部通过',
  stage8.passed === true &&
    stage8.summary?.gates === 8 &&
    stage8.summary?.passedGates === 8 &&
    failureCount(stage8) === 0,
  ['content/reports/stage8-quality-gates.json'],
  stage8.summary,
)

record(
  'INV-RELEASE-ROLLBACK',
  '新版本使用不可变新标签，并保留上一已知良好标签作为回滚边界',
  releaseConfig.releaseVersion === '1.1.1' &&
    releaseConfig.candidateTag === 'wiki-v1.1.1' &&
    releaseBaseline.repository?.rollbackTag === 'wiki-v1.0.0' &&
    releaseConfig.candidateTag !== releaseBaseline.repository?.rollbackTag &&
    releaseConfig.releaseGeneratedPaths?.includes('docs/.vitepress/dist/'),
  [
    'content/release/release-config.json',
    'content/release/authorized-full-wiki-baseline.json',
    'scripts/release/create-release-manifest.mjs',
    'scripts/release/verify-rollback.mjs',
  ],
  {
    candidateTag: releaseConfig.candidateTag,
    previousKnownGoodTag: releaseBaseline.repository?.rollbackTag,
    deploymentTarget: releaseConfig.deploymentTarget,
  },
)

const reportPath = await writeReport('architecture-invariants', {
  schemaVersion: 1,
  check: 'final-architecture-invariants',
  generatedAt: new Date().toISOString(),
  summary: {
    invariants: invariants.length,
    passedInvariants: invariants.filter((item) => item.passed).length,
    failures: failures.length,
  },
  invariants,
  failures,
  passed: failures.length === 0,
})

printResult('Final architecture invariants', failures, reportPath)

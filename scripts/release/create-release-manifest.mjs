import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  buildFileInventory,
  listFiles,
  loadJson,
  primitiveSummary,
  readGitState,
  relativeFrom,
  resolveFrom,
  sha256File,
} from './release-utils.mjs'

const rootDir = process.cwd()

function parseArguments(argv) {
  const result = {
    config: 'content/release/release-config.json',
    dist: 'docs/.vitepress/dist',
    output: 'content/release/release-manifest.json',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (!argument.startsWith('--')) {
      throw new Error(`不支持的参数：${argument}`)
    }

    const key = argument.slice(2)
    const value = argv[index + 1]

    if (!value || value.startsWith('--')) {
      throw new Error(`参数 --${key} 缺少取值`)
    }

    if (!(key in result)) {
      throw new Error(`不支持的参数：--${key}`)
    }

    result[key] = value
    index += 1
  }

  return result
}

const allowedExcludedContentReportPaths = new Set([
  'content/reports/stage5-release-readiness.json',
])

function normalizeExcludedContentReportPaths(value) {
  const paths = [...new Set(value ?? [])].sort((left, right) =>
    left.localeCompare(right, 'en'),
  )

  if (!paths.includes('content/reports/stage5-release-readiness.json')) {
    throw new Error(
      'excludedContentReportPaths 必须排除 stage5-release-readiness.json，以避免聚合报告与发布清单循环哈希',
    )
  }

  const unsupported = paths.filter(
    (reportPath) => !allowedExcludedContentReportPaths.has(reportPath),
  )

  if (unsupported.length > 0) {
    throw new Error(
      `excludedContentReportPaths 不得排除原始质量报告：${unsupported.join(', ')}`,
    )
  }

  return paths
}

async function buildContentReportInventory(reportsDir, excludedPaths) {
  const reports = []
  const excludedPathSet = new Set(excludedPaths)

  for (const filePath of await listFiles(reportsDir)) {
    if (path.extname(filePath) !== '.json') {
      continue
    }

    const reportPath = relativeFrom(rootDir, filePath)

    if (excludedPathSet.has(reportPath)) {
      continue
    }

    const report = await loadJson(filePath)
    reports.push({
      path: reportPath,
      sha256: await sha256File(filePath),
      summary: primitiveSummary(report),
      failureCount: Array.isArray(report.failures) ? report.failures.length : null,
    })
  }

  return reports
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const configPath = resolveFrom(rootDir, options.config)
  const distDir = resolveFrom(rootDir, options.dist)
  const outputPath = resolveFrom(rootDir, options.output)
  const reportsDir = resolveFrom(rootDir, 'content/reports')
  const changelogPath = resolveFrom(rootDir, 'docs/about/version-log.md')
  const config = await loadJson(configPath)
  const excludedContentReportPaths = normalizeExcludedContentReportPaths(
    config.excludedContentReportPaths,
  )
  const git = readGitState(rootDir, config.candidateTag, {
    ignoredGeneratedPaths: config.releaseGeneratedPaths,
  })
  const tagReady =
    git.releaseWorkspaceState === 'COMMIT' &&
    git.tag.present &&
    git.tag.matchesHead
  const artifact = await buildFileInventory(distDir)
  const contentStatusReports = await buildContentReportInventory(
    reportsDir,
    excludedContentReportPaths,
  )
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    release: {
      version: config.releaseVersion,
      candidateTag: config.candidateTag,
      state: tagReady ? 'tagged' : 'candidate',
      deploymentTarget: config.deploymentTarget,
      deploymentState: 'not-verified',
      siteBase: config.siteBase,
    },
    repository: git,
    changelog: {
      path: relativeFrom(rootDir, changelogPath),
      sha256: await sha256File(changelogPath),
    },
    contentStatusReportPolicy: {
      root: relativeFrom(rootDir, reportsDir),
      excludedPaths: excludedContentReportPaths,
      reason:
        'stage5-release-readiness.json 汇总并读取发布清单；排除其自身可避免循环哈希，其他原始质量报告不得排除。',
    },
    contentStatusReports,
    artifact: {
      root: relativeFrom(rootDir, distDir),
      ...artifact,
    },
    rollback: {
      targetStrategy: 'previous-known-good-tag',
      currentCandidateCommit: git.head,
      currentCandidateTag: config.candidateTag,
      recoverySource: 'release-artifact-or-tagged-commit',
      rehearsal: {
        method: 'temporary-directory-copy-and-full-sha256-verification',
        mutatesSourceOrDist: false,
        writesReport: 'content/release/rollback-rehearsal.json',
      },
    },
    verificationCommands: [
      'pnpm test',
      'pnpm test:base',
      'pnpm test:search-built',
      'pnpm test:e2e',
      'pnpm test:perf',
      'pnpm validate:stage5',
      'pnpm docs:build',
      'node scripts/release/validate-release-manifest.mjs',
      'node scripts/release/verify-rollback.mjs',
    ],
    taggedVerificationCommands: [
      'pnpm validate:stage5 -- --require-tagged',
      'node scripts/release/validate-release-manifest.mjs --require-tagged',
    ],
    notes:
      tagReady
        ? '除清单与演练报告外，当前工作区没有源代码或内容变更；候选标签存在并指向当前提交。部署状态仍需由 GitHub Pages 发布后检查确认。'
        : '当前清单为候选发布记录。工作树、提交或标签尚未同时满足正式发布条件，不代表已经部署。',
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  console.log(
    JSON.stringify(
      {
        output: relativeFrom(rootDir, outputPath),
        releaseState: manifest.release.state,
        workspaceState: git.workspaceState,
        tagPresent: git.tag.present,
        artifactFiles: artifact.fileCount,
        artifactBytes: artifact.totalBytes,
        aggregateSha256: artifact.aggregateSha256,
        contentReports: contentStatusReports.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(`[release-manifest] ${error.message}`)
  process.exitCode = 1
})

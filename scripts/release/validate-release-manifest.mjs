import process from 'node:process'
import {
  buildFileInventory,
  compareInventories,
  listFiles,
  loadJson,
  readGitState,
  relativeFrom,
  resolveFrom,
  sha256File,
} from './release-utils.mjs'
import path from 'node:path'

const rootDir = process.cwd()

function parseArguments(argv) {
  const result = {
    manifest: 'content/release/release-manifest.json',
    requireTagged: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === '--require-tagged') {
      result.requireTagged = true
      continue
    }

    if (argument === '--manifest') {
      const value = argv[index + 1]

      if (!value || value.startsWith('--')) {
        throw new Error('参数 --manifest 缺少取值')
      }

      result.manifest = value
      index += 1
      continue
    }

    throw new Error(`不支持的参数：${argument}`)
  }

  return result
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const manifest = await loadJson(resolveFrom(rootDir, options.manifest))
  const failures = []
  const warnings = []

  if (manifest.schemaVersion !== 1) {
    failures.push('release manifest schemaVersion 必须为 1')
  }

  if (!/^wiki-v\d+\.\d+\.\d+$/.test(manifest.release?.candidateTag ?? '')) {
    failures.push('候选标签必须采用 wiki-v<major>.<minor>.<patch> 格式')
  }

  if (!['candidate', 'tagged'].includes(manifest.release?.state)) {
    failures.push('发布状态必须为 candidate 或 tagged')
  }

  const artifactRoot = resolveFrom(rootDir, manifest.artifact?.root ?? '')
  const currentArtifact = await buildFileInventory(artifactRoot)
  failures.push(...compareInventories(manifest.artifact, currentArtifact))

  if (
    (await sha256File(resolveFrom(rootDir, manifest.changelog.path))) !==
    manifest.changelog.sha256
  ) {
    failures.push('版本日志哈希与发布清单不一致')
  }

  const allowedExcludedContentReportPaths = new Set([
    'content/reports/stage5-release-readiness.json',
  ])
  const reportPolicy = manifest.contentStatusReportPolicy ?? {}
  const excludedContentReportPaths = [
    ...new Set(reportPolicy.excludedPaths ?? []),
  ].sort((left, right) => left.localeCompare(right, 'en'))
  const unsupportedExclusions = excludedContentReportPaths.filter(
    (reportPath) => !allowedExcludedContentReportPaths.has(reportPath),
  )

  if (
    !excludedContentReportPaths.includes(
      'content/reports/stage5-release-readiness.json',
    )
  ) {
    failures.push('发布清单必须显式排除 Stage5 聚合报告，避免循环哈希')
  }

  if (reportPolicy.root !== 'content/reports') {
    failures.push('内容状态报告根目录必须为 content/reports')
  }

  if (unsupportedExclusions.length > 0) {
    failures.push(
      `发布清单不得排除原始质量报告：${unsupportedExclusions.join(', ')}`,
    )
  }

  const reportsRoot = resolveFrom(rootDir, reportPolicy.root ?? '')
  const currentReportPaths = []

  for (const filePath of await listFiles(reportsRoot)) {
    if (path.extname(filePath) !== '.json') {
      continue
    }

    const reportPath = relativeFrom(rootDir, filePath)

    if (!excludedContentReportPaths.includes(reportPath)) {
      currentReportPaths.push(reportPath)
    }
  }

  currentReportPaths.sort((left, right) => left.localeCompare(right, 'en'))
  const manifestReportPaths = (manifest.contentStatusReports ?? [])
    .map((report) => report.path)
    .sort((left, right) => left.localeCompare(right, 'en'))

  if (new Set(manifestReportPaths).size !== manifestReportPaths.length) {
    failures.push('发布清单中的内容状态报告路径不得重复')
  }

  for (const reportPath of currentReportPaths) {
    if (!manifestReportPaths.includes(reportPath)) {
      failures.push(`发布清单漏记原始质量报告：${reportPath}`)
    }
  }

  for (const reportPath of manifestReportPaths) {
    if (!currentReportPaths.includes(reportPath)) {
      failures.push(`发布清单记录了不存在或已排除的质量报告：${reportPath}`)
    }
  }

  for (const report of manifest.contentStatusReports ?? []) {
    const currentHash = await sha256File(resolveFrom(rootDir, report.path))

    if (currentHash !== report.sha256) {
      failures.push(`内容状态报告已变化：${report.path}`)
    }

    if (typeof report.failureCount === 'number' && report.failureCount > 0) {
      failures.push(`内容状态报告存在失败项：${report.path}`)
    }
  }

  const git = readGitState(rootDir, manifest.release.candidateTag, {
    ignoredGeneratedPaths: manifest.repository.ignoredGeneratedPaths,
  })

  if (git.head !== manifest.repository.head) {
    failures.push('当前 HEAD 与发布清单记录的提交不一致')
  }

  if (
    git.releaseWorkspaceState !== manifest.repository.releaseWorkspaceState ||
    git.releaseRelevantDirtyEntryCount !==
      manifest.repository.releaseRelevantDirtyEntryCount
  ) {
    warnings.push('发布相关工作树状态在清单生成后发生变化；正式发布前必须重新生成清单')
  }

  if (manifest.release.state === 'tagged') {
    if (git.releaseWorkspaceState !== 'COMMIT') {
      failures.push('tagged 发布必须来自没有源代码或内容变更的工作树')
    }

    if (!git.tag.present || !git.tag.matchesHead) {
      failures.push('tagged 发布的标签必须存在并指向当前 HEAD')
    }
  }

  if (options.requireTagged && manifest.release.state !== 'tagged') {
    failures.push('当前门禁要求 tagged 发布，但清单仍是 candidate')
  }

  console.log(
    JSON.stringify(
      {
        manifest: options.manifest,
        releaseState: manifest.release.state,
        workspaceState: git.workspaceState,
        tag: git.tag,
        artifactFiles: currentArtifact.fileCount,
        aggregateSha256: currentArtifact.aggregateSha256,
        warnings,
        failures,
      },
      null,
      2,
    ),
  )

  if (failures.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(`[release-validation] ${error.message}`)
  process.exitCode = 1
})

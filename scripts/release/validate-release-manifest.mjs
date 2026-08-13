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
import { deployedReleaseTag } from './deployment-release-policy.mjs'
import { parseReleaseValidationArguments } from './release-validation-arguments.mjs'
import path from 'node:path'

const rootDir = process.cwd()

async function main() {
  const options = parseReleaseValidationArguments(process.argv.slice(2))
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

  if (
    !['not-verified', 'verified'].includes(manifest.release?.deploymentState)
  ) {
    failures.push('部署状态必须为 not-verified 或 verified')
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

  const architectureReportPath =
    'content/reports/architecture-invariants.json'
  if (!manifestReportPaths.includes(architectureReportPath)) {
    failures.push('发布清单缺少最终架构不变量报告')
  } else {
    const architectureReport = await loadJson(
      resolveFrom(rootDir, architectureReportPath),
    )
    if (
      architectureReport.passed !== true ||
      architectureReport.summary?.invariants !==
        architectureReport.summary?.passedInvariants ||
      (architectureReport.failures ?? []).length > 0
    ) {
      failures.push('最终架构不变量报告未全部通过')
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

  if (manifest.release.deploymentState === 'verified') {
    const evidence = manifest.deploymentEvidence

    if (!evidence?.path || !evidence?.sha256) {
      failures.push('verified 部署缺少部署证据路径或 SHA-256')
    } else {
      const deploymentReportPath = resolveFrom(rootDir, evidence.path)
      const deploymentReport = await loadJson(deploymentReportPath)
      const deploymentReportHash = await sha256File(deploymentReportPath)

      if (deploymentReportHash !== evidence.sha256) {
        failures.push('部署证据报告 SHA-256 与发布清单不一致')
      }
      if (deploymentReport.status !== 'verified') {
        failures.push('部署证据报告状态不是 verified')
      }
      if (
        deploymentReport.deployment?.commit !== manifest.repository.head ||
        evidence.deployedCommit !== manifest.repository.head
      ) {
        failures.push('部署证据提交与发布清单 HEAD 不一致')
      }
      if (
        deploymentReport.deployment?.releaseState !== manifest.release.state ||
        deploymentReport.deployment?.candidateTag !==
          manifest.release.candidateTag
      ) {
        failures.push('部署证据发布状态或候选标签与发布清单不一致')
      }
      const expectedDeployedTag = deployedReleaseTag(manifest)
      if (deploymentReport.deployment?.tag !== expectedDeployedTag) {
        failures.push('部署证据实际标签与发布清单状态不一致')
      }
      if (
        deploymentReport.artifact?.aggregateSha256 !==
        manifest.artifact.aggregateSha256
      ) {
        failures.push('部署证据产物聚合哈希与发布清单不一致')
      }
      if (
        deploymentReport.failures?.length > 0 ||
        deploymentReport.artifact?.criticalFilesExpected !==
          deploymentReport.artifact?.criticalFilesVerified
      ) {
        failures.push('部署证据仍有失败项或关键产物未全部验证')
      }
    }
  } else if (manifest.deploymentEvidence) {
    failures.push('not-verified 部署不得保留 verified 部署证据')
  }

  if (
    options.requireDeployed &&
    manifest.release.deploymentState !== 'verified'
  ) {
    failures.push('当前门禁要求 verified 部署，但清单尚未完成线上验证')
  }

  console.log(
    JSON.stringify(
      {
        manifest: options.manifest,
        releaseState: manifest.release.state,
        workspaceState: git.workspaceState,
        tag: git.tag,
        deploymentState: manifest.release.deploymentState,
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

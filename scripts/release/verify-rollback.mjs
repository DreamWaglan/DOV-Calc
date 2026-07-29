import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import {
  buildFileInventory,
  compareInventories,
  loadJson,
  relativeFrom,
  resolveFrom,
} from './release-utils.mjs'

const rootDir = process.cwd()

function parseArguments(argv) {
  const result = {
    manifest: 'content/release/release-manifest.json',
    report: 'content/release/rollback-rehearsal.json',
    keepTemp: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === '--keep-temp') {
      result.keepTemp = true
      continue
    }

    if (argument === '--manifest' || argument === '--report') {
      const value = argv[index + 1]

      if (!value || value.startsWith('--')) {
        throw new Error(`参数 ${argument} 缺少取值`)
      }

      result[argument.slice(2)] = value
      index += 1
      continue
    }

    throw new Error(`不支持的参数：${argument}`)
  }

  return result
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const manifestPath = resolveFrom(rootDir, options.manifest)
  const manifest = await loadJson(manifestPath)
  const distDir = resolveFrom(rootDir, manifest.artifact.root)
  const reportPath = resolveFrom(rootDir, options.report)
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'dov-wiki-rollback-'))
  const archiveDir = path.join(tempRoot, 'release-archive')
  const restoredDir = path.join(tempRoot, 'restored-site')
  let failures = []

  try {
    const currentInventory = await buildFileInventory(distDir)
    failures.push(...compareInventories(manifest.artifact, currentInventory))

    await cp(distDir, archiveDir, {
      recursive: true,
      force: false,
      errorOnExist: true,
      preserveTimestamps: true,
    })
    const archiveInventory = await buildFileInventory(archiveDir)
    failures.push(
      ...compareInventories(manifest.artifact, archiveInventory).map(
        (failure) => `归档副本：${failure}`,
      ),
    )

    await cp(archiveDir, restoredDir, {
      recursive: true,
      force: false,
      errorOnExist: true,
      preserveTimestamps: true,
    })
    const restoredInventory = await buildFileInventory(restoredDir)
    failures.push(
      ...compareInventories(manifest.artifact, restoredInventory).map(
        (failure) => `恢复副本：${failure}`,
      ),
    )

    const report = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      status: failures.length === 0 ? 'passed' : 'failed',
      manifest: relativeFrom(rootDir, manifestPath),
      candidateTag: manifest.release.candidateTag,
      candidateCommit: manifest.repository.head,
      method: 'temporary-directory-copy-and-full-sha256-verification',
      sourceOrDistMutated: false,
      workspaceWrites: [relativeFrom(rootDir, reportPath)],
      tempDirectoryRetained: options.keepTemp,
      artifactFiles: restoredInventory.fileCount,
      artifactBytes: restoredInventory.totalBytes,
      aggregateSha256: restoredInventory.aggregateSha256,
      checks: [
        'current-dist-matches-release-manifest',
        'archive-copy-matches-release-manifest',
        'restored-copy-matches-release-manifest',
      ],
      failures,
    }

    await mkdir(path.dirname(reportPath), { recursive: true })
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    console.log(JSON.stringify(report, null, 2))

    if (failures.length > 0) {
      process.exitCode = 1
    }
  } finally {
    if (!options.keepTemp) {
      await rm(tempRoot, { recursive: true, force: true })
    } else {
      console.log(`保留演练目录：${tempRoot}`)
    }
  }
}

main().catch((error) => {
  console.error(`[rollback-rehearsal] ${error.message}`)
  process.exitCode = 1
})

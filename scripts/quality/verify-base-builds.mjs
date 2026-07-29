import { spawn } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import {
  printResult,
  root,
  writeReport,
} from '../content/lib/content-utils.mjs'

const vitepressCli = path.join(
  root,
  'node_modules',
  'vitepress',
  'bin',
  'vitepress.js',
)
const failures = []
const builds = []
const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'dov-wiki-base-builds-'))

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(entryPath)))
    if (entry.isFile()) files.push(entryPath)
  }
  return files
}

function runBuild(base, outDir) {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [vitepressCli, 'build', 'docs', '--outDir', outDir],
      {
        cwd: root,
        env: {
          ...process.env,
          DOCS_BASE: base,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      },
    )
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      output += chunk.toString()
    })
    child.on('close', (status) => resolve({ status, output }))
  })
}

try {
  for (const buildCase of [
    { name: 'root', base: '/' },
    { name: 'github-project', base: '/DOV-Calc/' },
  ]) {
    const outDir = path.join(tempRoot, buildCase.name)
    const result = await runBuild(buildCase.base, outDir)
    if (result.status !== 0) {
      failures.push(
        `${buildCase.name}: VitePress exited with ${result.status ?? 'unknown'}`,
      )
      builds.push({
        ...buildCase,
        status: result.status,
        passed: false,
        output: result.output.trim().split(/\r?\n/).slice(-20),
      })
      continue
    }

    const files = await listFiles(outDir)
    const relativeFiles = files.map((file) =>
      path.relative(outDir, file).split(path.sep).join('/'),
    )
    const requiredFiles = [
      'index.html',
      'start/game-introduction.html',
      'tools/dov-basic.html',
      'tools/equipment-lookup.html',
      'sitemap.xml',
    ]
    const missingFiles = requiredFiles.filter(
      (file) => !relativeFiles.includes(file),
    )
    const indexHtml = await readFile(path.join(outDir, 'index.html'), 'utf8')
    const expectedAssetPrefix =
      buildCase.base === '/' ? '/assets/' : '/DOV-Calc/assets/'
    const assetPrefixPresent = indexHtml.includes(expectedAssetPrefix)
    const unexpectedProjectPrefix =
      buildCase.base === '/' && indexHtml.includes('/DOV-Calc/assets/')

    if (missingFiles.length) {
      failures.push(
        `${buildCase.name}: missing ${missingFiles.join(', ')}`,
      )
    }
    if (!assetPrefixPresent) {
      failures.push(
        `${buildCase.name}: home page does not use ${expectedAssetPrefix}`,
      )
    }
    if (unexpectedProjectPrefix) {
      failures.push(`${buildCase.name}: root build leaked project base`)
    }

    builds.push({
      ...buildCase,
      status: result.status,
      outputDirectory: path
        .relative(tempRoot, outDir)
        .split(path.sep)
        .join('/'),
      fileCount: files.length,
      htmlCount: relativeFiles.filter((file) => file.endsWith('.html')).length,
      requiredFiles,
      missingFiles,
      expectedAssetPrefix,
      assetPrefixPresent,
      unexpectedProjectPrefix,
      passed:
        missingFiles.length === 0 &&
        assetPrefixPresent &&
        !unexpectedProjectPrefix,
      output: result.output.trim().split(/\r?\n/).slice(-20),
    })
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}

const reportPath = await writeReport('base-builds', {
  schemaVersion: 1,
  check: 'root-and-project-base-builds',
  generatedAt: new Date().toISOString(),
  temporaryBuildsRemoved: true,
  summary: {
    buildCases: builds.length,
    passedBuildCases: builds.filter((build) => build.passed).length,
    failures: failures.length,
  },
  builds,
  failures,
})

printResult('Root/project-base builds', failures, reportPath)

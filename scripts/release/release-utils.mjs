import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

export function toPosixPath(value) {
  return value.split(path.sep).join('/')
}

export function resolveFrom(rootDir, value) {
  return path.resolve(rootDir, value)
}

export function relativeFrom(rootDir, value) {
  return toPosixPath(path.relative(rootDir, value))
}

export function sha256Buffer(value) {
  return createHash('sha256').update(value).digest('hex')
}

export async function sha256File(filePath) {
  return sha256Buffer(await readFile(filePath))
}

export async function listFiles(rootDir) {
  const files = []

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'))

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        await visit(entryPath)
      } else if (entry.isFile()) {
        files.push(entryPath)
      }
    }
  }

  await visit(rootDir)
  return files
}

export async function buildFileInventory(rootDir) {
  const files = []

  for (const filePath of await listFiles(rootDir)) {
    const fileStat = await stat(filePath)
    files.push({
      path: relativeFrom(rootDir, filePath),
      bytes: fileStat.size,
      sha256: await sha256File(filePath),
    })
  }

  const canonicalInventory = files
    .map((file) => `${file.sha256}  ${file.path}\n`)
    .join('')

  return {
    fileCount: files.length,
    totalBytes: files.reduce((total, file) => total + file.bytes, 0),
    aggregateSha256: sha256Buffer(canonicalInventory),
    files,
  }
}

export function runGit(rootDir, args, { allowFailure = false } = {}) {
  try {
    return execFileSync('git', args, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', allowFailure ? 'ignore' : 'pipe'],
    }).trim()
  } catch (error) {
    if (allowFailure) {
      return ''
    }

    throw error
  }
}

export function readGitState(
  rootDir,
  candidateTag,
  { ignoredGeneratedPaths = [] } = {},
) {
  const head = runGit(rootDir, ['rev-parse', 'HEAD'])
  const subject = runGit(rootDir, ['show', '-s', '--format=%s', 'HEAD'])
  const statusOutput = execFileSync(
    'git',
    ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
    {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  const entries = []
  const tokens = statusOutput.split('\0').filter(Boolean)

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    const code = token.slice(0, 2)
    const entry = {
      code,
      path: toPosixPath(token.slice(3)),
    }

    if (/[RC]/.test(code) && tokens[index + 1]) {
      entry.originalPath = toPosixPath(tokens[index + 1])
      index += 1
    }

    entries.push(entry)
  }

  const tagCommit = runGit(
    rootDir,
    ['rev-list', '-n', '1', candidateTag],
    { allowFailure: true },
  )
  const tagPresent = Boolean(tagCommit)
  const clean = entries.length === 0
  const normalizedIgnoredPaths = [
    ...new Set(ignoredGeneratedPaths.map(toPosixPath)),
  ].sort((left, right) => left.localeCompare(right, 'en'))
  const matchesIgnoredPath = (entryPath) =>
    normalizedIgnoredPaths.some((ignoredPath) =>
      ignoredPath.endsWith('/')
        ? entryPath.startsWith(ignoredPath)
        : entryPath === ignoredPath,
    )
  const isIgnoredGeneratedEntry = (entry) =>
    matchesIgnoredPath(entry.path) &&
    (!entry.originalPath || matchesIgnoredPath(entry.originalPath))
  const ignoredDirtyEntries = entries.filter(isIgnoredGeneratedEntry)
  const releaseRelevantEntries = entries.filter(
    (entry) => !isIgnoredGeneratedEntry(entry),
  )

  return {
    head,
    subject,
    workspaceState: clean ? 'COMMIT' : 'WORKTREE',
    dirtyEntryCount: entries.length,
    dirtyEntries: entries,
    releaseWorkspaceState:
      releaseRelevantEntries.length === 0 ? 'COMMIT' : 'WORKTREE',
    releaseRelevantDirtyEntryCount: releaseRelevantEntries.length,
    releaseRelevantDirtyEntries: releaseRelevantEntries,
    ignoredGeneratedPaths: normalizedIgnoredPaths,
    ignoredDirtyEntries,
    tag: {
      name: candidateTag,
      present: tagPresent,
      commit: tagCommit || null,
      matchesHead: tagPresent && tagCommit === head,
    },
  }
}

export function compareInventories(expected, actual) {
  const failures = []
  const expectedByPath = new Map(expected.files.map((file) => [file.path, file]))
  const actualByPath = new Map(actual.files.map((file) => [file.path, file]))

  for (const [filePath, expectedFile] of expectedByPath) {
    const actualFile = actualByPath.get(filePath)

    if (!actualFile) {
      failures.push(`缺少产物文件：${filePath}`)
      continue
    }

    if (actualFile.bytes !== expectedFile.bytes) {
      failures.push(
        `产物大小不一致：${filePath}（期望 ${expectedFile.bytes}，实际 ${actualFile.bytes}）`,
      )
    }

    if (actualFile.sha256 !== expectedFile.sha256) {
      failures.push(`产物哈希不一致：${filePath}`)
    }
  }

  for (const filePath of actualByPath.keys()) {
    if (!expectedByPath.has(filePath)) {
      failures.push(`出现清单外产物：${filePath}`)
    }
  }

  if (actual.aggregateSha256 !== expected.aggregateSha256) {
    failures.push('产物聚合哈希不一致')
  }

  return failures
}

export async function loadJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

export function primitiveSummary(value) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => ['string', 'number', 'boolean'].includes(typeof item))
      .sort(([left], [right]) => left.localeCompare(right, 'en')),
  )
}

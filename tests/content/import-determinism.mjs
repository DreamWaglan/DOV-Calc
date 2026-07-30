import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const targets = [
  'content/imports/docx',
  'content/imports/xlsx',
  'content/imports/images/source-ledger',
  'content/migration/stage3-docx-map.json',
  'content/migration/stage4-docx-map.json',
  'content/migrations/full-content-map.json',
  'content/reports/docx-import.json',
  'content/reports/xlsx-import.json',
  'content/reports/media-import.json',
]

async function filesUnder(target) {
  const metadata = await stat(target)
  if (metadata.isFile()) return [target]
  const entries = await readdir(target, { withFileTypes: true })
  const nested = []
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name, 'en'),
  )) {
    const child = path.join(target, entry.name)
    if (entry.isDirectory()) nested.push(...(await filesUnder(child)))
    if (entry.isFile()) nested.push(child)
  }
  return nested
}

async function fingerprint() {
  const entries = []
  for (const target of targets) {
    for (const file of await filesUnder(target)) {
      const data = await readFile(file)
      entries.push(
        `${file.split(path.sep).join('/')}:${createHash('sha256').update(data).digest('hex')}`,
      )
    }
  }
  return entries.join('\n')
}

function run(script) {
  const result = spawnSync(process.execPath, [script], {
    cwd: process.cwd(),
    env: process.env,
    encoding: 'utf8',
    windowsHide: true,
  })
  assert.equal(
    result.status,
    0,
    `${script} failed:\n${result.stdout}\n${result.stderr}`,
  )
}

const before = await fingerprint()
run('scripts/content/import-source-corpus.mjs')
run('scripts/content/build-stage3-docx-map.mjs')
run('scripts/content/build-stage4-docx-map.mjs')
run('scripts/content/build-full-content-map.mjs')
const after = await fingerprint()

assert.equal(after, before, 'full source import and migration map must be byte-stable')
console.log('full corpus import determinism tests passed.')

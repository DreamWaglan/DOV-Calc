import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildBasicAttackDataset } from '../../scripts/content/build-basic-attack-dataset.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

async function outputHashes(outputs) {
  const paths = [outputs.data, outputs.overview, outputs.tool, ...outputs.worksheets]
  return Object.fromEntries(
    await Promise.all(
      paths.map(async (relativePath) => [
        relativePath,
        sha256(await readFile(path.join(root, relativePath))),
      ]),
    ),
  )
}

const first = await buildBasicAttackDataset()
const firstHashes = await outputHashes(first.report.outputs)
const second = await buildBasicAttackDataset()
const secondHashes = await outputHashes(second.report.outputs)

assert.deepEqual(secondHashes, firstHashes, 'generated outputs must be byte-stable')
assert.equal(second.dataset.metadata.worksheetCount, 7)
assert.equal(second.dataset.metadata.recordCount, 225)
assert.equal(second.dataset.records.length, 225)
assert.equal(new Set(second.dataset.records.map((record) => record.id)).size, 225)
assert.equal(
  new Set(second.dataset.records.map((record) => record.sourceElementId)).size,
  225,
)
assert.ok(
  second.dataset.records.every(
    (record) =>
      record.status === 'current' && record.disposition === 'published',
  ),
)
assert.equal(second.dataset.publicRelease.asset, false)
assert.equal(second.dataset.publicRelease.download, false)
assert.equal(second.dataset.publicRelease.structuredData, true)

console.log('basic-attack canonical dataset tests passed.')

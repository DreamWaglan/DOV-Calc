import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const map = JSON.parse(
  await readFile('content/migrations/full-content-map.json', 'utf8'),
)

assert.equal(map.assets.length, 29)
assert.deepEqual(map.summary.sourceAssetsByType, {
  docx: 13,
  xlsx: 1,
  image: 15,
})
assert.deepEqual(map.summary.contentDocxTotals, {
  paragraphs: 2890,
  headings: 399,
  tables: 165,
  drawings: 977,
  media: 585,
  formulas: 24,
})
assert.equal(map.drawingRelations.length >= 977, true)
assert.equal(map.dataRecords.length, 225)
assert.equal(
  map.elements.filter((element) => element.elementType === 'worksheet').length,
  7,
)

const allElementIds = [
  ...map.elements.map((element) => element.sourceElementId),
  ...map.dataRecords.map((record) => record.sourceElementId),
]
assert.equal(new Set(allElementIds).size, allElementIds.length)
assert.equal(
  map.elements.filter((element) => !element.disposition).length,
  0,
)
assert.equal(
  map.elements.filter(
    (element) =>
      element.disposition === 'omitted-with-rationale' &&
      !element.reason?.trim(),
  ).length,
  0,
)

console.log('full content map tests passed.')

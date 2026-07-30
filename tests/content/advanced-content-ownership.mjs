import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const advanced = JSON.parse(
  await readFile(
    new URL('../../content/migrations/advanced-content-pages.json', import.meta.url),
    'utf8',
  ),
)
const fullMap = JSON.parse(
  await readFile(
    new URL('../../content/migrations/full-content-map.json', import.meta.url),
    'utf8',
  ),
)
const advancedIds = new Set(
  advanced.sources.map((source) => source.sourceAssetId),
)
const pageBySource = new Map(
  advanced.sources.map((source) => [source.sourceAssetId, source.pages]),
)

function ownersForBodyIndex(pages, bodyIndex) {
  return pages.filter(
    (page) =>
      bodyIndex >= page.sourceElementRange.bodyIndexStart &&
      bodyIndex < page.sourceElementRange.bodyIndexEndExclusive,
  )
}

for (const source of advanced.sources) {
  const pages = [...source.pages].sort(
    (left, right) =>
      left.sourceElementRange.bodyIndexStart -
      right.sourceElementRange.bodyIndexStart,
  )
  for (let index = 1; index < pages.length; index += 1) {
    assert.equal(
      pages[index - 1].sourceElementRange.bodyIndexEndExclusive,
      pages[index].sourceElementRange.bodyIndexStart,
      `${source.sourceAssetId}: body ranges must be contiguous`,
    )
    assert.equal(
      pages[index - 1].sourceElementRange.tableIndexEndExclusive,
      pages[index].sourceElementRange.tableIndexStart,
      `${source.sourceAssetId}: table ranges must be contiguous`,
    )
  }
}

for (const entry of [
  ...fullMap.elements,
  ...fullMap.drawingRelations,
].filter((candidate) => advancedIds.has(candidate.sourceAssetId))) {
  const bodyIndex = entry.sourcePosition?.bodyIndex
  if (!Number.isInteger(bodyIndex)) continue
  const owners = ownersForBodyIndex(
    pageBySource.get(entry.sourceAssetId),
    bodyIndex,
  )
  assert.equal(
    owners.length,
    1,
    `${entry.sourceElementId ?? entry.sourceRelationId}: must have one body owner`,
  )
  assert.deepEqual(
    entry.targetPageIds,
    [owners[0].pageId],
    `${entry.sourceElementId ?? entry.sourceRelationId}: target must match body owner`,
  )
}

for (const table of fullMap.elements.filter(
  (element) =>
    advancedIds.has(element.sourceAssetId) && element.elementType === 'table',
)) {
  const pages = pageBySource.get(table.sourceAssetId)
  const owners = pages.filter(
    (page) =>
      table.sourcePosition.tableIndex >=
        page.sourceElementRange.tableIndexStart &&
      table.sourcePosition.tableIndex <
        page.sourceElementRange.tableIndexEndExclusive,
  )
  assert.equal(owners.length, 1, `${table.sourceElementId}: one table owner`)
  assert.deepEqual(table.targetPageIds, [owners[0].pageId])
}

console.log('Advanced content page ownership contracts passed.')

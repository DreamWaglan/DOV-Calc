import assert from 'node:assert/strict'
import {
  dispositionErrors,
  stableSourceElementId,
  stableSourceRelationId,
} from '../../scripts/content/lib/migration-elements.mjs'

const left = stableSourceElementId('src-0c5b7db892f6', 'worksheet', {
  worksheet: '驱逐',
  row: 2,
})
const right = stableSourceElementId('src-0c5b7db892f6', 'worksheet', {
  row: 2,
  worksheet: '驱逐',
})
assert.equal(left, right, 'source element IDs must ignore object key order')
assert.match(left, /^src-[a-f0-9]{12}:worksheet:[a-f0-9]{16}$/)
assert.notEqual(
  left,
  stableSourceElementId('src-0c5b7db892f6', 'worksheet', {
    worksheet: '驱逐',
    row: 3,
  }),
)

const relation = stableSourceRelationId('src-0c5b7db892f6', 'drawing', {
  part: 'word/document.xml',
  drawingIndex: 1,
})
assert.match(relation, /^src-[a-f0-9]{12}:relation:[a-f0-9]{16}$/)

for (const disposition of [
  'published',
  'merged',
  'internal-only',
  'omitted-with-rationale',
]) {
  assert.deepEqual(
    dispositionErrors({
      disposition,
      ...(disposition === 'omitted-with-rationale'
        ? { reason: 'Duplicate decorative wrapper.' }
        : {}),
    }),
    [],
  )
}
assert.ok(
  dispositionErrors({ disposition: 'omitted-with-rationale', reason: '' }).some(
    (error) => error.includes('non-empty reason'),
  ),
)
assert.ok(
  dispositionErrors({ disposition: 'unmapped' }).some((error) =>
    error.includes('invalid disposition'),
  ),
)

console.log('migration element tests passed.')

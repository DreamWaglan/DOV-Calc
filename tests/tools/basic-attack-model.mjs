import assert from 'node:assert/strict'
import basicAttackData from '../../docs/.vitepress/data/basic-attack-data.json' with { type: 'json' }
import {
  PAGE_SIZE,
  applyBasicAttackQuery,
  paginate,
  resetBasicAttackState,
} from '../../docs/.vitepress/components/basicAttackExplorerModel.js'

const records = basicAttackData.records
assert.equal(records.length, 225)

const initialState = resetBasicAttackState()
const initial = applyBasicAttackQuery(records, initialState)
assert.equal(initial.length, 225)
assert.deepEqual(
  initial.map((record) => record.id),
  records.map((record) => record.id).sort((left, right) =>
    records
      .find((record) => record.id === left)
      .name.localeCompare(records.find((record) => record.id === right).name, 'zh-CN', {
        numeric: true,
        sensitivity: 'base',
      }),
  ),
)

const worksheet = applyBasicAttackQuery(records, {
  ...initialState,
  worksheet: basicAttackData.worksheets[0].name,
})
assert.equal(worksheet.length, basicAttackData.worksheets[0].recordCount)
assert.ok(worksheet.every((record) => record.category === basicAttackData.worksheets[0].name))

const sampled = records.find((record) => record.values.gunDamageType)
assert.ok(sampled)
const byName = applyBasicAttackQuery(records, {
  ...initialState,
  query: sampled.name,
})
assert.ok(byName.some((record) => record.id === sampled.id))

const byDamageType = applyBasicAttackQuery(records, {
  ...initialState,
  query: sampled.values.gunDamageType,
})
assert.ok(byDamageType.length > 0)
assert.ok(byDamageType.some((record) => record.id === sampled.id))

const ascending = applyBasicAttackQuery(records, {
  ...initialState,
  sortKey: 'gunCdSeconds',
  sortDirection: 'asc',
})
const descending = applyBasicAttackQuery(records, {
  ...initialState,
  sortKey: 'gunCdSeconds',
  sortDirection: 'desc',
})
assert.notDeepEqual(
  ascending.slice(0, 10).map((record) => record.id),
  descending.slice(0, 10).map((record) => record.id),
)

const ties = records
  .map((record, index) => ({ record, index }))
  .filter(({ record }) => record.values.gunCdSeconds === ascending[0].values.gunCdSeconds)
const tieIds = new Set(ties.map(({ record }) => record.id))
const sortedTies = ascending.filter((record) => tieIds.has(record.id))
assert.deepEqual(
  sortedTies.map((record) => record.id),
  ties.map(({ record }) => record.id),
  'equal sort keys must retain source order',
)

const page = paginate(records, 2, PAGE_SIZE)
assert.equal(page.page, 2)
assert.equal(page.pageSize, 50)
assert.equal(page.records.length, 50)
assert.equal(page.pageCount, 5)

assert.deepEqual(resetBasicAttackState(), {
  query: '',
  worksheet: 'all',
  sortKey: 'name',
  sortDirection: 'asc',
  page: 1,
})

const before = JSON.stringify(records)
applyBasicAttackQuery(records, {
  query: sampled.name,
  worksheet: sampled.category,
  sortKey: 'gunCdSeconds',
  sortDirection: 'desc',
})
assert.equal(JSON.stringify(records), before, 'query model must not mutate canonical records')

console.log('basic-attack explorer model tests passed.')

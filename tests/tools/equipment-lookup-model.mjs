import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  buildEquipmentStatus,
  filterEquipmentItems,
  getEquipmentChannels,
  hasActiveEquipmentFilters,
} from '../../docs/.vitepress/components/equipmentLookupModel.js'

const data = JSON.parse(
  await readFile(new URL('../../docs/.vitepress/data/equipment-data.json', import.meta.url), 'utf8'),
)
const baseline = JSON.parse(
  await readFile(new URL('../fixtures/equipment-baseline.json', import.meta.url), 'utf8'),
)

assert.equal(data.metadata.version, baseline.metadata.version)
assert.equal(data.metadata.itemCount, baseline.metadata.itemCount)
assert.equal(data.items.length, baseline.itemCount)
assert.deepEqual(data.items.map((item) => item.id), Array.from({ length: baseline.itemCount }, (_, index) => index + 1))

const channels = getEquipmentChannels(data.items)
assert(channels.length > 0)
assert.equal(new Set(channels).size, channels.length)

const emptyFilters = { query: '', category: '', channel: '' }
const allItems = filterEquipmentItems(data.items, emptyFilters)
assert.equal(allItems.length, baseline.itemCount)
assert.equal(hasActiveEquipmentFilters(emptyFilters), false)
assert.deepEqual(buildEquipmentStatus(data.metadata, allItems.length, emptyFilters), {
  version: baseline.metadata.version,
  total: baseline.itemCount,
  filtered: baseline.itemCount,
  mode: '完整数据',
})

const firstItem = data.items[0]
const filtered = filterEquipmentItems(data.items, {
  query: firstItem.alias,
  category: firstItem.category,
  channel: firstItem.channels[0].type,
})
assert(filtered.some((item) => item.id === firstItem.id))
assert.equal(hasActiveEquipmentFilters({ query: firstItem.alias, category: '', channel: '' }), true)
assert.equal(buildEquipmentStatus(data.metadata, filtered.length, { query: firstItem.alias, category: '', channel: '' }).mode, '筛选结果')

console.log('Equipment lookup model contracts passed.')

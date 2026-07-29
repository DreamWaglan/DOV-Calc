export function getEquipmentChannels(items) {
  const values = new Set()
  items.forEach((item) => {
    item.channels.forEach((channel) => values.add(channel.type))
  })
  return Array.from(values)
}

export function filterEquipmentItems(items, filters) {
  const keyword = filters.query.toLowerCase()

  return items.filter((item) => {
    const matchesCategory = !filters.category || item.category === filters.category
    const matchesChannel = !filters.channel || item.channels.some((channel) => channel.type === filters.channel)
    const haystack = [
      item.name,
      item.alias,
      item.category,
      item.remark,
      item.obtain,
    ].join(' ').toLowerCase()
    const matchesQuery = !keyword || haystack.includes(keyword)

    return matchesCategory && matchesChannel && matchesQuery
  })
}

export function hasActiveEquipmentFilters(filters) {
  return Boolean(filters.query || filters.category || filters.channel)
}

export function buildEquipmentStatus(metadata, filteredCount, filters) {
  return {
    version: metadata.version,
    total: metadata.itemCount,
    filtered: filteredCount,
    mode: hasActiveEquipmentFilters(filters) ? '筛选结果' : '完整数据',
  }
}

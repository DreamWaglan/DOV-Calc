export const DEFAULT_SORT = Object.freeze({
  key: 'name',
  direction: 'asc',
})

export const PAGE_SIZE = 50

export const sortOptions = Object.freeze([
  { key: 'name', label: '舰灵名称' },
  { key: 'category', label: '工作表' },
  { key: 'gunMultiplier', label: '炮击倍率' },
  { key: 'gunCdSeconds', label: '炮击 CD' },
  { key: 'torpedoMultiplier', label: '雷击倍率' },
  { key: 'torpedoCdSeconds', label: '雷击 CD' },
  { key: 'mainGunMultiplier', label: '主炮倍率' },
  { key: 'mainGunCdSeconds', label: '主炮 CD' },
  { key: 'aircraftMultiplier', label: '舰载机倍率' },
  { key: 'attackMultiplier', label: '通用倍率' },
  { key: 'attackCdSeconds', label: '通用 CD' },
])

export function createInitialState() {
  return {
    query: '',
    worksheet: 'all',
    sortKey: DEFAULT_SORT.key,
    sortDirection: DEFAULT_SORT.direction,
    page: 1,
  }
}

export function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Script=Han}\p{Letter}\p{Number}.%/-]+/gu, '')
}

export function searchableText(record) {
  const values = Object.values(record.values ?? {})
    .filter((value) => value !== null && value !== undefined)
    .join(' ')
  return normalizeSearch(
    [
      record.id,
      record.name,
      record.category,
      record.applicableVersion,
      record.status,
      values,
    ].join(' '),
  )
}

export function valueForSort(record, key) {
  if (key === 'name') return record.name
  if (key === 'category') return record.category
  if (key === 'worksheetOrder') return record.worksheetOrder
  if (key === 'worksheetIndex') {
    return record.worksheetIndex ?? record.worksheetOrder
  }
  return record.values?.[key] ?? null
}

export function worksheetValue(record) {
  return String(
    record.worksheetIndex ??
      (Number.isInteger(record.worksheetOrder) ? record.worksheetOrder + 1 : ''),
  )
}

export function compareValues(left, right, direction = 'asc') {
  const multiplier = direction === 'desc' ? -1 : 1
  const leftMissing = left === null || left === undefined || left === ''
  const rightMissing = right === null || right === undefined || right === ''
  if (leftMissing && rightMissing) return 0
  if (leftMissing) return 1
  if (rightMissing) return -1
  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * multiplier
  }
  return String(left).localeCompare(String(right), 'zh-CN', {
    numeric: true,
    sensitivity: 'base',
  }) * multiplier
}

export function applyBasicAttackQuery(records, state = createInitialState()) {
  const query = normalizeSearch(state.query)
  const worksheet = String(state.worksheet ?? 'all')
  const sortKey = state.sortKey ?? DEFAULT_SORT.key
  const sortDirection = state.sortDirection === 'desc' ? 'desc' : 'asc'

  return records
    .map((record, originalIndex) => ({ record, originalIndex }))
    .filter(({ record }) => {
      const worksheetMatches =
        worksheet === 'all' ||
        worksheetValue(record) === worksheet ||
        record.worksheet === worksheet ||
        record.category === worksheet
      const queryMatches = !query || searchableText(record).includes(query)
      return worksheetMatches && queryMatches
    })
    .sort((left, right) => {
      const compared = compareValues(
        valueForSort(left.record, sortKey),
        valueForSort(right.record, sortKey),
        sortDirection,
      )
      return compared || left.originalIndex - right.originalIndex
    })
    .map(({ record }) => record)
}

export function paginate(records, page = 1, pageSize = PAGE_SIZE) {
  const safePageSize = Math.max(1, Number(pageSize) || PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(records.length / safePageSize))
  const currentPage = Math.min(Math.max(1, Number(page) || 1), pageCount)
  const start = (currentPage - 1) * safePageSize
  return {
    page: currentPage,
    pageSize: safePageSize,
    pageCount,
    total: records.length,
    records: records.slice(start, start + safePageSize),
  }
}

export function resetBasicAttackState() {
  return createInitialState()
}

<script setup>
import { computed, reactive } from 'vue'
import basicAttackData from '../data/basic-attack-data.json'
import {
  PAGE_SIZE,
  applyBasicAttackQuery,
  paginate,
  resetBasicAttackState,
  sortOptions,
} from './basicAttackExplorerModel.js'

const state = reactive(resetBasicAttackState())

const worksheetOptions = computed(() => [
  { value: 'all', label: `全部工作表（${basicAttackData.metadata.recordCount}）` },
  ...basicAttackData.worksheets.map((summary) => ({
    value: summary.name,
    label: `${summary.name}（${summary.recordCount}）`,
  })),
])

const filteredRecords = computed(() =>
  applyBasicAttackQuery(basicAttackData.records, state),
)

const pageResult = computed(() => paginate(filteredRecords.value, state.page, PAGE_SIZE))

const fieldByName = computed(
  () => new Map(basicAttackData.fields.map((field) => [field.name, field])),
)

const visibleValueKeys = [
  'gunMultiplier',
  'gunCdSeconds',
  'gunRangeUnits',
  'gunDamageType',
  'torpedoMultiplier',
  'torpedoCdSeconds',
  'torpedoRangeUnits',
  'mainGunMultiplier',
  'mainGunCdSeconds',
  'secondaryGunMultiplier',
  'secondaryGunCdSeconds',
  'aircraftMultiplier',
  'aircraftCdSeconds',
  'fighterMultiplier',
  'fighterCdSeconds',
  'attackMultiplier',
  'attackCdSeconds',
  'attackDamageType',
]

function setFirstPage() {
  state.page = 1
}

function clearFilters() {
  Object.assign(state, resetBasicAttackState())
}

function toggleSortDirection() {
  state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc'
}

function formatValue(value, key) {
  if (value === null || value === undefined || value === '') return '—'
  const unit = fieldByName.value.get(key)?.unit
  return unit ? `${value} ${unit}` : value
}
</script>

<template>
  <section class="basic-attack-explorer" aria-labelledby="basic-attack-explorer-title">
    <div class="basic-attack-explorer__header">
      <div>
        <h2 id="basic-attack-explorer-title">普攻数据查询</h2>
        <p>
          共 {{ basicAttackData.metadata.recordCount }} 条记录，{{
            basicAttackData.metadata.worksheetCount
          }} 个工作表；当前显示 {{ filteredRecords.length }} 条。
        </p>
      </div>
      <p class="basic-attack-explorer__hash">
        版本 {{ basicAttackData.metadata.version }} · hash
        <code>{{ basicAttackData.integrity.recordsSha256.slice(0, 12) }}</code>
      </p>
    </div>

    <div class="basic-attack-explorer__controls" aria-label="普攻数据筛选">
      <label>
        关键词
        <input
          v-model="state.query"
          type="search"
          placeholder="搜索舰灵、伤害类型、字段值"
          aria-label="搜索普攻数据"
          @input="setFirstPage"
        />
      </label>
      <label>
        工作表
        <select v-model="state.worksheet" aria-label="工作表筛选" @change="setFirstPage">
          <option
            v-for="option in worksheetOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
      <label>
        排序字段
        <select v-model="state.sortKey" aria-label="排序字段">
          <option v-for="option in sortOptions" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </label>
      <button
        type="button"
        :aria-label="`排序方向：${state.sortDirection === 'asc' ? '升序' : '降序'}`"
        @click="toggleSortDirection"
      >
        {{ state.sortDirection === 'asc' ? '升序' : '降序' }}
      </button>
      <button type="button" class="basic-attack-explorer__reset" @click="clearFilters">
        清除
      </button>
    </div>

    <p class="basic-attack-explorer__status" aria-live="polite">
      共匹配
      <output aria-label="当前普攻结果数量">{{ filteredRecords.length }}</output>
      条；第 {{ pageResult.page }} / {{ pageResult.pageCount }} 页，本页显示
      {{ pageResult.records.length }} 条。
    </p>

    <div class="basic-attack-explorer__table" tabindex="0" aria-label="普攻数据查询结果表格">
      <table tabindex="0" aria-label="普攻数据查询结果表格">
        <thead>
          <tr>
            <th scope="col">舰灵</th>
            <th scope="col">工作表</th>
            <th
              v-for="key in visibleValueKeys"
              :key="key"
              scope="col"
            >
              {{ fieldByName.get(key)?.label ?? key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in pageResult.records" :key="record.id">
            <th scope="row">{{ record.name }}</th>
            <td>{{ record.category }}</td>
            <td v-for="key in visibleValueKeys" :key="`${record.id}-${key}`">
              {{ formatValue(record.values[key], key) }}
            </td>
          </tr>
          <tr v-if="pageResult.records.length === 0">
            <td :colspan="visibleValueKeys.length + 2">没有匹配记录。</td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav class="basic-attack-explorer__pager" aria-label="普攻数据分页">
      <button
        type="button"
        :disabled="pageResult.page <= 1"
        @click="state.page -= 1"
      >
        上一页
      </button>
      <button
        type="button"
        :disabled="pageResult.page >= pageResult.pageCount"
        @click="state.page += 1"
      >
        下一页
      </button>
    </nav>
  </section>
</template>

<style scoped>
.basic-attack-explorer {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.basic-attack-explorer__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
}

.basic-attack-explorer__header h2 {
  margin: 0;
}

.basic-attack-explorer__header p {
  margin: 0.25rem 0 0;
}

.basic-attack-explorer__hash {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.basic-attack-explorer__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem;
  align-items: end;
}

.basic-attack-explorer__controls label {
  display: grid;
  gap: 0.35rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.basic-attack-explorer__controls input,
.basic-attack-explorer__controls select,
.basic-attack-explorer__controls button,
.basic-attack-explorer__pager button {
  min-height: 44px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.basic-attack-explorer__controls button,
.basic-attack-explorer__pager button {
  cursor: pointer;
}

.basic-attack-explorer__controls button:hover,
.basic-attack-explorer__pager button:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
}

.basic-attack-explorer__pager button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.basic-attack-explorer__status {
  color: var(--vp-c-text-2);
}

.basic-attack-explorer__table {
  overflow-x: auto;
  max-width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
}

.basic-attack-explorer__table table {
  min-width: 1100px;
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.basic-attack-explorer__table th,
.basic-attack-explorer__table td {
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid var(--vp-c-divider);
  text-align: left;
  white-space: nowrap;
}

.basic-attack-explorer__table tbody tr:last-child th,
.basic-attack-explorer__table tbody tr:last-child td {
  border-bottom: 0;
}

.basic-attack-explorer__pager {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .basic-attack-explorer {
    margin-inline: -0.25rem;
    padding: 0.75rem;
  }

  .basic-attack-explorer__pager {
    justify-content: stretch;
  }

  .basic-attack-explorer__pager button {
    flex: 1;
  }
}
</style>

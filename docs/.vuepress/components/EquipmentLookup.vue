<template>
  <section class="equipment-lookup" aria-labelledby="equipment-lookup-title">
    <header class="equipment-lookup__header">
      <!-- 
      <div>
        <h2 id="equipment-lookup-title">装备速查</h2>
        <p>{{ data.metadata.sourceFile }}，共 {{ data.metadata.itemCount }} 件装备。</p>
      </div>
       -->

      <div class="equipment-lookup__stats" aria-label="装备统计">
        <span>{{ filteredItems.length }}</span>
        <small>当前结果</small>
      </div>
    </header>

    <div class="equipment-lookup__toolbar">
      <label class="equipment-lookup__search">
        <span>搜索装备、简称、备注或获取渠道</span>
        <input v-model.trim="query" type="search" placeholder="例如：305、通用毕业、SSR型装备库密钥" />
      </label>

      <label>
        <span>装备分类</span>
        <select v-model="selectedCategory">
          <option value="">全部分类</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </label>

      <label>
        <span>获取方式</span>
        <select v-model="selectedChannel">
          <option value="">全部方式</option>
          <option v-for="channel in channels" :key="channel" :value="channel">
            {{ channel }}
          </option>
        </select>
      </label>

      <button type="button" @click="resetFilters">重置</button>
    </div>

    <div class="equipment-lookup__category-strip" aria-label="分类快捷筛选">
      <button
        v-for="category in categories"
        :key="category"
        :class="{ 'is-active': selectedCategory === category }"
        type="button"
        @click="toggleCategory(category)"
      >
        {{ category }}
      </button>
    </div>

    <div v-if="filteredItems.length" class="equipment-lookup__grid">
      <article v-for="item in filteredItems" :key="item.id" class="equipment-card">
        <figure class="equipment-card__image">
          <img :src="item.image" :alt="item.name" loading="lazy" />
        </figure>

        <div class="equipment-card__body">
          <div class="equipment-card__title-row">
            <span>{{ item.category }}</span>
            <strong>{{ item.name }}</strong>
          </div>

          <p v-if="item.alias" class="equipment-card__alias">简称：{{ item.alias }}</p>
          <p v-if="item.remark" class="equipment-card__remark">{{ item.remark }}</p>

          <div class="equipment-card__channels">
            <p v-for="channel in item.channels" :key="`${item.id}-${channel.type}`">
              <span>{{ channel.type }}</span>
              {{ channel.text }}
            </p>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="equipment-lookup__empty">
      没有找到匹配的装备。
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import data from '../data/equipment-data.json'

const query = ref('')
const selectedCategory = ref('')
const selectedChannel = ref('')

const categories = computed(() => data.metadata.categories)
const channels = computed(() => {
  const values = new Set()
  data.items.forEach((item) => {
    item.channels.forEach((channel) => values.add(channel.type))
  })
  return Array.from(values)
})

const filteredItems = computed(() => {
  const keyword = query.value.toLowerCase()

  return data.items.filter((item) => {
    const matchesCategory = !selectedCategory.value || item.category === selectedCategory.value
    const matchesChannel = !selectedChannel.value || item.channels.some((channel) => channel.type === selectedChannel.value)
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
})

function resetFilters() {
  query.value = ''
  selectedCategory.value = ''
  selectedChannel.value = ''
}

function toggleCategory(category) {
  selectedCategory.value = selectedCategory.value === category ? '' : category
}
</script>

<style scoped>
.equipment-lookup {
  margin: 24px 0 40px;
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  background: var(--calc-surface);
  overflow: hidden;
}

.equipment-lookup__header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--calc-border);
}

.equipment-lookup__header h2 {
  margin: 0 0 8px;
}

.equipment-lookup__header p,
.equipment-lookup__empty {
  margin: 0;
  color: var(--calc-text-muted);
}

.equipment-lookup__eyebrow {
  margin: 0 0 8px;
  color: var(--c-brand);
  font-size: 13px;
  font-weight: 700;
}

.equipment-lookup__stats {
  display: grid;
  place-items: center;
  min-width: 104px;
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  background: var(--calc-surface-soft);
  padding: 12px;
}

.equipment-lookup__stats span {
  color: var(--c-brand);
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}

.equipment-lookup__stats small {
  color: var(--calc-text-muted);
}

.equipment-lookup__toolbar {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(150px, 220px) minmax(130px, 180px) max-content;
  gap: 12px;
  align-items: end;
  padding: 20px 24px;
  border-bottom: 1px solid var(--calc-border);
  background: var(--calc-surface-soft);
}

.equipment-lookup label {
  display: grid;
  gap: 6px;
  color: var(--calc-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.equipment-lookup input,
.equipment-lookup select {
  min-width: 0;
  height: 38px;
  border: 1px solid var(--calc-border);
  border-radius: 6px;
  background: var(--calc-surface);
  color: inherit;
  font: inherit;
  padding: 0 10px;
}

.equipment-lookup input:focus,
.equipment-lookup select:focus {
  border-color: var(--c-brand);
  outline: 2px solid color-mix(in srgb, var(--c-brand) 22%, transparent);
}

.equipment-lookup button {
  min-height: 38px;
  border: 1px solid var(--calc-border);
  border-radius: 6px;
  background: var(--calc-surface);
  color: inherit;
  cursor: pointer;
  font-weight: 700;
  padding: 0 12px;
}

.equipment-lookup__category-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 14px 24px;
  border-bottom: 1px solid var(--calc-border);
}

.equipment-lookup__category-strip button {
  flex: 0 0 auto;
  color: var(--calc-text-muted);
}

.equipment-lookup__category-strip button.is-active {
  border-color: var(--c-brand);
  background: var(--c-brand);
  color: #ffffff;
}

.equipment-lookup__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 24px;
}

.equipment-card {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  min-height: 164px;
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  background: var(--calc-surface);
  overflow: hidden;
}

.equipment-card__image {
  display: grid;
  place-items: center;
  min-height: 100%;
  margin: 0;
  border-right: 1px solid var(--calc-border);
  background: var(--calc-surface-soft);
  padding: 8px;
}

.equipment-card__image img {
  max-width: 72px;
  max-height: 120px;
  object-fit: contain;
}

.equipment-card__body {
  display: grid;
  align-content: start;
  gap: 9px;
  min-width: 0;
  padding: 14px;
}

.equipment-card__title-row {
  display: grid;
  gap: 4px;
}

.equipment-card__title-row span {
  color: var(--c-brand);
  font-size: 12px;
  font-weight: 800;
}

.equipment-card__title-row strong {
  font-size: 16px;
  line-height: 1.35;
}

.equipment-card__alias,
.equipment-card__remark,
.equipment-card__channels p {
  margin: 0;
  color: var(--calc-text-muted);
  font-size: 13px;
  line-height: 1.55;
}

.equipment-card__channels {
  display: grid;
  gap: 6px;
}

.equipment-card__channels span {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  margin-right: 6px;
  border-radius: 999px;
  background: var(--calc-surface-soft);
  color: var(--c-brand);
  font-size: 12px;
  font-weight: 800;
  padding: 0 7px;
}

.equipment-lookup__empty {
  padding: 32px 24px;
  text-align: center;
}

@media (max-width: 920px) {
  .equipment-lookup__toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .equipment-lookup__search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .equipment-lookup__header,
  .equipment-lookup__toolbar {
    grid-template-columns: 1fr;
  }

  .equipment-lookup__header {
    display: grid;
  }

  .equipment-lookup__stats {
    justify-items: start;
    place-items: initial;
  }

  .equipment-card {
    grid-template-columns: 80px minmax(0, 1fr);
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status?: string
  gameVersion?: string
  sourceUpdatedAt?: string
  verifiedAt?: string
  permission?: string
  authors?: Array<{ name: string; role?: string }>
  reviewers?: Array<{ name: string; role?: string }>
}>()

const statusLabels: Record<string, string> = {
  draft: '草稿',
  current: '当前有效',
  stale: '待复核',
  archived: '已归档',
}

const items = computed(() =>
  [
    {
      label: '状态',
      value: props.status ? (statusLabels[props.status] ?? props.status) : undefined,
    },
    { label: '游戏版本', value: props.gameVersion },
    { label: '来源更新', value: props.sourceUpdatedAt },
    { label: '核验时间', value: props.verifiedAt },
    { label: '授权', value: props.permission },
    {
      label: '作者',
      value: props.authors?.map((person) => person.name).join('、'),
    },
    {
      label: '审核',
      value: props.reviewers?.map((person) => person.name).join('、'),
    },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value)),
)
</script>

<template>
  <aside
    v-if="items.length"
    class="page-status"
    :class="status ? `page-status--${status}` : undefined"
    aria-label="页面状态"
  >
    <p v-if="status === 'stale'" class="page-status__notice">
      本页依赖的数据或结论存在较新来源，复核完成前请不要将其视为最新版本。
    </p>
    <dl class="page-status__list">
      <div v-for="item in items" :key="item.label" class="page-status__item">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </div>
    </dl>
  </aside>
</template>

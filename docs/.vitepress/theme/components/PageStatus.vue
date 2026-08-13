<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status?: string
}>()

const statusLabels: Record<string, string> = {
  draft: '草稿',
  current: '2026年8月13日更新',
  stale: '待复核',
  archived: '已归档',
}

const statusLabel = computed(() =>
  props.status ? (statusLabels[props.status] ?? props.status) : undefined,
)
</script>

<template>
  <aside
    v-if="statusLabel"
    class="page-status"
    :class="status ? `page-status--${status}` : undefined"
    aria-label="页面状态"
  >
    <p v-if="status === 'draft'" class="page-status__notice">
      本页仍在审核中，内容可能调整。
    </p>
    <p v-else-if="status === 'stale'" class="page-status__notice">
      本页依赖的数据或结论存在较新来源，复核完成前请不要将其视为最新版本。
    </p>
    <dl class="page-status__list">
      <div class="page-status__item">
        <dt>状态</dt>
        <dd>{{ statusLabel }}</dd>
      </div>
    </dl>
  </aside>
</template>

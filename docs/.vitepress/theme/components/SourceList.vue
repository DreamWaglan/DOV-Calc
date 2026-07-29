<script setup lang="ts">
interface SourceItem {
  title: string
  url?: string
  note?: string
  notes?: string
  permission?: string
}

defineProps<{
  sources?: SourceItem[]
  permission?: string
}>()
</script>

<template>
  <section v-if="sources?.length || permission" class="source-list" aria-labelledby="source-list-title">
    <h2 id="source-list-title" class="source-list__title">来源与授权</h2>

    <ul v-if="sources?.length" class="source-list__items">
      <li v-for="source in sources" :key="`${source.title}:${source.url ?? ''}`" class="source-list__item">
        <a v-if="source.url" :href="source.url" rel="noreferrer" target="_blank">{{ source.title }}</a>
        <span v-else>{{ source.title }}</span>
        <p v-if="source.note || source.notes">{{ source.note ?? source.notes }}</p>
      </li>
    </ul>

    <p v-if="permission" class="source-list__permission">{{ permission }}</p>
  </section>
</template>

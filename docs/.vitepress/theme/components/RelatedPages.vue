<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  pages?: Array<{
    id: string
    text: string
    description?: string
    link: string
    status?: string
  }>
}>()
</script>

<template>
  <nav v-if="pages?.length" class="related-pages" aria-labelledby="related-pages-title">
    <h2 id="related-pages-title" class="related-pages__title">相关页面</h2>
    <ul class="related-pages__items">
      <li v-for="page in pages" :key="page.id">
        <a :href="withBase(page.link)">
          <strong>{{ page.text }}</strong>
          <span v-if="page.description">{{ page.description }}</span>
          <small v-if="page.status === 'stale'">待复核</small>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import PageStatus from './components/PageStatus.vue'
import RelatedPages from './components/RelatedPages.vue'
import SourceList from './components/SourceList.vue'

interface IndexedPage {
  id: string
  text: string
  description?: string
  link: string
  status?: string
}

const { frontmatter, page, theme } = useData()

const permission = computed(() => {
  const values = (frontmatter.value.sources ?? [])
    .map((source: { permission?: string }) => source.permission)
    .filter(Boolean)
  return [...new Set(values)].join('、')
})

const relatedPages = computed(() => {
  const ids = new Set<string>(frontmatter.value.related ?? [])
  const index = (theme.value.pageIndex ?? []) as IndexedPage[]
  return index.filter((page) => ids.has(page.id))
})

function enhanceArticleTables() {
  if (typeof document === 'undefined') {
    return
  }

  document.querySelectorAll<HTMLTableElement>('.vp-doc table').forEach((table, index) => {
    table.tabIndex = 0
    if (!table.hasAttribute('aria-label')) {
      table.setAttribute('aria-label', `数据表 ${index + 1}，可横向滚动`)
    }
  })
}

onMounted(enhanceArticleTables)

watch(
  () => page.value.relativePath,
  async () => {
    await nextTick()
    enhanceArticleTables()
  },
  { flush: 'post' },
)
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <PageStatus
        :status="frontmatter.status"
        :game-version="frontmatter.gameVersion"
        :source-updated-at="frontmatter.sourceUpdatedAt"
        :verified-at="frontmatter.verifiedAt"
        :permission="permission"
        :authors="frontmatter.authors"
        :reviewers="frontmatter.reviewers"
      />
    </template>

    <template #doc-after>
      <SourceList :sources="frontmatter.sources" :permission="permission" />
      <RelatedPages :pages="relatedPages" />
    </template>
  </DefaultTheme.Layout>
</template>

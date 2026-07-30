<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import redirectsLedger from '../../../content/governance/redirects.json'
import PageStatus from './components/PageStatus.vue'
import RelatedPages from './components/RelatedPages.vue'
import SourceList from './components/SourceList.vue'
import { legacyAnchorTarget } from './legacyAnchorRedirectModel.js'

interface IndexedPage {
  id: string
  text: string
  description?: string
  link: string
  status?: string
}

const { frontmatter, page, site, theme } = useData()

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

function redirectLegacyAnchor() {
  if (typeof window === 'undefined') return
  const target = legacyAnchorTarget(
    redirectsLedger.redirects,
    window.location,
    site.value.base,
  )
  if (target) window.location.replace(withBase(target))
}

function handleHashChange() {
  redirectLegacyAnchor()
}

onMounted(() => {
  enhanceArticleTables()
  redirectLegacyAnchor()
  window.addEventListener('hashchange', handleHashChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', handleHashChange)
})

watch(
  () => page.value.relativePath,
  async () => {
    await nextTick()
    enhanceArticleTables()
    redirectLegacyAnchor()
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

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import redirectsLedger from '../../../content/governance/redirects.json'
import PageStatus from './components/PageStatus.vue'
import RelatedPages from './components/RelatedPages.vue'
import { legacyAnchorTarget } from './legacyAnchorRedirectModel.js'

interface IndexedPage {
  id: string
  text: string
  description?: string
  link: string
  status?: string
}

const { frontmatter, page, site, theme } = useData()

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
    const scrollRegion = table.closest('.docx-table-scroll') as HTMLElement | null
    const focusTarget = scrollRegion ?? table
    focusTarget.tabIndex = 0
    if (focusTarget.dataset.tableKeyboardScroll !== 'true') {
      focusTarget.dataset.tableKeyboardScroll = 'true'
      focusTarget.addEventListener('keydown', (event) => {
        if (focusTarget.scrollWidth <= focusTarget.clientWidth) return
        const maxScroll = focusTarget.scrollWidth - focusTarget.clientWidth
        const nextScroll =
          event.key === 'ArrowRight'
            ? Math.min(maxScroll, focusTarget.scrollLeft + 80)
            : event.key === 'ArrowLeft'
              ? Math.max(0, focusTarget.scrollLeft - 80)
              : event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? maxScroll
                  : null
        if (nextScroll === null) return
        event.preventDefault()
        focusTarget.scrollTo({ left: nextScroll, behavior: 'auto' })
      })
    }
    if (!table.hasAttribute('aria-label')) {
      table.setAttribute('aria-label', `数据表 ${index + 1}，可横向滚动`)
    }
    if (scrollRegion && !scrollRegion.hasAttribute('aria-label')) {
      scrollRegion.setAttribute('aria-label', `数据表 ${index + 1}，可横向滚动`)
      scrollRegion.setAttribute('role', 'region')
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
      <PageStatus :status="frontmatter.status" />
    </template>

    <template #doc-after>
      <RelatedPages :pages="relatedPages" />
    </template>
  </DefaultTheme.Layout>
</template>

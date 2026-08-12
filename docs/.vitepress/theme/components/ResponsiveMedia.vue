<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import OriginalImageViewer from './OriginalImageViewer.vue'

interface Candidate {
  path: string
  width: number
}

interface Variant {
  type: string
  candidates: Candidate[]
}

const props = defineProps<{
  mediaId: string
  alt: string
  variants: Variant[]
  fallbackPath: string
  width: number
  height: number
  displayMode?: 'viewer' | 'index' | 'table-cell'
}>()

const viewerOpen = ref(false)

const sources = computed(() =>
  props.variants.map((variant) => ({
    ...variant,
    srcset: variant.candidates
      .map((candidate) => `${withBase(candidate.path)} ${candidate.width}w`)
      .join(', '),
  })),
)

const isIndexCard = computed(
  () =>
    props.displayMode === 'index' ||
    (props.displayMode === undefined && props.variants.length > 0),
)
const isTableCell = computed(() => props.displayMode === 'table-cell')
const resolvedMode = computed(() =>
  isIndexCard.value ? 'index' : isTableCell.value ? 'table-cell' : 'viewer',
)
const imagePath = computed(() => withBase(props.fallbackPath))
</script>

<template>
  <figure
    :id="mediaId"
    class="responsive-media"
    :class="`responsive-media--${resolvedMode}`"
    :data-media-mode="resolvedMode"
  >
    <template v-if="isIndexCard">
      <picture>
        <source
          v-for="source in sources"
          :key="source.type"
          :type="source.type"
          :srcset="source.srcset"
          sizes="(max-width: 768px) calc(100vw - 48px), min(960px, 100vw - 96px)"
        />
        <img
          :src="imagePath"
          :alt="alt"
          :width="width"
          :height="height"
          loading="lazy"
          decoding="async"
        />
      </picture>
    </template>
    <button
      v-else
      class="responsive-media__trigger"
      type="button"
      :aria-label="`查看原图：${alt}`"
      @click="viewerOpen = true"
    >
      <picture>
        <img
          :src="imagePath"
          :alt="alt"
          :width="width"
          :height="height"
          loading="lazy"
          decoding="async"
        />
      </picture>
    </button>
  </figure>

  <OriginalImageViewer
    v-if="!isIndexCard"
    :open="viewerOpen"
    :src="imagePath"
    :alt="alt"
    :width="width"
    :height="height"
    @close="viewerOpen = false"
  />
</template>

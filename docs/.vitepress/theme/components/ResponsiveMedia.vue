<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'

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
  caption: string
  sourceLabel: string
  version: string
  authorization: string
  variants: Variant[]
  fallbackPath: string
  width: number
  height: number
  downloadAllowed?: boolean
  downloadPath?: string
}>()

const sources = computed(() =>
  props.variants.map((variant) => ({
    ...variant,
    srcset: variant.candidates
      .map((candidate) => `${withBase(candidate.path)} ${candidate.width}w`)
      .join(', '),
  })),
)
</script>

<template>
  <figure :id="mediaId" class="responsive-media">
    <picture>
      <source
        v-for="source in sources"
        :key="source.type"
        :type="source.type"
        :srcset="source.srcset"
        sizes="(max-width: 768px) calc(100vw - 48px), min(960px, 100vw - 96px)"
      />
      <img
        :src="withBase(fallbackPath)"
        :alt="alt"
        :width="width"
        :height="height"
        loading="lazy"
        decoding="async"
      />
    </picture>
    <figcaption>
      <span>{{ caption }}</span>
      <small>
        来源：{{ sourceLabel }} · 版本：{{ version }} · 授权证据：{{ authorization }}
      </small>
      <a
        v-if="downloadAllowed && downloadPath"
        :href="withBase(downloadPath)"
        download
      >
        下载授权原图
      </a>
      <small v-else>原始文件未开放下载。</small>
    </figcaption>
  </figure>
</template>

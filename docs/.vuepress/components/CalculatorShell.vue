<template>
  <section class="calculator-shell">
    <header class="calculator-shell__header">
      <div>
        <p class="calculator-shell__eyebrow">{{ category }}</p>
        <h2>{{ title }}</h2>
      </div>
      <span class="calculator-shell__status">{{ status }}</span>
    </header>

    <div class="calculator-shell__body">
      <div class="calculator-shell__panel">
        <h3>输入区</h3>
        <slot name="inputs">
          <p class="calculator-shell__muted">后续在这里放置等级、属性、加成、装备等输入项。</p>
        </slot>
      </div>

      <div class="calculator-shell__panel calculator-shell__panel--result">
        <h3>结果区</h3>
        <slot name="results">
          <p class="calculator-shell__muted">后续在这里展示计算结果、推荐方案和关键说明。</p>
        </slot>
      </div>
    </div>

    <footer v-if="$slots.notes" class="calculator-shell__notes">
      <slot name="notes" />
    </footer>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'DOV Calculator',
  },
  status: {
    type: String,
    default: '模板',
  },
})
</script>

<template>
  <section class="damage-calculator" aria-labelledby="damage-calculator-title">
    <header class="damage-calculator__header">
      <div>
        <h2 id="damage-calculator-title">伤害计算器</h2>
        <p>根据基础伤害、暴击期望、命中期望三段公式计算。</p>
      </div>
      <div class="damage-calculator__source">
        <span>公式来源</span>
        <strong>小强之王</strong>
      </div>
    </header>

    <div class="damage-calculator__layout">
      <form class="damage-calculator__inputs" @submit.prevent>
        <section class="damage-calculator__group">
          <h3>基础属性</h3>
          <div class="damage-calculator__grid">
            <label v-for="field in statFields" :key="field.key">
              <span>{{ field.label }}</span>
              <input v-model.number="values[field.key]" type="number" step="0.01" />
            </label>
          </div>
        </section>

        <section class="damage-calculator__group">
          <h3>修正项</h3>
          <div class="damage-calculator__grid">
            <label v-for="field in modifierFields" :key="field.key">
              <span>{{ field.label }}</span>
              <input v-model.number="values[field.key]" type="number" step="0.01" />
            </label>
          </div>
        </section>

        <section class="damage-calculator__group">
          <h3>暴击与命中</h3>
          <div class="damage-calculator__grid">
            <label v-for="field in rateFields" :key="field.key">
              <span>{{ field.label }}</span>
              <input v-model.number="values[field.key]" type="number" step="0.01" />
            </label>
          </div>
        </section>

        <button class="damage-calculator__reset" type="button" @click="resetValues">
          恢复示例值
        </button>
      </form>

      <aside class="damage-calculator__results">
        <section class="damage-calculator__hero-result">
          <span>最终期望伤害</span>
          <strong>{{ formatNumber(finalDamage) }}</strong>
          <small>已包含基础伤害、暴击期望与命中期望</small>
        </section>

        <div class="damage-calculator__result-grid">
          <article v-for="item in resultItems" :key="item.label" class="damage-calculator__metric">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <section class="damage-calculator__formula">
          <h3>公式算法</h3>
          <ol>
            <li>基础攻击力 = 航空值 + 轰炸 + 鱼雷 + 炮击</li>
            <li>攻击力 = 基础攻击力 × (1 + 技能攻击力加成)</li>
            <li>基础伤害 = 攻击力 × 技能倍率 × 防御衰减 × 暴击伤害修正 × 弹种修正 × 增伤修正 × 减伤修正 × 等级修正</li>
            <li>暴击期望 = 暴击率 × 基础伤害 + 未暴击率 × 基础伤害 / 暴击伤害修正</li>
            <li>最终期望伤害 = 命中率 × 暴击期望</li>
          </ol>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'

const STORAGE_KEY = 'dov-calc:damage-calculator:v1'

const defaults = {
  aviation: 1274,
  bombing: 0,
  antiAir: 523,
  torpedo: 888,
  shelling: 0,
  armor: 737,
  allyLevel: 90,
  enemyLevel: 90,
  skillMultiplier: 22.33,
  defense: 407.94,
  critDamage: 1.4,
  ammoModifier: 1.4,
  damageReduction: 1.1,
  skillAttackBonus: 0,
  skillDamageBonus: 0,
  favorBonus: 0.2,
  talentBonus: 0,
  flagshipBonus: 0,
  reconBonus: 0.15,
  nagatoBonus: 0,
  sendaiBonus: 0,
  allyLuck: 30,
  enemyLuck: 15,
  extraCritRate: 0.15,
  antiCritRate: 0,
  allyHit: 500,
  enemyEvasion: 125,
  bonusHitRate: 0.15,
  enemyDodgeRate: 0,
}

const values = reactive({ ...defaults })

onMounted(() => {
  Object.assign(values, getStoredValues())
})

watch(values, () => {
  persistValues()
}, { deep: true })

const statFields = [
  { key: 'aviation', label: '航空值' },
  { key: 'bombing', label: '轰炸' },
  { key: 'antiAir', label: '对空值' },
  { key: 'torpedo', label: '鱼雷' },
  { key: 'shelling', label: '炮击' },
  { key: 'armor', label: '装甲' },
  { key: 'allyLevel', label: '我方等级' },
  { key: 'enemyLevel', label: '敌方等级' },
  { key: 'skillMultiplier', label: '技能倍率' },
  { key: 'defense', label: '敌方防御力' },
]

const modifierFields = [
  { key: 'critDamage', label: '暴击伤害修正' },
  { key: 'ammoModifier', label: '弹种修正' },
  { key: 'damageReduction', label: '减伤修正' },
  { key: 'skillAttackBonus', label: '技能攻击力加成' },
  { key: 'skillDamageBonus', label: '技能增伤' },
  { key: 'favorBonus', label: '好感增伤' },
  { key: 'talentBonus', label: '天赋增伤' },
  { key: 'flagshipBonus', label: '旗舰增伤' },
  { key: 'reconBonus', label: '索敌/制空增伤' },
  { key: 'nagatoBonus', label: '长门级（炮击）' },
  { key: 'sendaiBonus', label: '川内级（雷击）' },
]

const rateFields = [
  { key: 'allyLuck', label: '我方幸运' },
  { key: 'enemyLuck', label: '敌方幸运' },
  { key: 'extraCritRate', label: '额外暴击率' },
  { key: 'antiCritRate', label: '防暴击率' },
  { key: 'allyHit', label: '我方命中' },
  { key: 'enemyEvasion', label: '敌方机动' },
  { key: 'bonusHitRate', label: '加成命中率' },
  { key: 'enemyDodgeRate', label: '敌方闪避率' },
]

const baseAttackPower = computed(() => (
  read('aviation') + read('bombing') + read('torpedo') + read('shelling')
))

const attackPower = computed(() => baseAttackPower.value * (1 + read('skillAttackBonus')))

const damageBonus = computed(() => (
  1
  + read('favorBonus')
  + read('talentBonus')
  + read('skillDamageBonus')
  + read('flagshipBonus')
  + read('reconBonus')
  + read('nagatoBonus')
  + read('sendaiBonus')
))

const levelModifier = computed(() => 1 + 0.02 * (read('allyLevel') - read('enemyLevel')))

const defenseModifier = computed(() => {
  const attack = attackPower.value
  return attack / (attack + 1.3 * read('defense'))
})

const baseDamage = computed(() => (
  attackPower.value
  * read('skillMultiplier')
  * defenseModifier.value
  * read('critDamage')
  * read('ammoModifier')
  * damageBonus.value
  * read('damageReduction')
  * levelModifier.value
))

const baseCritRate = computed(() => {
  const allyLuck = read('allyLuck')
  const enemyLuck = read('enemyLuck')
  return (1 - (enemyLuck / (enemyLuck + allyLuck / 3)) ** 0.8) * 0.8
})

const finalCritRate = computed(() => (
  baseCritRate.value + read('extraCritRate') - read('antiCritRate')
))

const critExpectedDamage = computed(() => (
  finalCritRate.value * baseDamage.value
  + (1 - finalCritRate.value) * baseDamage.value / read('critDamage')
))

const baseHitRate = computed(() => (
  read('allyHit') / (read('enemyEvasion') + read('allyHit'))
))

const finalHitRate = computed(() => (
  baseHitRate.value + read('bonusHitRate') - read('enemyDodgeRate')
))

const finalDamage = computed(() => finalHitRate.value * critExpectedDamage.value)

const resultItems = computed(() => [
  { label: '基础攻击力', value: formatNumber(baseAttackPower.value) },
  { label: '攻击力', value: formatNumber(attackPower.value) },
  { label: '增伤修正', value: formatMultiplier(damageBonus.value) },
  { label: '防御衰减', value: formatPercent(defenseModifier.value) },
  { label: '等级修正', value: formatMultiplier(levelModifier.value) },
  { label: '基础伤害', value: formatNumber(baseDamage.value) },
  { label: '基础暴击率', value: formatPercent(baseCritRate.value) },
  { label: '最终暴击率', value: formatPercent(finalCritRate.value) },
  { label: '暴击期望伤害', value: formatNumber(critExpectedDamage.value) },
  { label: '基础命中率', value: formatPercent(baseHitRate.value) },
  { label: '最终命中率', value: formatPercent(finalHitRate.value) },
])

function read(key) {
  const value = Number(values[key])
  return Number.isFinite(value) ? value : 0
}

function resetValues() {
  Object.assign(values, defaults)
}

function getStoredValues() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return {}
    }

    const parsed = JSON.parse(saved)
    return Object.fromEntries(
      Object.keys(defaults)
        .filter((key) => Number.isFinite(Number(parsed[key])))
        .map((key) => [key, Number(parsed[key])])
    )
  } catch {
    return {}
  }
}

function persistValues() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const snapshot = Object.fromEntries(
      Object.keys(defaults).map((key) => [key, read(key)])
    )

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore storage failures so calculation remains usable.
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function formatPercent(value) {
  return `${formatNumber(value * 100)}%`
}

function formatMultiplier(value) {
  return `${formatNumber(value)}x`
}
</script>

<style scoped>
.damage-calculator {
  margin: 24px 0 40px;
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  background: var(--calc-surface);
  overflow: hidden;
}

.damage-calculator__header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--calc-border);
}

.damage-calculator__header h2 {
  margin: 0 0 8px;
}

.damage-calculator__header p {
  margin: 0;
  color: var(--calc-text-muted);
}

.damage-calculator__eyebrow {
  margin: 0 0 8px;
  color: var(--c-brand);
  font-size: 13px;
  font-weight: 700;
}

.damage-calculator__source {
  display: grid;
  gap: 4px;
  min-width: 160px;
  color: var(--calc-text-muted);
  font-size: 13px;
  text-align: right;
}

.damage-calculator__source strong {
  color: inherit;
}

.damage-calculator__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 0;
}

.damage-calculator__inputs,
.damage-calculator__results {
  padding: 24px;
}

.damage-calculator__inputs {
  display: grid;
  gap: 20px;
  border-right: 1px solid var(--calc-border);
}

.damage-calculator__group h3,
.damage-calculator__formula h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.damage-calculator__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.damage-calculator label {
  display: grid;
  gap: 6px;
  color: var(--calc-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.damage-calculator input {
  min-width: 0;
  height: 38px;
  border: 1px solid var(--calc-border);
  border-radius: 6px;
  background: var(--calc-surface);
  color: inherit;
  font: inherit;
  padding: 0 10px;
}

.damage-calculator input:focus {
  border-color: var(--c-brand);
  outline: 2px solid color-mix(in srgb, var(--c-brand) 22%, transparent);
}

.damage-calculator__reset {
  width: max-content;
  min-height: 38px;
  border: 1px solid var(--c-brand);
  border-radius: 6px;
  background: var(--c-brand);
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  padding: 0 14px;
}

.damage-calculator__results {
  display: grid;
  align-content: start;
  gap: 16px;
  background: var(--calc-surface-soft);
}

.damage-calculator__hero-result {
  display: grid;
  gap: 6px;
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  background: var(--calc-surface);
  padding: 18px;
}

.damage-calculator__hero-result span,
.damage-calculator__hero-result small,
.damage-calculator__metric span {
  color: var(--calc-text-muted);
}

.damage-calculator__hero-result strong {
  color: var(--c-brand);
  font-size: 34px;
  line-height: 1.1;
}

.damage-calculator__result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.damage-calculator__metric {
  display: grid;
  gap: 5px;
  min-height: 72px;
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  background: var(--calc-surface);
  padding: 12px;
}

.damage-calculator__metric strong {
  font-size: 18px;
}

.damage-calculator__formula {
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  background: var(--calc-surface);
  padding: 16px;
}

.damage-calculator__formula ol {
  margin: 0;
  padding-left: 20px;
  color: var(--calc-text-muted);
  line-height: 1.75;
}

@media (max-width: 960px) {
  .damage-calculator__layout {
    grid-template-columns: 1fr;
  }

  .damage-calculator__inputs {
    border-right: 0;
    border-bottom: 1px solid var(--calc-border);
  }
}

@media (max-width: 640px) {
  .damage-calculator__header {
    display: grid;
  }

  .damage-calculator__source {
    text-align: left;
  }

  .damage-calculator__result-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <section class="damage-calculator" aria-labelledby="damage-calculator-title">
    <header class="damage-calculator__header">
      <div>
        <h2 id="damage-calculator-title">伤害计算器</h2>
        <p>对齐 2026.6.25 伤害构成说明，专注单次期望伤害计算。</p>
      </div>
      <div class="damage-calculator__source">
        <span>公式来源</span>
        <strong>小强之王（与当前页面参数对齐）</strong>
      </div>
    </header>

    <div class="damage-calculator__layout">
      <form class="damage-calculator__inputs" @submit.prevent>
        <section class="damage-calculator__group">
          <h3>伤害类型与战斗状态</h3>
          <div class="damage-calculator__grid">
            <label>
              <span>伤害类型</span>
              <select v-model="values.damageType">
                <option v-for="type in damageTypeOptions" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </label>
            <label>
              <span>当前阵型</span>
              <select v-model="values.formation">
                <option v-for="formation in formationOptions" :key="formation.value" :value="formation.value">
                  {{ formation.label }}
                </option>
              </select>
            </label>
            <label>
              <span>我方索敌</span>
              <input v-model.number="values.allyRecon" type="number" step="0.01" />
            </label>
            <label>
              <span>敌方索敌</span>
              <input v-model.number="values.enemyRecon" type="number" step="0.01" />
            </label>
            <label>
              <span>索敌状态</span>
              <div class="damage-calculator__status" :title="reconStateLabel">
                {{ reconStateLabel }}
              </div>
            </label>
            <label>
              <span>我方制空</span>
              <input v-model.number="values.allyAirControl" type="number" step="0.01" />
            </label>
            <label>
              <span>敌方制空</span>
              <input v-model.number="values.enemyAirControl" type="number" step="0.01" />
            </label>
            <label>
              <span>制空状态</span>
              <div class="damage-calculator__status" :title="airControlStateLabel">
                {{ airControlStateLabel }}
              </div>
            </label>
          </div>
        </section>

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
          <span>单次期望伤害</span>
          <strong>{{ formatNumber(finalDamage) }}</strong>
          <small>已含固定伤害（若开启）与命中、暴击期望</small>
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
            <li>按伤害类型计算基础攻击：
              炮击 = 炮击值，雷击 = 雷击值，轰炸机/鱼雷机 = 航空值 + 对应飞机值，航空 = 航空值，对空 = 对空值，特殊 = 攻击力来源1 + 攻击力来源2。</li>
            <li>防御取值：炮击、雷击、对空、特殊取装甲；航空、轰炸机、鱼雷机取对空。</li>
            <li>战斗实时攻击力 = (基础攻击力 + BUFF数值) × (1 + BUFF乘区)</li>
            <li>修正区 = 攻防衰减 × 暴击伤害 × 弹种修正 × 增伤修正 × 减伤修正 × 等级修正</li>
            <li>单次期望 = 命中率 × (暴击率 × 暴击伤害 + (1-暴击率) × 未暴击伤害 + 技能实数伤害)</li>
          </ol>
          <ul>
            <li>索敌与制空分别判定；索敌相等时按同航生效。</li>
            <li>索敌伤害修正仅作用于炮击、雷击；制空伤害修正仅作用于航空、轰炸机、鱼雷机；两者命中修正同时生效。</li>
            <li>技能倍率按百分比输入，例如 700 表示 7 倍。</li>
          </ul>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'

const STORAGE_KEY = 'dov-calc:damage-calculator:v5'

const damageTypeOptions = [
  { value: 'shelling', label: '炮击' },
  { value: 'torpedo', label: '雷击' },
  { value: 'air', label: '航空' },
  { value: 'bombing', label: '轰炸机' },
  { value: 'airTorpedo', label: '鱼雷机' },
  { value: 'antiAir', label: '对空' },
  { value: 'special', label: '特殊' },
]

const reconDamageTypes = new Set(['shelling', 'torpedo'])
const airControlDamageTypes = new Set(['air', 'bombing', 'airTorpedo'])

const formationOptions = [
  { value: 'single', label: '单纵阵' },
  { value: 'wheel', label: '轮型阵' },
  { value: 'wedge', label: '梯形阵' },
]

const defaults = {
  damageType: 'airTorpedo',
  formation: 'single',
  allyRecon: 100,
  enemyRecon: 100,
  allyAirControl: 100,
  enemyAirControl: 100,

  aviation: 1274,
  bombing: 0,
  antiAir: 523,
  torpedo: 888,
  torpedoBomber: 140,
  shelling: 0,
  specialAttackSource1: 0,
  specialAttackSource2: 0,
  enemyArmor: 737,
  enemyAirDefense: 523,
  allyLevel: 90,
  enemyLevel: 76,
  skillMultiplier: 2233,
  critDamage: 1.4,
  ammoModifier: 1.4,
  damageReduction: 1,
  attackFlatBonus: 0,
  hpDamage: 0,
  skillAttackBonus: 0,
  skillDamageBonus: 0,
  equipmentDamageBonus: 0,
  raguzDamageBonus: 0,
  favorBonus: 0.2,
  talentBonus: 0,
  flagshipBonus: 0,
  reconBonus: 0,
  tieUpBonus: 0,

  allyLuck: 15,
  enemyLuck: 15,
  extraCritRate: 0,
  extraCritDamage: 0,
  antiCritRate: 0,
  allyHit: 500,
  enemyEvasion: 125,
  bonusHitRate: 0,
  enemyDodgeRate: 0,
}

const validDamageTypeValues = new Set(damageTypeOptions.map((item) => item.value))
const validFormationValues = new Set(formationOptions.map((item) => item.value))
const stringStorageKeys = new Set(['damageType', 'formation'])

const values = reactive({ ...defaults })

const attackByType = {
  shelling: (read) => read('shelling'),
  torpedo: (read) => read('torpedo'),
  air: (read) => read('aviation'),
  bombing: (read) => read('aviation') + read('bombing'),
  airTorpedo: (read) => read('aviation') + read('torpedoBomber'),
  antiAir: (read) => read('antiAir'),
  special: (read) => read('specialAttackSource1') + read('specialAttackSource2'),
}

const reconStateByGroup = {
  combat: {
    superior: { damage: 0.15, hit: 0.20, label: 'T优' },
    normal: { damage: 0.08, hit: 0.10, label: '同航' },
    equal: { damage: 0.08, hit: 0.10, label: '同航' },
    reverse: { damage: -0.08, hit: -0.10, label: '反航' },
    poor: { damage: -0.15, hit: -0.10, label: 'T劣' },
  },
  air: {
    superior: { damage: 0.15, hit: 0.20, label: '制空确保' },
    normal: { damage: 0.08, hit: 0.10, label: '制空优势' },
    equal: { damage: 0, hit: 0, label: '制空均势' },
    reverse: { damage: -0.08, hit: -0.10, label: '制空劣势' },
    poor: { damage: -0.15, hit: -0.10, label: '制空丧失' },
  },
}

const formationByType = {
  shelling: { group: 'combat' },
  torpedo: { group: 'combat' },
  air: { group: 'air' },
  bombing: { group: 'air' },
  airTorpedo: { group: 'air' },
  antiAir: { group: 'air' },
  special: { group: 'combat' },
}

const defenseByType = {
  shelling: 'armor',
  torpedo: 'armor',
  air: 'airDefense',
  bombing: 'airDefense',
  airTorpedo: 'airDefense',
  antiAir: 'armor',
  special: 'armor',
}

const formationBonus = {
  single: {
    combat: { damage: 0.12, hit: 0 },
    air: { damage: 0, hit: 0 },
    critRate: 0,
    critDamage: 0,
  },
  wheel: {
    combat: { damage: -0.05, hit: 0 },
    air: { damage: 0.15, hit: 0.10 },
    critRate: 0,
    critDamage: 0,
  },
  wedge: {
    combat: { damage: 0, hit: 0 },
    air: { damage: 0, hit: 0 },
    critRate: 0.15,
    critDamage: 0.05,
  },
}

const typeIsCombat = (type) => formationByType[type]?.group === 'combat'

const defaultsSnapshot = { ...defaults }
onMounted(() => {
  Object.assign(values, getStoredValues())
})

watch(
  values,
  () => {
    persistValues()
  },
  { deep: true },
)

const attackStatFieldsByType = {
  shelling: [
    { key: 'shelling', label: '炮击值' },
  ],
  torpedo: [
    { key: 'torpedo', label: '雷击值' },
  ],
  air: [
    { key: 'aviation', label: '航空值' },
  ],
  bombing: [
    { key: 'aviation', label: '航空值' },
    { key: 'bombing', label: '轰炸机数值' },
  ],
  airTorpedo: [
    { key: 'aviation', label: '航空值' },
    { key: 'torpedoBomber', label: '鱼雷机数值' },
  ],
  antiAir: [
    { key: 'antiAir', label: '对空值' },
  ],
  special: [
    { key: 'specialAttackSource1', label: '攻击力来源1' },
    { key: 'specialAttackSource2', label: '攻击力来源2' },
  ],
}

const defenseStatFields = {
  armor: { key: 'enemyArmor', label: '敌方装甲值' },
  airDefense: { key: 'enemyAirDefense', label: '敌方对空值' },
}

const sharedStatFields = [
  { key: 'allyLevel', label: '我方等级' },
  { key: 'enemyLevel', label: '敌方等级' },
  { key: 'skillMultiplier', label: '技能倍率（%）' },
]

const statFields = computed(() => {
  const defenseType = defenseByType[values.damageType] || 'armor'
  const attackFields = attackStatFieldsByType[values.damageType] || attackStatFieldsByType.shelling
  return [
    ...attackFields,
    defenseStatFields[defenseType] || defenseStatFields.armor,
    ...sharedStatFields,
  ]
})

const modifierFields = [
  { key: 'attackFlatBonus', label: 'BUFF数值（加法）' },
  { key: 'skillAttackBonus', label: 'BUFF乘区（乘法）' },
  { key: 'hpDamage', label: '技能实数伤害' },
  { key: 'critDamage', label: '暴击伤害修正' },
  { key: 'ammoModifier', label: '弹种修正' },
  { key: 'damageReduction', label: '减伤修正倍率' },
  { key: 'skillDamageBonus', label: '技能增伤' },
  { key: 'equipmentDamageBonus', label: '装备增伤' },
  { key: 'raguzDamageBonus', label: '拉古兹增伤' },
  { key: 'favorBonus', label: '好感增伤' },
  { key: 'talentBonus', label: '天赋增伤' },
  { key: 'flagshipBonus', label: '旗舰增伤' },
  { key: 'tieUpBonus', label: '羁绊增伤' },
  { key: 'reconBonus', label: '索敌/制空手动增伤' },
  { key: 'extraCritDamage', label: '额外暴击伤害' },
  { key: 'bonusHitRate', label: '加成命中率' },
]

const rateFields = [
  { key: 'allyLuck', label: '我方幸运' },
  { key: 'enemyLuck', label: '敌方幸运' },
  { key: 'extraCritRate', label: '额外暴击率' },
  { key: 'antiCritRate', label: '防暴击率' },
  { key: 'allyHit', label: '我方命中' },
  { key: 'enemyEvasion', label: '敌方机动' },
  { key: 'enemyDodgeRate', label: '敌方闪避率' },
]

const baseAttackPower = computed(() => {
  const get = attackByType[values.damageType] || attackByType.shelling
  return get(read)
})

const attackPower = computed(() => {
  const raw = baseAttackPower.value + read('attackFlatBonus')
  return raw * (1 + read('skillAttackBonus'))
})

const effectiveSkillMultiplier = computed(() => safeDivide(read('skillMultiplier'), 100))

const reconState = computed(() => {
  return evaluateState(read('allyRecon'), read('enemyRecon'), reconStateByGroup.combat, 'recon')
})

const airControlState = computed(() => {
  return evaluateState(read('allyAirControl'), read('enemyAirControl'), reconStateByGroup.air, 'air')
})

const formationAdjust = computed(() => {
  const formation = formationBonus[values.formation] || formationBonus.single
  const isCombat = typeIsCombat(values.damageType)
  const env = isCombat ? 'combat' : 'air'
  return {
    damage: formation[env]?.damage || 0,
    hit: formation[env]?.hit || 0,
    critRate: formation.critRate,
    critDamage: formation.critDamage,
    critLabel: values.formation === 'wedge' ? '梯形阵（提升暴击）' : '',
    env,
  }
}
)

const defenseValue = computed(() => {
  const defenseType = defenseByType[values.damageType] || 'armor'
  return defenseType === 'armor' ? read('enemyArmor') : read('enemyAirDefense')
})

const stateDamageBonus = computed(() => {
  if (reconDamageTypes.has(values.damageType)) {
    return reconState.value.damage
  }
  if (airControlDamageTypes.has(values.damageType)) {
    return airControlState.value.damage
  }
  return 0
})
const stateHitBonus = computed(() => reconState.value.hit + airControlState.value.hit)
const autoDamageBonus = computed(() => stateDamageBonus.value + formationAdjust.value.damage)
const autoHitBonus = computed(() => stateHitBonus.value + formationAdjust.value.hit)

const damageModifier = computed(() => (
  1
  + read('favorBonus')
  + read('talentBonus')
  + read('skillDamageBonus')
  + read('equipmentDamageBonus')
  + read('raguzDamageBonus')
  + read('flagshipBonus')
  + read('tieUpBonus')
  + read('reconBonus')
  + autoDamageBonus.value
))

const levelModifier = computed(() => {
  const diff = read('allyLevel') - read('enemyLevel')
  const base = 1 + 0.02 * diff
  return clamp(base, 0.5, 1.5)
})

const defenseModifier = computed(() => {
  const attack = attackPower.value
  const defense = defenseValue.value
  if (defense <= 0 || Number.isNaN(defense)) {
    return 0
  }
  return attack / (attack + 1.3 * defense)
})

const effectiveCritDamage = computed(() => (
  read('critDamage') + formationAdjust.value.critDamage + read('extraCritDamage')
))

const baseDamage = computed(() => (
  attackPower.value
  * effectiveSkillMultiplier.value
  * defenseModifier.value
  * effectiveCritDamage.value
  * read('ammoModifier')
  * damageModifier.value
  * read('damageReduction')
  * levelModifier.value
))

const baseCritRate = computed(() => {
  const allyLuck = read('allyLuck')
  const enemyLuck = read('enemyLuck')
  if (allyLuck <= 0 || enemyLuck <= 0) {
    return 0
  }
  return (1 - (enemyLuck / (enemyLuck + allyLuck / 3)) ** 0.8) * 0.8
})

const finalCritRate = computed(() => clampRate(
  baseCritRate.value
  + read('extraCritRate')
  + formationAdjust.value.critRate
  - read('antiCritRate'),
))

const critExpectedDamage = computed(() => (
  finalCritRate.value * baseDamage.value
  + (1 - finalCritRate.value) * (safeDivide(baseDamage.value, effectiveCritDamage.value))
))

const baseHitRate = computed(() => (
  safeDivide(read('allyHit'), read('allyHit') + read('enemyEvasion'))
))

const finalHitRate = computed(() => clampRate(
  baseHitRate.value + autoHitBonus.value + read('bonusHitRate') - read('enemyDodgeRate'),
))

const finalDamage = computed(() => (
  finalHitRate.value * (critExpectedDamage.value + read('hpDamage'))
))

const resultItems = computed(() => {
  const damageType = damageTypeOptions.find((option) => option.value === values.damageType)?.label || '未知'
  return [
    { label: '伤害类型', value: damageType },
    { label: '基础攻击力', value: formatNumber(baseAttackPower.value) },
    { label: '攻击力', value: formatNumber(attackPower.value) },
    { label: '有效技能倍率', value: formatMultiplier(effectiveSkillMultiplier.value) },
    { label: '对照防御', value: formatNumber(defenseValue.value) },
    { label: '状态伤害修正', value: formatPercent(stateDamageBonus.value) },
    { label: '状态命中修正', value: formatPercent(stateHitBonus.value) },
    { label: '增伤修正', value: formatMultiplier(damageModifier.value) },
    { label: '攻击力防御衰减', value: formatPercent(defenseModifier.value) },
    { label: '等级修正', value: formatMultiplier(levelModifier.value) },
    { label: '默认暴击伤害', value: formatNumber(baseDamage.value) },
    { label: '固定伤害', value: formatNumber(read('hpDamage')) },
    { label: '基础暴击率', value: formatPercent(baseCritRate.value) },
    { label: '最终暴击率', value: formatPercent(finalCritRate.value) },
    { label: '暴击期望伤害', value: formatNumber(critExpectedDamage.value) },
    { label: '基础命中率', value: formatPercent(baseHitRate.value) },
    { label: '最终命中率', value: formatPercent(finalHitRate.value) },
    { label: '索敌状态', value: reconStateLabel.value },
    { label: '制空状态', value: airControlStateLabel.value },
    { label: '阵型', value: formationOptions.find((option) => option.value === values.formation)?.label || values.formation },
  ]
})

const reconStateLabel = computed(() => {
  return formatStateLabel(reconState.value, '索敌')
})

const airControlStateLabel = computed(() => {
  return formatStateLabel(airControlState.value, '制空')
})

function read(key) {
  const value = Number(values[key])
  return Number.isFinite(value) ? value : 0
}

function resetValues() {
  Object.assign(values, defaultsSnapshot)
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
    const parsedValues = {}
    Object.keys(defaults).forEach((key) => {
      const value = parsed[key]
      if (stringStorageKeys.has(key)) {
        if (isValidStoredString(key, value)) {
          parsedValues[key] = value
        }
        return
      }

      const num = Number(value)
      if (Number.isFinite(num)) {
        parsedValues[key] = num
      }
    })
    return parsedValues
  } catch {
    return {}
  }
}

function persistValues() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const snapshot = {}
    Object.keys(defaults).forEach((key) => {
      if (stringStorageKeys.has(key)) {
        snapshot[key] = values[key]
      } else {
        snapshot[key] = read(key)
      }
    })
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // localStorage may fail in restricted contexts; ignore to keep UX.
  }
}

function isValidStoredString(key, value) {
  if (typeof value !== 'string') {
    return false
  }

  if (key === 'damageType') {
    return validDamageTypeValues.has(value)
  }

  if (key === 'formation') {
    return validFormationValues.has(value)
  }

  return false
}

function evaluateState(ally, enemy, table, group) {
  if (ally <= 0 || enemy <= 0) {
    return { ...table.equal, group }
  }

  const ratio = ally / enemy
  if (Math.abs(ratio - 1) < 0.000001) {
    return { ...table.equal, group }
  }
  if (ratio >= 1.25) {
    return { ...table.superior, group }
  }
  if (ratio > 1) {
    return { ...table.normal, group }
  }
  if (ratio <= 0.8) {
    return { ...table.poor, group }
  }
  return { ...table.reverse, group }
}

function formatStateLabel(state, name) {
  const list = [state.label]
  if (state.damage || state.hit) {
    list.push(`伤害${formatPercent(state.damage)}、命中${formatPercent(state.hit)}`)
  } else {
    list.push(`无额外${name}修正`)
  }
  return list.join(' ')
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return min
  }
  return Math.min(max, Math.max(min, value))
}

function clampRate(value) {
  return clamp(value, 0, 1)
}

function safeDivide(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
    return 0
  }
  return a / b
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
  color: var(--calc-text);
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
  font-size: 22px;
}

.damage-calculator__header p {
  margin: 0;
  color: var(--calc-text-muted);
}

.damage-calculator__source {
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--calc-surface);
  border: 1px solid var(--calc-border);
  color: var(--calc-text-muted);
}

.damage-calculator__layout {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 20px;
  padding: 20px;
}

.damage-calculator__inputs {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.damage-calculator__group {
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  padding: 14px;
  background: var(--calc-surface);
}

.damage-calculator__group h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.damage-calculator__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.damage-calculator__grid label {
  display: flex;
  gap: 6px;
  flex-direction: column;
  color: var(--calc-text-muted);
}

.damage-calculator__grid label span {
  overflow-wrap: anywhere;
}

.damage-calculator__grid input,
.damage-calculator__grid select {
  border: 1px solid var(--calc-border);
  border-radius: 6px;
  background: var(--calc-surface);
  color: var(--calc-text);
  padding: 6px 8px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  color-scheme: light;
}

.damage-calculator__grid select option {
  background: var(--calc-surface);
  color: var(--calc-text);
}

.damage-calculator__grid select option:checked {
  background: color-mix(in srgb, var(--c-brand) 34%, var(--calc-surface));
  color: var(--calc-text);
}

.damage-calculator__grid input:focus,
.damage-calculator__grid select:focus {
  outline: none;
  border-color: var(--calc-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-brand) 18%, transparent);
}

:global(html.dark .damage-calculator__grid select),
:global(html[data-theme='dark'] .damage-calculator__grid select),
:global(body.dark .damage-calculator__grid select),
:global(body[data-theme='dark'] .damage-calculator__grid select),
:global(.dark .damage-calculator__grid select),
:global([data-theme='dark'] .damage-calculator__grid select) {
  color-scheme: dark;
}

.damage-calculator__status {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--calc-border);
  border-radius: 6px;
  background: transparent;
  color: var(--calc-text);
  padding: 6px 8px;
  line-height: 1.35;
  white-space: normal;
  word-break: break-word;
  min-height: 34px;
}

.damage-calculator__reset {
  align-self: flex-start;
  border: 1px solid var(--calc-border);
  border-radius: 999px;
  background: transparent;
  color: var(--calc-text);
  padding: 8px 14px;
}

.damage-calculator__results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.damage-calculator__hero-result {
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  padding: 14px;
  background: var(--calc-surface);
}

.damage-calculator__hero-result span,
.damage-calculator__hero-result small {
  display: block;
  color: var(--calc-text-muted);
}

.damage-calculator__hero-result strong {
  display: block;
  margin: 4px 0 6px;
  color: var(--calc-text);
  font-size: 28px;
}

.damage-calculator__result-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.damage-calculator__metric {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--calc-surface);
}

.damage-calculator__metric strong {
  color: var(--calc-text);
  text-align: right;
  overflow-wrap: anywhere;
}

.damage-calculator__formula {
  border: 1px solid var(--calc-border);
  border-radius: 8px;
  padding: 14px;
  background: var(--calc-surface);
}

.damage-calculator__formula h3 {
  margin: 0 0 8px;
  font-size: 16px;
}

.damage-calculator__formula ol,
.damage-calculator__formula ul {
  margin: 0;
  padding-left: 20px;
}

.damage-calculator__formula li {
  margin: 4px 0;
  color: var(--calc-text-muted);
}

@media (max-width: 980px) {
  .damage-calculator__layout {
    grid-template-columns: 1fr;
  }

  .damage-calculator__grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>

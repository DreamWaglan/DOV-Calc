import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const sourcePath = path.resolve(
  process.argv[2] ?? 'docs/.vitepress/components/DamageCalculator.vue',
)
const outputPath = path.resolve(
  process.argv[3] ?? 'tests/fixtures/damage-calculator-golden.json',
)

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

const attackByType = {
  shelling: (value) => value.shelling,
  torpedo: (value) => value.torpedo,
  air: (value) => value.aviation,
  bombing: (value) => value.aviation + value.bombing,
  airTorpedo: (value) => value.aviation + value.torpedoBomber,
  antiAir: (value) => value.antiAir,
  special: (value) => value.specialAttackSource1 + value.specialAttackSource2,
}

const reconStateByGroup = {
  combat: {
    superior: { damage: 0.15, hit: 0.2, label: 'T优' },
    normal: { damage: 0.08, hit: 0.1, label: '同航' },
    equal: { damage: 0.08, hit: 0.1, label: '同航' },
    reverse: { damage: -0.08, hit: -0.1, label: '反航' },
    poor: { damage: -0.15, hit: -0.1, label: 'T劣' },
  },
  air: {
    superior: { damage: 0.15, hit: 0.2, label: '制空确保' },
    normal: { damage: 0.08, hit: 0.1, label: '制空优势' },
    equal: { damage: 0, hit: 0, label: '制空均势' },
    reverse: { damage: -0.08, hit: -0.1, label: '制空劣势' },
    poor: { damage: -0.15, hit: -0.1, label: '制空丧失' },
  },
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
    air: { damage: 0.15, hit: 0.1 },
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

const combatTypes = new Set(['shelling', 'torpedo', 'special'])
const reconDamageTypes = new Set(['shelling', 'torpedo'])
const airControlDamageTypes = new Set(['air', 'bombing', 'airTorpedo'])
const armorDefenseTypes = new Set(['shelling', 'torpedo', 'antiAir', 'special'])

function number(value) {
  const converted = Number(value)
  return Number.isFinite(converted) ? converted : 0
}

function clamp(value, minimum, maximum) {
  if (!Number.isFinite(value)) return minimum
  return Math.min(maximum, Math.max(minimum, value))
}

function divide(left, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right) || right === 0) return 0
  return left / right
}

function evaluateState(ally, enemy, table) {
  if (ally <= 0 || enemy <= 0) return table.equal
  const ratio = ally / enemy
  if (Math.abs(ratio - 1) < 0.000001) return table.equal
  if (ratio >= 1.25) return table.superior
  if (ratio > 1) return table.normal
  if (ratio <= 0.8) return table.poor
  return table.reverse
}

function displayNumber(value) {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

function calculate(overrides = {}) {
  const value = Object.fromEntries(
    Object.entries({ ...defaults, ...overrides }).map(([key, raw]) => [
      key,
      key === 'damageType' || key === 'formation' ? raw : number(raw),
    ]),
  )

  const baseAttackPower = (attackByType[value.damageType] ?? attackByType.shelling)(value)
  const attackPower =
    (baseAttackPower + value.attackFlatBonus) * (1 + value.skillAttackBonus)
  const effectiveSkillMultiplier = divide(value.skillMultiplier, 100)
  const reconState = evaluateState(
    value.allyRecon,
    value.enemyRecon,
    reconStateByGroup.combat,
  )
  const airControlState = evaluateState(
    value.allyAirControl,
    value.enemyAirControl,
    reconStateByGroup.air,
  )
  const environment = combatTypes.has(value.damageType) ? 'combat' : 'air'
  const formation = formationBonus[value.formation] ?? formationBonus.single
  const formationAdjust = {
    damage: formation[environment]?.damage ?? 0,
    hit: formation[environment]?.hit ?? 0,
    critRate: formation.critRate,
    critDamage: formation.critDamage,
  }
  const defenseValue = armorDefenseTypes.has(value.damageType)
    ? value.enemyArmor
    : value.enemyAirDefense
  const stateDamageBonus = reconDamageTypes.has(value.damageType)
    ? reconState.damage
    : airControlDamageTypes.has(value.damageType)
      ? airControlState.damage
      : 0
  const stateHitBonus = reconState.hit + airControlState.hit
  const autoDamageBonus = stateDamageBonus + formationAdjust.damage
  const autoHitBonus = stateHitBonus + formationAdjust.hit
  const damageModifier =
    1 +
    value.favorBonus +
    value.talentBonus +
    value.skillDamageBonus +
    value.equipmentDamageBonus +
    value.raguzDamageBonus +
    value.flagshipBonus +
    value.tieUpBonus +
    value.reconBonus +
    autoDamageBonus
  const levelModifier = clamp(
    1 + 0.02 * (value.allyLevel - value.enemyLevel),
    0.5,
    1.5,
  )
  const defenseModifier =
    defenseValue <= 0 || Number.isNaN(defenseValue)
      ? 0
      : attackPower / (attackPower + 1.3 * defenseValue)
  const effectiveCritDamage =
    value.critDamage + formationAdjust.critDamage + value.extraCritDamage
  const baseDamage =
    attackPower *
    effectiveSkillMultiplier *
    defenseModifier *
    effectiveCritDamage *
    value.ammoModifier *
    damageModifier *
    value.damageReduction *
    levelModifier
  const baseCritRate =
    value.allyLuck <= 0 || value.enemyLuck <= 0
      ? 0
      : (1 -
          (value.enemyLuck /
            (value.enemyLuck + value.allyLuck / 3)) **
            0.8) *
        0.8
  const finalCritRate = clamp(
    baseCritRate +
      value.extraCritRate +
      formationAdjust.critRate -
      value.antiCritRate,
    0,
    1,
  )
  const critExpectedDamage =
    finalCritRate * baseDamage +
    (1 - finalCritRate) * divide(baseDamage, effectiveCritDamage)
  const baseHitRate = divide(
    value.allyHit,
    value.allyHit + value.enemyEvasion,
  )
  const finalHitRate = clamp(
    baseHitRate + autoHitBonus + value.bonusHitRate - value.enemyDodgeRate,
    0,
    1,
  )
  const finalDamage = finalHitRate * (critExpectedDamage + value.hpDamage)

  return {
    baseAttackPower,
    attackPower,
    effectiveSkillMultiplier,
    defenseValue,
    reconState,
    airControlState,
    formationAdjust,
    stateDamageBonus,
    stateHitBonus,
    damageModifier,
    levelModifier,
    defenseModifier,
    effectiveCritDamage,
    baseDamage,
    baseCritRate,
    finalCritRate,
    critExpectedDamage,
    baseHitRate,
    finalHitRate,
    finalDamage,
    display: {
      finalDamage: displayNumber(finalDamage),
      baseDamage: displayNumber(baseDamage),
      critExpectedDamage: displayNumber(critExpectedDamage),
    },
  }
}

const caseDefinitions = [
  {
    id: 'default-air-torpedo-single',
    purpose: '锁定当前默认值、鱼雷机基础攻击、制空均势和默认命中/暴击期望。',
    overrides: {},
  },
  {
    id: 'shelling-zero-defense-boundary',
    purpose: '锁定 defense<=0 时防御衰减归零的现有行为。',
    overrides: {
      damageType: 'shelling',
      formation: 'wheel',
      shelling: 0,
      enemyArmor: 0,
      skillMultiplier: 100,
      allyLevel: 90,
      enemyLevel: 150,
    },
  },
  {
    id: 'crit-rate-clamped-to-zero',
    purpose: '锁定最终暴击率的下界夹紧。',
    overrides: {
      extraCritRate: -5,
      antiCritRate: 5,
    },
  },
  {
    id: 'air-control-superior-with-manual-bonus',
    purpose: '锁定航空伤害使用制空修正，并叠加手动增伤。',
    overrides: {
      damageType: 'air',
      allyAirControl: 130,
      enemyAirControl: 100,
      reconBonus: 0.1,
    },
  },
  {
    id: 'shelling-equal-recon-single',
    purpose: '锁定索敌相等时的同航修正以及单纵阵炮击增伤。',
    overrides: {
      damageType: 'shelling',
      shelling: 1000,
      enemyArmor: 500,
      allyRecon: 100,
      enemyRecon: 100,
      allyAirControl: 100,
      enemyAirControl: 100,
      skillMultiplier: 700,
      critDamage: 1.5,
      ammoModifier: 1,
      favorBonus: 0,
      allyLevel: 80,
      enemyLevel: 80,
    },
  },
  {
    id: 'wedge-formation-crit-bonus',
    purpose: '锁定梯形阵的暴击率和暴击伤害加成。',
    overrides: {
      formation: 'wedge',
    },
  },
  {
    id: 'level-modifier-upper-clamp',
    purpose: '锁定等级修正最高为 1.5 倍。',
    overrides: {
      allyLevel: 150,
      enemyLevel: 1,
    },
  },
  {
    id: 'fixed-damage-with-zero-variable-damage',
    purpose: '锁定可变伤害为零时固定伤害仍乘最终命中率。',
    overrides: {
      damageType: 'special',
      specialAttackSource1: 0,
      specialAttackSource2: 0,
      enemyArmor: 0,
      hpDamage: 500,
    },
  },
]

const sourceText = await readFile(sourcePath, 'utf8')
const fixture = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  sourcePath: path.relative(process.cwd(), sourcePath).split(path.sep).join('/'),
  sourceSha256: createHash('sha256').update(sourceText, 'utf8').digest('hex'),
  storageKey: 'dov-calc:damage-calculator:v5',
  numericTolerance: 1e-9,
  defaults,
  cases: caseDefinitions.map((definition) => ({
    ...definition,
    expected: calculate(definition.overrides),
  })),
  storageContract: {
    stringKeys: {
      damageType: ['shelling', 'torpedo', 'air', 'bombing', 'airTorpedo', 'antiAir', 'special'],
      formation: ['single', 'wheel', 'wedge'],
    },
    numericFields: Object.keys(defaults).filter(
      (key) => key !== 'damageType' && key !== 'formation',
    ),
    invalidJsonFallback: 'defaults',
    invalidStringValueBehavior: 'ignore-and-keep-default',
    finiteNumericStringBehavior: 'convert-to-number',
  },
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8')
console.log(
  `Damage calculator golden fixture written: ${outputPath} (${fixture.cases.length} cases).`,
)

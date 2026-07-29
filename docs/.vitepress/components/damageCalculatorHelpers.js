export const STORAGE_KEY = 'dov-calc:damage-calculator:v5'

export function readDamageValue(values, key) {
  const value = Number(values[key])
  return Number.isFinite(value) ? value : 0
}

export function pickStoredDamageValues(parsed, defaults, stringStorageKeys, isValidString) {
  const parsedValues = {}
  Object.keys(defaults).forEach((key) => {
    const value = parsed[key]
    if (stringStorageKeys.has(key)) {
      if (isValidString(key, value)) {
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
}

export function snapshotDamageValues(values, defaults, stringStorageKeys) {
  const snapshot = {}
  Object.keys(defaults).forEach((key) => {
    snapshot[key] = stringStorageKeys.has(key) ? values[key] : readDamageValue(values, key)
  })
  return snapshot
}

export function evaluateState(ally, enemy, table, group) {
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

export function formatStateLabel(state, name) {
  const list = [state.label]
  if (state.damage || state.hit) {
    list.push(`伤害${formatPercent(state.damage)}、命中${formatPercent(state.hit)}`)
  } else {
    list.push(`无额外${name}修正`)
  }
  return list.join(' ')
}

export function describeDamageAssumptions({
  damageType,
  defenseType,
  formationName,
  reconLabel,
  airControlLabel,
  autoDamageBonus,
  autoHitBonus,
}) {
  return [
    { label: '伤害类型', value: damageType },
    { label: '防御口径', value: defenseType === 'armor' ? '装甲' : '对空' },
    { label: '阵型假设', value: formationName },
    { label: '索敌状态', value: reconLabel },
    { label: '制空状态', value: airControlLabel },
    { label: '自动增伤/命中', value: `${formatPercent(autoDamageBonus)} / ${formatPercent(autoHitBonus)}` },
  ]
}

export function calculateDamage(values, config) {
  const read = (key) => readDamageValue(values, key)
  const attackGetter = config.attackByType[values.damageType] || config.attackByType.shelling
  const baseAttackPower = attackGetter(read)
  const attackPower = (baseAttackPower + read('attackFlatBonus')) * (1 + read('skillAttackBonus'))
  const effectiveSkillMultiplier = safeDivide(read('skillMultiplier'), 100)
  const reconState = evaluateState(read('allyRecon'), read('enemyRecon'), config.reconStateByGroup.combat, 'recon')
  const airControlState = evaluateState(read('allyAirControl'), read('enemyAirControl'), config.reconStateByGroup.air, 'air')
  const formation = config.formationBonus[values.formation] || config.formationBonus.single
  const isCombat = config.formationByType[values.damageType]?.group === 'combat'
  const env = isCombat ? 'combat' : 'air'
  const formationAdjust = {
    damage: formation[env]?.damage || 0,
    hit: formation[env]?.hit || 0,
    critRate: formation.critRate,
    critDamage: formation.critDamage,
    critLabel: values.formation === 'wedge' ? '梯形阵（提升暴击）' : '',
    env,
  }
  const defenseType = config.defenseByType[values.damageType] || 'armor'
  const defenseValue = defenseType === 'armor' ? read('enemyArmor') : read('enemyAirDefense')
  const stateDamageBonus = config.reconDamageTypes.has(values.damageType)
    ? reconState.damage
    : config.airControlDamageTypes.has(values.damageType)
      ? airControlState.damage
      : 0
  const stateHitBonus = reconState.hit + airControlState.hit
  const autoDamageBonus = stateDamageBonus + formationAdjust.damage
  const autoHitBonus = stateHitBonus + formationAdjust.hit
  const damageModifier = (
    1
    + read('favorBonus')
    + read('talentBonus')
    + read('skillDamageBonus')
    + read('equipmentDamageBonus')
    + read('raguzDamageBonus')
    + read('flagshipBonus')
    + read('tieUpBonus')
    + read('reconBonus')
    + autoDamageBonus
  )
  const levelModifier = clamp(1 + 0.02 * (read('allyLevel') - read('enemyLevel')), 0.5, 1.5)
  const defenseModifier = defenseValue <= 0 || Number.isNaN(defenseValue)
    ? 0
    : attackPower / (attackPower + 1.3 * defenseValue)
  const effectiveCritDamage = read('critDamage') + formationAdjust.critDamage + read('extraCritDamage')
  const baseDamage = (
    attackPower
    * effectiveSkillMultiplier
    * defenseModifier
    * effectiveCritDamage
    * read('ammoModifier')
    * damageModifier
    * read('damageReduction')
    * levelModifier
  )
  const allyLuck = read('allyLuck')
  const enemyLuck = read('enemyLuck')
  const baseCritRate = allyLuck <= 0 || enemyLuck <= 0
    ? 0
    : (1 - (enemyLuck / (enemyLuck + allyLuck / 3)) ** 0.8) * 0.8
  const finalCritRate = clampRate(baseCritRate + read('extraCritRate') + formationAdjust.critRate - read('antiCritRate'))
  const critExpectedDamage = (
    finalCritRate * baseDamage
    + (1 - finalCritRate) * safeDivide(baseDamage, effectiveCritDamage)
  )
  const baseHitRate = safeDivide(read('allyHit'), read('allyHit') + read('enemyEvasion'))
  const finalHitRate = clampRate(baseHitRate + autoHitBonus + read('bonusHitRate') - read('enemyDodgeRate'))
  const finalDamage = finalHitRate * (critExpectedDamage + read('hpDamage'))

  return {
    baseAttackPower,
    attackPower,
    effectiveSkillMultiplier,
    reconState,
    airControlState,
    formationAdjust,
    defenseType,
    defenseValue,
    stateDamageBonus,
    stateHitBonus,
    autoDamageBonus,
    autoHitBonus,
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
      finalDamage: formatNumber(finalDamage),
      baseDamage: formatNumber(baseDamage),
      critExpectedDamage: formatNumber(critExpectedDamage),
    },
  }
}

export function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return min
  }
  return Math.min(max, Math.max(min, value))
}

export function clampRate(value) {
  return clamp(value, 0, 1)
}

export function safeDivide(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
    return 0
  }
  return a / b
}

export function formatNumber(value) {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatPercent(value) {
  return `${formatNumber(value * 100)}%`
}

export function formatMultiplier(value) {
  return `${formatNumber(value)}x`
}

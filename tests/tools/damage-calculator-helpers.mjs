import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  STORAGE_KEY,
  calculateDamage,
  evaluateState,
  pickStoredDamageValues,
  snapshotDamageValues,
} from '../../docs/.vitepress/components/damageCalculatorHelpers.js'

const fixture = JSON.parse(
  await readFile(new URL('../fixtures/damage-calculator-golden.json', import.meta.url), 'utf8'),
)

const stringKeys = new Set(Object.keys(fixture.storageContract.stringKeys))

function isValidStoredString(key, value) {
  return fixture.storageContract.stringKeys[key]?.includes(value) ?? false
}

assert.equal(STORAGE_KEY, fixture.storageKey)
assert.deepEqual(snapshotDamageValues(fixture.defaults, fixture.defaults, stringKeys), fixture.defaults)

const stored = pickStoredDamageValues(
  {
    damageType: 'shelling',
    formation: 'invalid',
    aviation: '1274.5',
    enemyArmor: Number.POSITIVE_INFINITY,
    allyLuck: 'not-a-number',
  },
  fixture.defaults,
  stringKeys,
  isValidStoredString,
)

assert.deepEqual(stored, {
  damageType: 'shelling',
  aviation: 1274.5,
})

const combatTable = {
  superior: { damage: 0.15, hit: 0.2, label: 'superior' },
  normal: { damage: 0.08, hit: 0.1, label: 'normal' },
  equal: { damage: 0.08, hit: 0.1, label: 'equal' },
  reverse: { damage: -0.08, hit: -0.1, label: 'reverse' },
  poor: { damage: -0.15, hit: -0.1, label: 'poor' },
}

assert.deepEqual(evaluateState(100, 100, combatTable, 'recon'), { ...combatTable.equal, group: 'recon' })
assert.deepEqual(evaluateState(130, 100, combatTable, 'recon'), { ...combatTable.superior, group: 'recon' })
assert.deepEqual(evaluateState(105, 100, combatTable, 'recon'), { ...combatTable.normal, group: 'recon' })
assert.deepEqual(evaluateState(90, 100, combatTable, 'recon'), { ...combatTable.reverse, group: 'recon' })
assert.deepEqual(evaluateState(80, 100, combatTable, 'recon'), { ...combatTable.poor, group: 'recon' })

const calculationConfig = {
  attackByType: {
    shelling: (read) => read('shelling'),
    torpedo: (read) => read('torpedo'),
    air: (read) => read('aviation'),
    bombing: (read) => read('aviation') + read('bombing'),
    airTorpedo: (read) => read('aviation') + read('torpedoBomber'),
    antiAir: (read) => read('antiAir'),
    special: (read) => read('specialAttackSource1') + read('specialAttackSource2'),
  },
  reconStateByGroup: {
    combat: {
      superior: { damage: 0.15, hit: 0.2, label: 'superior' },
      normal: { damage: 0.08, hit: 0.1, label: 'normal' },
      equal: { damage: 0.08, hit: 0.1, label: 'equal' },
      reverse: { damage: -0.08, hit: -0.1, label: 'reverse' },
      poor: { damage: -0.15, hit: -0.1, label: 'poor' },
    },
    air: {
      superior: { damage: 0.15, hit: 0.2, label: 'superior' },
      normal: { damage: 0.08, hit: 0.1, label: 'normal' },
      equal: { damage: 0, hit: 0, label: 'equal' },
      reverse: { damage: -0.08, hit: -0.1, label: 'reverse' },
      poor: { damage: -0.15, hit: -0.1, label: 'poor' },
    },
  },
  formationByType: {
    shelling: { group: 'combat' },
    torpedo: { group: 'combat' },
    air: { group: 'air' },
    bombing: { group: 'air' },
    airTorpedo: { group: 'air' },
    antiAir: { group: 'air' },
    special: { group: 'combat' },
  },
  defenseByType: {
    shelling: 'armor',
    torpedo: 'armor',
    air: 'airDefense',
    bombing: 'airDefense',
    airTorpedo: 'airDefense',
    antiAir: 'armor',
    special: 'armor',
  },
  formationBonus: {
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
  },
  reconDamageTypes: new Set(['shelling', 'torpedo']),
  airControlDamageTypes: new Set(['air', 'bombing', 'airTorpedo']),
}

function assertClose(actual, expected, path) {
  assert.equal(Number.isFinite(actual), true, `${path}: actual is not finite`)
  assert(Math.abs(actual - expected) <= fixture.numericTolerance, `${path}: expected ${expected}, got ${actual}`)
}

for (const testCase of fixture.cases) {
  const actual = calculateDamage({ ...fixture.defaults, ...testCase.overrides }, calculationConfig)
  for (const key of [
    'baseAttackPower',
    'attackPower',
    'effectiveSkillMultiplier',
    'defenseValue',
    'stateDamageBonus',
    'stateHitBonus',
    'damageModifier',
    'levelModifier',
    'defenseModifier',
    'effectiveCritDamage',
    'baseDamage',
    'baseCritRate',
    'finalCritRate',
    'critExpectedDamage',
    'baseHitRate',
    'finalHitRate',
    'finalDamage',
  ]) {
    assertClose(actual[key], testCase.expected[key], `${testCase.id}.${key}`)
  }
  for (const key of ['damage', 'hit', 'critRate', 'critDamage']) {
    assertClose(actual.formationAdjust[key], testCase.expected.formationAdjust[key], `${testCase.id}.formationAdjust.${key}`)
  }
  for (const stateName of ['reconState', 'airControlState']) {
    for (const key of ['damage', 'hit']) {
      assertClose(actual[stateName][key], testCase.expected[stateName][key], `${testCase.id}.${stateName}.${key}`)
    }
  }
  assert.deepEqual(actual.display, testCase.expected.display)
}

console.log('Damage calculator helper contracts passed.')

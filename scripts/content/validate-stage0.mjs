import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const requiredJsonFiles = [
  'content/governance/source-assets.json',
  'content/schemas/page.schema.json',
  'content/schemas/data-record.schema.json',
  'content/schemas/source-asset.schema.json',
  'content/governance/version-baselines.json',
  'tests/fixtures/equipment-baseline.json',
  'tests/fixtures/damage-calculator-golden.json',
]
const requiredMarkdownFiles = [
  'content/governance/source-policy.md',
  'content/governance/terminology.md',
  'content/governance/roles-and-review.md',
  'content/governance/url-and-id-policy.md',
  'content/governance/README.md',
  'content/schemas/README.md',
]

const failures = []

async function readJson(relativePath) {
  try {
    return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`)
    return null
  }
}

for (const relativePath of requiredJsonFiles) {
  await readJson(relativePath)
}

for (const relativePath of requiredMarkdownFiles) {
  try {
    const text = await readFile(path.join(root, relativePath), 'utf8')
    if (text.trim().length < 80) {
      failures.push(`${relativePath}: 文档内容过短`)
    }
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`)
  }
}

const inventory = await readJson('content/governance/source-assets.json')
if (inventory) {
  if (inventory.assetCount !== 29 || inventory.assets?.length !== 29) {
    failures.push(
      `source-assets.json: 期望 29 项，实际 ${inventory.assets?.length ?? 0} 项`,
    )
  }
  const expectedKinds = { docx: 13, xlsx: 1, image: 15 }
  for (const [assetType, expected] of Object.entries(expectedKinds)) {
    const actual = inventory.assets?.filter(
      (asset) => asset.assetType === assetType,
    ).length
    if (actual !== expected) {
      failures.push(
        `source-assets.json: ${assetType} 期望 ${expected} 项，实际 ${actual} 项`,
      )
    }
  }

  const ids = inventory.assets?.map((asset) => asset.id) ?? []
  if (new Set(ids).size !== ids.length) {
    failures.push('source-assets.json: 存在重复资产 ID')
  }

  const hashes = inventory.assets?.map((asset) => asset.hashes?.sha256) ?? []
  if (hashes.some((hash) => !/^[a-f0-9]{64}$/.test(hash ?? ''))) {
    failures.push('source-assets.json: 存在非法 SHA-256')
  }
  if (new Set(hashes).size !== hashes.length) {
    failures.push('source-assets.json: 存在内容哈希重复，需先确认是否为重复资产')
  }

  const publicLeak = inventory.assets?.filter(
    (asset) =>
      ['pending', 'restricted'].includes(asset.permission) &&
      Object.values(asset.publicRelease ?? {}).some((value) => value === true),
  )
  if (publicLeak?.length) {
    failures.push(
      `source-assets.json: ${publicLeak.length} 个待授权/受限资产被错误标记为可公开`,
    )
  }

  const missingResponsibility = inventory.assets?.filter(
    (asset) => !Array.isArray(asset.owners) || asset.owners.length === 0,
  )
  if (missingResponsibility?.length) {
    failures.push(
      `source-assets.json: ${missingResponsibility.length} 个资产没有责任角色`,
    )
  }

  const assetSchema = await readJson('content/schemas/source-asset.schema.json')
  if (assetSchema) {
    const allowedProperties = new Set(Object.keys(assetSchema.properties ?? {}))
    const requiredProperties = assetSchema.required ?? []
    for (const asset of inventory.assets ?? []) {
      const missing = requiredProperties.filter(
        (property) => asset[property] === undefined,
      )
      if (missing.length) {
        failures.push(
          `source-assets.json: ${asset.id ?? '(missing id)'} 缺少 ${missing.join(', ')}`,
        )
      }

      const unknown = Object.keys(asset).filter(
        (property) => !allowedProperties.has(property),
      )
      if (assetSchema.additionalProperties === false && unknown.length) {
        failures.push(
          `source-assets.json: ${asset.id ?? '(missing id)'} 包含未定义字段 ${unknown.join(', ')}`,
        )
      }
    }
  }
}

const equipment = await readJson('tests/fixtures/equipment-baseline.json')
if (equipment) {
  if (equipment.itemCount !== 93) {
    failures.push(
      `equipment-baseline.json: 期望 93 项，实际 ${equipment.itemCount}`,
    )
  }
  if (equipment.metadata?.version !== '20260511') {
    failures.push(
      `equipment-baseline.json: 期望版本 20260511，实际 ${equipment.metadata?.version}`,
    )
  }
  if (equipment.missingRequired?.length) {
    failures.push(
      `equipment-baseline.json: ${equipment.missingRequired.length} 个必填字段缺失`,
    )
  }
  if (equipment.primaryKey !== 'id') {
    failures.push('equipment-baseline.json: primaryKey 应为 id')
  }
  if (equipment.primaryKeyEvidence?.duplicateIds?.length) {
    failures.push('equipment-baseline.json: id 存在重复')
  }
  if (equipment.primaryKeyEvidence?.missingIds?.length) {
    failures.push('equipment-baseline.json: id 存在缺失或非整数')
  }
  if (equipment.primaryKeyEvidence?.contiguousFromOne !== true) {
    failures.push('equipment-baseline.json: id 未从 1 连续至 93')
  }
  if (equipment.images?.missing?.length) {
    failures.push(
      `equipment-baseline.json: ${equipment.images.missing.length} 个图片引用缺失`,
    )
  }
  if (equipment.images?.hardcodedBaseReferences !== 93) {
    failures.push(
      `equipment-baseline.json: 期望取证 93 个硬编码部署路径，实际 ${equipment.images?.hardcodedBaseReferences}`,
    )
  }
}

const calculator = await readJson('tests/fixtures/damage-calculator-golden.json')
if (calculator) {
  if (!Array.isArray(calculator.cases) || calculator.cases.length < 5) {
    failures.push('damage-calculator-golden.json: 至少需要 5 个黄金用例')
  }
  if (calculator.storageKey !== 'dov-calc:damage-calculator:v5') {
    failures.push('damage-calculator-golden.json: localStorage key 不一致')
  }
  const defaultCase = calculator.cases?.find(
    (testCase) => testCase.id === 'default-air-torpedo-single',
  )
  if (
    Math.abs(
      (defaultCase?.expected?.finalDamage ?? Number.NaN) -
        43980.83701984122,
    ) > 1e-9
  ) {
    failures.push('damage-calculator-golden.json: 默认终伤基线不一致')
  }
  if (defaultCase?.expected?.display?.finalDamage !== '43,980.84') {
    failures.push('damage-calculator-golden.json: 默认显示基线不一致')
  }
}

const versions = await readJson('content/governance/version-baselines.json')
if (versions) {
  const equipmentDrift = versions.driftFindings?.find(
    (finding) => finding.id === 'equipment-guide-newer-than-lookup-data',
  )
  if (!equipmentDrift) {
    failures.push('version-baselines.json: 未记录装备版本漂移')
  }
  if (equipmentDrift?.severity !== 'release-blocking-until-reviewed') {
    failures.push('version-baselines.json: 装备版本漂移未设置发布复核阻断')
  }
}

if (failures.length > 0) {
  console.error(`Stage 0 validation failed (${failures.length}):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Stage 0 validation passed.')

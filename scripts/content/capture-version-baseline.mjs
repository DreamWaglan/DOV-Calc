import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const inventoryPath = path.resolve(
  process.argv[2] ?? 'content/governance/source-assets.json',
)
const equipmentPath = path.resolve(
  process.argv[3] ?? 'tests/fixtures/equipment-baseline.json',
)
const outputPath = path.resolve(
  process.argv[4] ?? 'content/governance/version-baselines.json',
)

const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'))
const equipment = JSON.parse(await readFile(equipmentPath, 'utf8'))

const equipmentGuide = inventory.assets.find((asset) =>
  /装备速查表20260712/.test(asset.title),
)

if (!equipmentGuide) {
  console.error('未在源资产台账中找到 20260712 装备速查表。')
  process.exit(1)
}

const baseline = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  baselines: [
    {
      id: 'equipment-lookup-dataset',
      domain: 'equipment',
      sourcePath: equipment.sourcePath,
      version: equipment.metadata?.version ?? null,
      recordCount: equipment.itemCount,
      sha256: equipment.sourceSha256,
      status: 'needs-review',
    },
    {
      id: 'equipment-one-image-guide',
      domain: 'equipment',
      sourceAssetId: equipmentGuide.id,
      sourcePath: equipmentGuide.origin.path,
      version: '20260712',
      sha256: equipmentGuide.hashes.sha256,
      status: 'needs-review',
    },
  ],
  driftFindings: [
    {
      id: 'equipment-guide-newer-than-lookup-data',
      domain: 'equipment',
      olderBaselineId: 'equipment-lookup-dataset',
      olderVersion: equipment.metadata?.version ?? null,
      newerBaselineId: 'equipment-one-image-guide',
      newerVersion: '20260712',
      severity: 'release-blocking-until-reviewed',
      disposition:
        '在事实审核人确认差异并更新或明确归档前，不得把当前装备 JSON 标记为最新版本。',
      ownerRole: '装备数据维护者',
      reviewerRole: '事实审核人',
    },
  ],
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8')
console.log(`Version baseline written: ${outputPath}.`)

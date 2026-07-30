import { createHash } from 'node:crypto'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'

function runNode(relativePath) {
  const result = spawnSync(process.execPath, [path.normalize(relativePath)], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

runNode('scripts/content/validate-stage3.mjs')
runNode('scripts/content/validate-advanced-content.mjs')
runNode('scripts/content/validate-document-structures.mjs')
runNode('scripts/content/validate-formulas.mjs')
runNode('tests/tools/damage-calculator-helpers.mjs')
runNode('tests/tools/equipment-lookup-model.mjs')
runNode('scripts/content/validate-basic-attack-dataset.mjs')
runNode('tests/tools/basic-attack-model.mjs')

const failures = []
const pages = await loadPages()
const byId = new Map(pages.map((page) => [page.frontmatter.id, page]))

const requiredPages = new Map([
  ['combat-pvp-arena', '/combat/pvp-arena'],
  ['combat-encounter', '/combat/encounter'],
  ['combat-endless-sea', '/combat/endless-sea'],
  ['mechanics-index', '/mechanics/'],
  ['mechanics-damage-model', '/mechanics/damage-model'],
  ['topic-laguz', '/topics/laguz'],
  ['data-index', '/data/'],
  ['data-basic-attack-cd', '/data/basic-attack-cd'],
])

for (const [id, route] of requiredPages) {
  const page = byId.get(id)
  if (!page) {
    failures.push(`missing Stage 4 page: ${id}`)
  } else if (page.route !== route) {
    failures.push(`${id}: expected route ${route}, found ${page.route}`)
  }
}

const authorizedSourceByPage = new Map([
  ['combat-pvp-arena', 'src-7d080e8d651b'],
  ['combat-encounter', 'src-d35e870ffcd7'],
  ['combat-endless-sea', 'src-51475ba227c9'],
  ['mechanics-damage-model', 'src-c8852cf69a7b'],
  ['topic-laguz', 'src-e2d43eca15b2'],
])

for (const [pageId, assetId] of authorizedSourceByPage) {
  const page = byId.get(pageId)
  if (!page) continue
  const sources = page.frontmatter.sources ?? []
  const authorized = sources.find((source) => source.assetId === assetId)
  if (
    !authorized ||
    authorized.permission !== 'authorized' ||
    authorized.publicUse?.body !== true ||
    authorized.publicUse?.asset !== false
  ) {
    failures.push(
      `${pageId}: authorized source ${assetId} must enable body use and keep raw assets private`,
    )
  }
}

const dataSource = byId
  .get('data-basic-attack-cd')
  ?.frontmatter.sources?.find(
    (source) => source.assetId === 'src-0c5b7db892f6',
  )
if (
  !dataSource ||
  dataSource.permission !== 'authorized' ||
  dataSource.publicUse?.body !== true ||
  dataSource.publicUse?.asset !== false
) {
  failures.push(
    'data-basic-attack-cd: reviewed XLSX source must enable body use and keep raw assets private',
  )
}

const stage4Map = await readJson('content/migration/stage4-docx-map.json')
const sourceRegistry = await readJson('content/governance/source-assets.json')
const sourceById = new Map(
  (sourceRegistry.assets ?? []).map((source) => [source.id, source]),
)
const serializedMap = JSON.stringify(stage4Map)

if (stage4Map.assets?.length !== 5) {
  failures.push(
    `Stage 4 DOCX map must contain 5 assets, found ${stage4Map.assets?.length ?? 0}`,
  )
}
if (/[A-Za-z]:[\\/]/.test(serializedMap)) {
  failures.push('Stage 4 DOCX map contains an absolute Windows path')
}
if (serializedMap.includes('\uFFFD') || /鍓嶈|娓告垙|閬亣/.test(serializedMap)) {
  failures.push('Stage 4 DOCX map contains mojibake')
}

for (const asset of stage4Map.assets ?? []) {
  const registered = sourceById.get(asset.assetId)
  if (!registered) {
    failures.push(`${asset.assetId}: Stage 4 source is not registered`)
    continue
  }
  if (
    asset.permission !== registered.permission ||
    asset.authorizationEvidenceId !== registered.authorization?.evidenceId ||
    asset.reviewStatus !== 'migration-review-required' ||
    asset.publishable !== false ||
    asset.hash !== registered.hashes?.sha256 ||
    asset.sourceFileName !== registered.title
  ) {
    failures.push(`${asset.assetId}: Stage 4 map differs from the source ledger`)
  }
  if ((asset.headingOutline?.length ?? 0) > 60) {
    failures.push(`${asset.assetId}: heading outline exceeds 60 entries`)
  }
  const target = byId.get(asset.suggestedPageId)
  if (!target) {
    failures.push(
      `${asset.assetId}: mapped page ${asset.suggestedPageId} does not exist`,
    )
  }
}

const basicAttack = await readJson(
  'content/imports/xlsx/basic-attack/records.json',
)
if (
  basicAttack.permission !== 'authorized' ||
  basicAttack.authorizationEvidenceId !== 'auth-user-declaration-20260730' ||
  basicAttack.reviewStatus !== 'migration-review-required' ||
  basicAttack.publishable !== false ||
  basicAttack.totalRecords !== 225 ||
  basicAttack.worksheetSummaries?.length !== 7 ||
  basicAttack.records?.length !== 225
) {
  failures.push(
    'basic attack XLSX must remain a 7-sheet, 225-record migration-review import',
  )
}

const dataPage = byId.get('data-basic-attack-cd')
if (
  dataPage?.frontmatter.status !== 'current' ||
  !dataPage?.body.includes('225/225') ||
  !dataPage?.body.includes('原始 XLSX 与批量下载保持关闭') ||
  !dataPage?.body.includes('<BasicAttackExplorer />')
) {
  failures.push(
    'data-basic-attack-cd: reviewed count, public boundary, and shared explorer must be visible',
  )
}

const canonicalBasicAttackPath =
  'docs/.vitepress/data/basic-attack-data.json'
const canonicalBasicAttackExists = await access(
  path.join(root, canonicalBasicAttackPath),
).then(
  () => true,
  () => false,
)
if (!canonicalBasicAttackExists) {
  failures.push(`${canonicalBasicAttackPath}: reviewed public projection is missing`)
}
for (const forbiddenPath of [
  'docs/public/data/basic-attack-data.json',
  'docs/public/basic-attack-data.json',
]) {
  const exists = await access(path.join(root, forbiddenPath)).then(
    () => true,
    () => false,
  )
  if (exists) failures.push(`${forbiddenPath}: download-style dataset copy is forbidden`)
}

const damagePage = byId.get('mechanics-damage-model')
const damageToolPage = byId.get('tool-damage-calculator')
if (
  !damagePage?.body.includes('不是官方结算器') ||
  !damagePage?.body.includes('黄金样例') ||
  !damageToolPage?.body.includes('玩家维护的估算模型')
) {
  failures.push('damage model/tool pages must expose model and evidence boundaries')
}

const equipmentPage = byId.get('tool-equipment-lookup')
if (
  equipmentPage?.frontmatter.status !== 'stale' ||
  equipmentPage?.frontmatter.gameVersion !== '2026-05'
) {
  failures.push('equipment lookup must remain stale on the 2026-05 baseline')
}

const equipmentData = await readJson(
  'docs/.vitepress/data/equipment-data.json',
)
const equipmentBaseline = await readJson(
  'tests/fixtures/equipment-baseline.json',
)
const baselineCompatibleItems = equipmentBaseline.sourcePath?.includes(
  'docs/.vuepress/',
)
  ? equipmentData.items.map((item) => ({
      ...item,
      image: `/DOV-Calc${item.image}`,
    }))
  : equipmentData.items
const equipmentHash = createHash('sha256')
  .update(JSON.stringify(baselineCompatibleItems), 'utf8')
  .digest('hex')
if (
  equipmentData.items.length !== 93 ||
  equipmentHash !== equipmentBaseline.canonicalItemsSha256
) {
  failures.push('equipment data differs from the 93-record golden baseline')
}

const [
  damageComponent,
  damageHelpers,
  equipmentComponent,
  equipmentModel,
  captureDamage,
  captureEquipment,
] = await Promise.all([
  readFile(
    path.join(root, 'docs/.vitepress/components/DamageCalculator.vue'),
    'utf8',
  ),
  readFile(
    path.join(
      root,
      'docs/.vitepress/components/damageCalculatorHelpers.js',
    ),
    'utf8',
  ),
  readFile(
    path.join(root, 'docs/.vitepress/components/EquipmentLookup.vue'),
    'utf8',
  ),
  readFile(
    path.join(root, 'docs/.vitepress/components/equipmentLookupModel.js'),
    'utf8',
  ),
  readFile(
    path.join(root, 'scripts/content/capture-damage-baseline.mjs'),
    'utf8',
  ),
  readFile(
    path.join(root, 'scripts/content/capture-equipment-baseline.mjs'),
    'utf8',
  ),
])

if (
  !damageComponent.includes('calculateDamage') ||
  !damageHelpers.includes('export function calculateDamage') ||
  !equipmentComponent.includes('filterEquipmentItems') ||
  !equipmentModel.includes('export function filterEquipmentItems')
) {
  failures.push('tool UI logic was not extracted into testable pure modules')
}
if (
  captureDamage.includes('docs/.vuepress') ||
  captureEquipment.includes('docs/.vuepress')
) {
  failures.push('baseline capture scripts still default to legacy VuePress paths')
}

const report = {
  schemaVersion: 1,
  check: 'stage4-advanced-content-and-tools',
  summary: {
    pages: pages.length,
    requiredPages: requiredPages.size,
    advancedDocxImports: stage4Map.assets?.length ?? 0,
    basicAttackRecords: basicAttack.records?.length ?? 0,
    damageGoldenCases: 8,
    equipmentRecords: equipmentData.items.length,
    failures: failures.length,
  },
  requiredPageIds: [...requiredPages.keys()],
  authorizedSourceIds: [...authorizedSourceByPage.values()],
  releasedStructuredDataSourceIds: ['src-0c5b7db892f6'],
  failures,
}

const reportPath = await writeReport(
  'stage4-advanced-content-and-tools',
  report,
)
printResult('Stage 4 advanced content and tool validation', failures, reportPath)

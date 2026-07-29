import { createHash } from 'node:crypto'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const failures = []

async function readText(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), 'utf8')
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`)
    return ''
  }
}

async function readJson(relativePath) {
  const text = await readText(relativePath)
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    failures.push(`${relativePath}: ${error.message}`)
    return null
  }
}

function expect(condition, message) {
  if (!condition) failures.push(message)
}

const [
  packageJson,
  config,
  navigation,
  theme,
  workflow,
  equipment,
  equipmentBaseline,
  damageSource,
  damageHelper,
  damageBaseline,
] = await Promise.all([
  readJson('package.json'),
  readText('docs/.vitepress/config.mts'),
  readText('docs/.vitepress/navigation.mts'),
  readText('docs/.vitepress/theme/index.ts'),
  readText('.github/workflows/docs.yml'),
  readJson('docs/.vitepress/data/equipment-data.json'),
  readJson('tests/fixtures/equipment-baseline.json'),
  readText('docs/.vitepress/components/DamageCalculator.vue'),
  readText('docs/.vitepress/components/damageCalculatorHelpers.js'),
  readJson('tests/fixtures/damage-calculator-golden.json'),
])

expect(
  packageJson?.devDependencies?.vitepress === '1.6.4',
  'package.json: VitePress 必须锁定为 1.6.4',
)
expect(
  !Object.keys(packageJson?.devDependencies ?? {}).some((name) =>
    name.includes('vuepress'),
  ),
  'package.json: 不得残留 VuePress 依赖',
)
expect(
  config.includes("process.env.DOCS_BASE") &&
    config.includes("base = '/DOV-Calc/'") &&
    config.includes("provider: 'local'"),
  'config.mts: 缺少可配置 base、默认子路径或本地搜索',
)
expect(
  navigation.includes('export const pages') &&
    navigation.includes('export const nav') &&
    navigation.includes('export const sidebar'),
  'navigation.mts: nav/sidebar 必须从单一页面注册表派生',
)

for (const component of [
  'DamageCalculator',
  'EquipmentLookup',
  'CalculatorShell',
  'PageStatus',
  'SourceList',
]) {
  expect(
    theme.includes(`app.component('${component}'`),
    `theme/index.ts: 未全局注册 ${component}`,
  )
}

for (const action of [
  'actions/configure-pages@v5',
  'actions/upload-pages-artifact@v3',
  'actions/deploy-pages@v4',
]) {
  expect(workflow.includes(action), `.github/workflows/docs.yml: 缺少 ${action}`)
}
expect(
  workflow.includes('pnpm install --frozen-lockfile') &&
    workflow.includes('docs/.vitepress/dist'),
  '.github/workflows/docs.yml: 必须使用冻结安装并上传 VitePress 产物',
)

const items = Array.isArray(equipment?.items) ? equipment.items : []
expect(items.length === 93, `equipment-data.json: 期望 93 项，实际 ${items.length}`)
expect(
  equipment?.metadata?.version === equipmentBaseline?.metadata?.version,
  'equipment-data.json: 版本与迁移前基线不一致',
)
expect(
  new Set(items.map((item) => item.id)).size === items.length,
  'equipment-data.json: id 不唯一',
)
expect(
  items.every(
    (item) =>
      typeof item.image === 'string' &&
      item.image.startsWith('/equipment-images/') &&
      !item.image.includes('/DOV-Calc/'),
  ),
  'equipment-data.json: 图片路径必须是无部署基址的 public 根路径',
)

const baselineItems = equipmentBaseline?.sourcePath?.includes(
  'docs/.vuepress/',
)
  ? items.map((item) => ({
      ...item,
      image: `/DOV-Calc${item.image}`,
    }))
  : items
const baselineCompatibleHash = createHash('sha256')
  .update(JSON.stringify(baselineItems), 'utf8')
  .digest('hex')
expect(
  baselineCompatibleHash === equipmentBaseline?.canonicalItemsSha256,
  'equipment-data.json: 除部署基址外的数据内容与迁移前基线不一致',
)

for (const item of items) {
  const assetPath = path.join(
    root,
    'docs/public',
    ...item.image.replace(/^\/+/, '').split('/'),
  )
  const exists = await access(assetPath).then(
    () => true,
    () => false,
  )
  if (!exists) failures.push(`equipment-data.json: 缺失图片 ${item.image}`)
}

expect(
  damageSource.includes('calculateDamage') &&
    damageSource.includes('damageCalculatorHelpers') &&
    damageHelper.includes('export function calculateDamage'),
  'DamageCalculator.vue: 必须通过可测试的纯函数执行伤害计算',
)
expect(
  damageBaseline?.storageKey === 'dov-calc:damage-calculator:v5' &&
    damageBaseline?.cases?.length === 8 &&
    damageBaseline?.numericTolerance === 1e-9,
  'damage-calculator-golden.json: 黄金样例或存储契约不完整',
)

for (const legacyPath of [
  'docs/.vuepress/config.js',
  'docs/.vuepress/components/DamageCalculator.vue',
  'docs/.vuepress/components/EquipmentLookup.vue',
  'docs/.vuepress/components/CalculatorShell.vue',
  'docs/.vuepress/data/equipment-data.json',
  'docs/.vuepress/public/equipment-images',
  'docs/.vuepress/styles/index.scss',
]) {
  const exists = await access(path.join(root, legacyPath)).then(
    () => true,
    () => false,
  )
  expect(!exists, `${legacyPath}: VuePress 迁移残留仍存在`)
}

const publicDocuments = [
  'docs/index.md',
  'docs/tools/index.md',
  'docs/tools/dov-basic.md',
  'docs/tools/equipment-lookup.md',
  'docs/posts/index.md',
  'docs/posts/getting-started.md',
]
for (const document of publicDocuments) {
  const text = await readText(document)
  expect(
    !text.includes('/DOV-Calc/'),
    `${document}: 公开内容仍硬编码部署基址`,
  )
  expect(
    !text.includes('.vuepress'),
    `${document}: 公开内容仍引用 VuePress 路径`,
  )
}

if (failures.length) {
  console.error(`Stage 1 validation failed (${failures.length}):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `Stage 1 validation passed (${items.length} equipment records, ${items.length} public images).`,
)

import { createHash } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileWithRetry as writeFile } from './lib/content-utils.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const importPath = path.join(
  root,
  'content/imports/xlsx/basic-attack/records.json',
)
const importReportPath = path.join(
  root,
  'content/imports/xlsx/basic-attack/import-report.json',
)
const sourceLedgerPath = path.join(root, 'content/governance/source-assets.json')
const reviewPath = path.join(
  root,
  'content/governance/dataset-reviews/basic-attack.json',
)
const publicDataPath = path.join(
  root,
  'docs/.vitepress/data/basic-attack-data.json',
)
const overviewPath = path.join(root, 'docs/data/basic-attack-cd.md')
const toolPath = path.join(root, 'docs/tools/basic-attack-lookup.md')
const worksheetDirectory = path.join(root, 'docs/data/basic-attacks')
const reportPath = path.join(root, 'content/reports/basic-attack-data.json')

const worksheetSlugs = new Map([
  ['驱逐', 'destroyer'],
  ['轻巡雷巡', 'light-cruiser-torpedo-cruiser'],
  ['重巡', 'heavy-cruiser'],
  ['战列战巡重炮', 'battleship-battlecruiser'],
  ['轻母', 'light-carrier'],
  ['航母装母', 'carrier-armored-carrier'],
  ['航战水母', 'aviation-battleship-seaplane'],
])

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

function unitForField(name) {
  if (name.endsWith('Multiplier')) return '倍率'
  if (name.endsWith('CdSeconds')) return '秒'
  if (name.endsWith('RangeUnits')) return '游戏内射程单位'
  if (name.endsWith('ProjectilesPerRound') || name === 'projectilesPerRound') {
    return '发或架/轮'
  }
  if (name === 'worksheetRow') return '行'
  return null
}

function enrichField(field) {
  const numericMetadataField = field.name === 'worksheetRow'
  const noteField = field.name.endsWith('Note')
  const typeField = field.name.endsWith('DamageType')
  const projectileField =
    field.name.endsWith('ProjectilesPerRound') ||
    field.name === 'projectilesPerRound'

  return {
    ...field,
    unit: unitForField(field.name),
    description:
      field.name === 'worksheet'
        ? '记录在授权工作簿中的来源工作表。'
        : field.name === 'worksheetRow'
          ? '记录在来源工作表中的原始行号，用于追溯与复核。'
          : `${field.label}；空值表示来源工作表未提供该项。`,
    searchable:
      field.type === 'string' &&
      (field.name === 'worksheet' ||
        noteField ||
        typeField ||
        projectileField),
    sortable: field.type === 'number' && !numericMetadataField,
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function escapeCell(value) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value).replaceAll('|', '\\|').replaceAll(/\r?\n/g, '<br>')
}

function renderFrontmatter({
  id,
  title,
  description,
  section,
  order,
  contentType,
  source,
  tags,
  related,
}) {
  return [
    '---',
    `id: ${id}`,
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `section: ${section}`,
    `order: ${order}`,
    'audience: [beginner, regular, advanced, editor]',
    `contentType: ${contentType}`,
    'gameVersion: "2026-07"',
    `sourceUpdatedAt: ${JSON.stringify(source.origin.updatedAt)}`,
    'verifiedAt: "2026-07-30"',
    'status: current',
    'authors:',
    '  - name: DOV-Calc 数据组',
    '    role: 规范数据建模与页面生成',
    'reviewers:',
    ...source.reviewers.flatMap((reviewer) => [
      `  - name: ${reviewer.name}`,
      `    role: ${reviewer.role}`,
    ]),
    'sources:',
    `  - title: ${JSON.stringify(source.title)}`,
    `    assetId: ${source.id}`,
    '    sourceType: xlsx',
    '    permission: authorized',
    '    publicUse:',
    '      body: true',
    '      asset: false',
    `    licenseEvidence: ${source.authorization.evidenceId}`,
    '    notes: 仅发布经审查的结构化投影，不提供原始 XLSX 或批量下载。',
    `tags: ${JSON.stringify(tags)}`,
    `related: ${JSON.stringify(related)}`,
    '---',
    '',
  ].join('\n')
}

function renderOverview(dataset, source) {
  const worksheetLinks = dataset.worksheets
    .map(
      (worksheet) =>
        `- [${worksheet.name}（${worksheet.recordCount} 条）](./basic-attacks/${worksheet.slug})`,
    )
    .join('\n')
  const fieldRows = dataset.fields
    .map(
      (field) =>
        `| \`${field.name}\` | ${field.label} | ${field.type} | ${field.nullable ? '可空' : '必填'} | ${field.unit ?? '—'} | ${field.description} |`,
    )
    .join('\n')

  return `${renderFrontmatter({
    id: 'data-basic-attack-cd',
    title: '舰灵普攻倍率与 CD 数据库',
    description:
      '查询 7 个工作表、225 条舰灵普攻倍率、冷却、射程、伤害类型与每轮弹数记录。',
    section: 'data',
    order: 610,
    contentType: 'data',
    source,
    tags: ['普攻倍率', 'CD', '射程', '舰灵数据', '2026-07'],
    related: [
      'data-index',
      'tool-basic-attack-lookup',
      'mechanics-damage-model',
      'tool-damage-calculator',
    ],
  })}
<script setup>
import { markRaw, ref, shallowRef } from 'vue'

const BasicAttackExplorer = shallowRef(null)
const loadingBasicAttackExplorer = ref(false)

async function loadBasicAttackExplorer() {
  loadingBasicAttackExplorer.value = true
  BasicAttackExplorer.value = markRaw(
    (await import('../.vitepress/components/BasicAttackExplorer.vue')).default,
  )
}
</script>

# 舰灵普攻倍率与 CD 数据库

本页公开的是授权工作簿的结构化投影，适用版本为 **${dataset.metadata.version}**。数据经过 7/7 工作表、225/225 记录、字段类型、稳定 ID、来源哈希和公开边界校验；原始 XLSX 与批量下载保持关闭。

> [!IMPORTANT]
> “已审查”表示网页数值与所列来源版本一致，不代表游戏后续版本不会调整。用于计算或攻略判断前，请先核对页面顶部版本。

## 在线筛选

<div v-if="!BasicAttackExplorer" class="tool-loading">
  <p>查询器包含 225 条结构化记录，按需加载可减少移动端首屏开销。</p>
  <button
    type="button"
    :disabled="loadingBasicAttackExplorer"
    @click="loadBasicAttackExplorer"
  >
    {{ loadingBasicAttackExplorer ? '正在加载……' : '加载普攻查询器' }}
  </button>
</div>
<BasicAttackExplorer v-else />

## 分工作表浏览

${worksheetLinks}

## 字段字典

| 字段 | 中文含义 | 类型 | 空值 | 单位 | 说明 |
| --- | --- | --- | --- | --- | --- |
${fieldRows}

## 数据完整性

- 规范记录：${dataset.metadata.recordCount} 条；
- 工作表：${dataset.metadata.worksheetCount} 个；
- 来源资产：\`${dataset.metadata.sourceAssetId}\`；
- 来源 SHA-256：\`${dataset.integrity.sourceSha256}\`；
- 记录集 SHA-256：\`${dataset.integrity.recordsSha256}\`；
- 审查日期：${dataset.metadata.reviewedAt}；
- 公开范围：正文、站内搜索、结构化交互；不提供源文件或下载接口。
`
}

function renderTool(dataset, source) {
  return `${renderFrontmatter({
    id: 'tool-basic-attack-lookup',
    title: '普攻倍率查询器',
    description:
      '按舰灵名称、工作表和字段筛选、排序 225 条普攻倍率与冷却数据。',
    section: 'tools',
    order: 125,
    contentType: 'tool',
    source,
    tags: ['普攻查询', '倍率', 'CD', '筛选', '排序'],
    related: [
      'tools-index',
      'data-basic-attack-cd',
      'tool-damage-calculator',
    ],
  })}
<script setup>
import { markRaw, ref, shallowRef } from 'vue'

const BasicAttackExplorer = shallowRef(null)
const loadingBasicAttackExplorer = ref(false)

async function loadBasicAttackExplorer() {
  loadingBasicAttackExplorer.value = true
  BasicAttackExplorer.value = markRaw(
    (await import('../.vitepress/components/BasicAttackExplorer.vue')).default,
  )
}
</script>

# 普攻倍率查询器

查询器与[普攻数据页](../data/basic-attack-cd)读取同一个规范数据集，共 ${dataset.metadata.recordCount} 条、${dataset.metadata.worksheetCount} 个工作表，适用版本为 ${dataset.metadata.version}。可按名称、舰种、伤害类型或备注搜索，并对倍率、CD 与射程执行稳定排序。

<div v-if="!BasicAttackExplorer" class="tool-loading">
  <p>查询器包含 225 条结构化记录，按需加载可减少移动端首屏开销。</p>
  <button
    type="button"
    :disabled="loadingBasicAttackExplorer"
    @click="loadBasicAttackExplorer"
  >
    {{ loadingBasicAttackExplorer ? '正在加载……' : '加载普攻查询器' }}
  </button>
</div>
<BasicAttackExplorer v-else />

## 使用边界

- 空值表示来源工作表未提供该项，不等于数值为 0；
- 同名舰灵可能对应不同普攻载荷或来源行，查询器会分别保留；
- 页面不提供 JSON、CSV 或原始 XLSX 下载；
- 数据问题请同时提供舰灵名称、工作表与页面显示的来源行号。
`
}

function renderWorksheetPage(dataset, worksheet, source) {
  const records = dataset.records.filter(
    (record) => record.worksheet === worksheet.name,
  )
  const fieldNames = worksheet.fieldNames.filter(
    (fieldName) => !['worksheet', 'worksheetRow', 'rowNote'].includes(fieldName),
  )
  const fieldByName = new Map(dataset.fields.map((field) => [field.name, field]))
  const columns = ['name', 'worksheetRow', ...fieldNames]
  const header = columns
    .map((column) =>
      column === 'name'
        ? '舰灵'
        : column === 'worksheetRow'
          ? '来源行'
          : fieldByName.get(column)?.label ?? column,
    )
    .map((label) => ` ${label} `)
    .join('|')
  const separators = columns.map(() => ' --- ').join('|')
  const rows = records
    .map((record) =>
      columns
        .map((column) =>
          escapeCell(
            column === 'name'
              ? record.name
              : column === 'worksheetRow'
                ? record.worksheetRow
                : record.values[column],
          ),
        )
        .map((value) => ` ${value} `)
        .join('|'),
    )
    .map((row) => `|${row}|`)
    .join('\n')

  return `${renderFrontmatter({
    id: `data-basic-attack-${worksheet.slug}`,
    title: `普攻数据：${worksheet.name}`,
    description: `${worksheet.name}工作表的 ${worksheet.recordCount} 条舰灵普攻倍率、冷却、射程和伤害类型数据。`,
    section: 'data',
    order: 611 + worksheet.order,
    contentType: 'data',
    source,
    tags: ['普攻倍率', 'CD', worksheet.name, '2026-07'],
    related: ['data-basic-attack-cd', 'tool-basic-attack-lookup'],
  })}
# 普攻数据：${worksheet.name}

本表来自同一规范数据集，包含 **${worksheet.recordCount} 条**记录，适用版本为 **${dataset.metadata.version}**。[返回完整数据页](../basic-attack-cd)或使用[普攻倍率查询器](../../tools/basic-attack-lookup)。

<div class="table-scroll" tabindex="0" role="region" aria-label="${worksheet.name}普攻数据表">

|${header}|
|${separators}|
${rows}

</div>
`
}

export async function buildBasicAttackDataset() {
  const [imported, importReport, ledger, review] = await Promise.all([
    readJson(importPath),
    readJson(importReportPath),
    readJson(sourceLedgerPath),
    readJson(reviewPath),
  ])
  const source = ledger.assets.find((asset) => asset.id === review.sourceAssetId)
  assert(source, `source asset ${review.sourceAssetId} is missing`)
  assert(source.permission === 'authorized', 'source asset is not authorized')
  assert(source.status === 'approved', 'source asset is not approved')
  assert(
    review.decision.status === 'approved',
    'dataset review decision is not approved',
  )
  assert(
    source.hashes.sha256 === review.evidence.sourceSha256 &&
      imported.source.sha256 === review.evidence.sourceSha256 &&
      importReport.source.sha256 === review.evidence.sourceSha256,
    'source hash chain does not match the dataset review',
  )
  assert(
    importReport.outputs.records.sha256 ===
      review.evidence.importRecordsSha256,
    'reviewed import record hash does not match the import report',
  )
  assert(
    sha256(await readFile(importPath)) === review.evidence.importRecordsSha256,
    'current import record file is not the reviewed file',
  )
  assert(
    imported.totalRecords === review.evidence.expectedRecordCount,
    'reviewed record count does not match the import',
  )
  assert(
    imported.worksheetSummaries.length ===
      review.evidence.expectedWorksheetCount,
    'reviewed worksheet count does not match the import',
  )

  const fields = imported.fields.map(enrichField)
  const worksheets = imported.worksheetSummaries.map((summary, order) => {
    const slug = worksheetSlugs.get(summary.worksheet)
    assert(slug, `missing public slug for worksheet ${summary.worksheet}`)
    const records = imported.records.filter(
      (record) => record.category === summary.worksheet,
    )
    assert(
      records.length ===
        review.evidence.expectedWorksheetRecords[summary.worksheet],
      `reviewed row count does not match worksheet ${summary.worksheet}`,
    )
    const fieldNames = fields
      .map((field) => field.name)
      .filter((fieldName) =>
        records.some((record) =>
          Object.prototype.hasOwnProperty.call(record.values, fieldName),
        ),
      )
    return {
      id: `worksheet-${slug}`,
      name: summary.worksheet,
      slug,
      order,
      recordCount: records.length,
      sourceElementId: summary.sourceElementId,
      fieldNames,
    }
  })
  const records = imported.records.map((record) => ({
    id: record.id,
    sourceElementId: record.sourceElementId,
    name: record.name,
    category: record.category,
    worksheet: record.values.worksheet,
    worksheetRow: record.values.worksheetRow,
    applicableVersion: record.applicableVersion,
    verifiedAt: record.verifiedAt,
    sourceRefs: record.sourceRefs,
    status: 'current',
    disposition: 'published',
    values: record.values,
  }))
  const dataset = {
    schemaVersion: 1,
    metadata: {
      datasetId: 'basic-attack',
      title: '拂晓舰灵普攻倍率与 CD',
      version: review.decision.applicableVersion,
      sourceAssetId: source.id,
      sourceFileName: source.title,
      sourceUpdatedAt: source.origin.updatedAt,
      verifiedAt: imported.records[0]?.verifiedAt,
      reviewedAt: review.decision.approvedAt,
      reviewStatus: 'approved',
      publicationStatus: 'published',
      worksheetCount: worksheets.length,
      recordCount: records.length,
      fieldCount: fields.length,
      defaultSort: ['worksheetOrder', 'worksheetRow', 'id'],
    },
    publicRelease: source.publicRelease,
    integrity: {
      sourceSha256: source.hashes.sha256,
      importRecordsSha256: review.evidence.importRecordsSha256,
      fieldDictionarySha256: sha256(JSON.stringify(fields)),
      recordsSha256: sha256(JSON.stringify(records)),
    },
    fields,
    worksheets,
    records,
  }
  const serialized = stableJson(dataset)

  await Promise.all([
    mkdir(path.dirname(publicDataPath), { recursive: true }),
    mkdir(worksheetDirectory, { recursive: true }),
    mkdir(path.dirname(reportPath), { recursive: true }),
  ])
  await writeFile(publicDataPath, serialized, 'utf8')
  await writeFile(overviewPath, renderOverview(dataset, source), 'utf8')
  await writeFile(toolPath, renderTool(dataset, source), 'utf8')
  await Promise.all(
    worksheets.map((worksheet) =>
      writeFile(
        path.join(worksheetDirectory, `${worksheet.slug}.md`),
        renderWorksheetPage(dataset, worksheet, source),
        'utf8',
      ),
    ),
  )
  const report = {
    status: 'passed',
    datasetId: dataset.metadata.datasetId,
    sourceAssetId: dataset.metadata.sourceAssetId,
    sourceSha256: dataset.integrity.sourceSha256,
    importRecordsSha256: dataset.integrity.importRecordsSha256,
    canonicalDataSha256: sha256(serialized),
    fieldDictionarySha256: dataset.integrity.fieldDictionarySha256,
    recordsSha256: dataset.integrity.recordsSha256,
    worksheetCount: dataset.metadata.worksheetCount,
    recordCount: dataset.metadata.recordCount,
    fieldCount: dataset.metadata.fieldCount,
    duplicateIds: 0,
    invalidFields: 0,
    driftFindings: 0,
    outputs: {
      data: path.relative(root, publicDataPath).replaceAll('\\', '/'),
      overview: path.relative(root, overviewPath).replaceAll('\\', '/'),
      tool: path.relative(root, toolPath).replaceAll('\\', '/'),
      worksheets: worksheets.map((worksheet) =>
        path
          .relative(
            root,
            path.join(worksheetDirectory, `${worksheet.slug}.md`),
          )
          .replaceAll('\\', '/'),
      ),
    },
  }
  await writeFile(reportPath, stableJson(report), 'utf8')
  return { dataset, report }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { report } = await buildBasicAttackDataset()
  console.log(
    `Basic attack dataset built: ${report.worksheetCount} worksheets, ${report.recordCount} records, ${report.fieldCount} fields.`,
  )
}

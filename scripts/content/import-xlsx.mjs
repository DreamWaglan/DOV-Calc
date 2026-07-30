import { createHash } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import readXlsxFile from 'read-excel-file/node'
import {
  importGovernance,
  loadSourceAsset,
  stableJson,
  stableSourceElementId,
} from './lib/migration-elements.mjs'
import { writeFileWithRetry as writeFile } from './lib/content-utils.mjs'

const DEFAULT_SOURCE_PATH =
  'F:\\Visual Studio Project\\Project_Test\\拂晓手册\\8 主题攻略-伤害计算篇\\8.2 拂晓舰灵普攻倍率cd.xlsx'
const DEFAULT_OUTPUT_DIR = 'content/imports/xlsx/basic-attack'
const ASSET_ID = 'src-0c5b7db892f6'
const APPLICABLE_VERSION = '2026-07'
const VERIFIED_AT = '2026-07-29'

const SHEET_DEFINITIONS = [
  {
    name: '驱逐',
    slug: 'destroyer',
    headerRow: 1,
    category: '驱逐',
    fields: [
      ['name', 0, 'string', true],
      ['gunMultiplier', 1, 'number', true],
      ['gunCdSeconds', 2, 'number', true],
      ['gunRangeUnits', 3, 'number', true],
      ['gunDamageType', 4, 'string', true],
      ['torpedoMultiplier', 5, 'numberOrNote', false],
      ['torpedoCdSeconds', 6, 'number', false],
      ['torpedoRangeUnits', 7, 'number', false],
      ['projectilesPerRound', 8, 'string', true],
    ],
    headers: [
      '舰灵名',
      '普攻炮击伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '伤害类型',
      '普攻雷击伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '炮弹数/轮',
    ],
  },
  {
    name: '轻巡雷巡',
    slug: 'light-cruiser',
    headerRow: 1,
    repeatedHeaderRows: [40],
    category: '轻巡雷巡',
    fields: [
      ['name', 0, 'string', true],
      ['gunMultiplier', 1, 'number', true],
      ['gunCdSeconds', 2, 'number', true],
      ['gunRangeUnits', 3, 'number', true],
      ['gunDamageType', 4, 'string', true],
      ['projectilesPerRound', 5, 'string', true],
      ['torpedoMultiplier', 6, 'numberOrNote', false],
      ['torpedoCdSeconds', 7, 'number', false],
      ['torpedoRangeUnits', 8, 'number', false],
    ],
    headers: [
      '舰灵名',
      '普攻炮击伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '伤害类型',
      '炮弹数/轮',
      '普攻雷击伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
    ],
  },
  {
    name: '重巡',
    slug: 'heavy-cruiser',
    headerRow: 1,
    category: '重巡',
    fields: [
      ['name', 0, 'string', true],
      ['gunMultiplier', 1, 'number', true],
      ['gunCdSeconds', 2, 'number', true],
      ['gunRangeUnits', 3, 'number', true],
      ['gunDamageType', 4, 'string', true],
      ['projectilesPerRound', 5, 'string', true],
      ['torpedoMultiplier', 6, 'numberOrNote', false],
      ['torpedoCdSeconds', 7, 'number', false],
      ['torpedoRangeUnits', 8, 'number', false],
    ],
    headers: [
      '舰灵名',
      '普攻炮击伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '伤害类型',
      '炮弹数/轮',
      '普攻雷击伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
    ],
  },
  {
    name: '战列战巡重炮',
    slug: 'battleship',
    headerRow: 1,
    repeatedHeaderRows: [47],
    category: '战列战巡重炮',
    fields: [
      ['name', 0, 'string', true],
      ['mainGunMultiplier', 1, 'number', true],
      ['mainGunCdSeconds', 2, 'number', true],
      ['mainGunRangeUnits', 3, 'number', true],
      ['mainGunDamageType', 4, 'string', true],
      ['mainGunProjectilesPerRound', 5, 'string', true],
      ['secondaryGunMultiplier', 6, 'number', true],
      ['secondaryGunCdSeconds', 7, 'number', true],
      ['secondaryGunRangeUnits', 8, 'number', true],
      ['secondaryGunDamageType', 9, 'string', true],
      ['secondaryGunProjectilesPerRound', 10, 'string', true],
    ],
    headers: [
      '舰灵名',
      '普攻主炮炮击伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '伤害类型',
      '炮弹数/轮',
      '普攻副炮炮击伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '伤害类型',
      '炮弹数/轮',
    ],
  },
  {
    name: '轻母',
    slug: 'light-carrier',
    headerRow: 2,
    noteRow: 1,
    inheritName: true,
    category: '轻母',
    fields: [
      ['name', 0, 'string', true],
      ['aircraftMultiplier', 1, 'number', true],
      ['aircraftCdSeconds', 2, 'number', true],
      ['aircraftRangeUnits', 3, 'number', true],
      ['aircraftDamageType', 4, 'string', true],
      ['fighterMultiplier', 7, 'number', false],
      ['fighterCdSeconds', 8, 'number', false],
      ['fighterRangeUnits', 9, 'number', false],
    ],
    headers: [
      '舰灵名',
      '普攻伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '伤害类型',
      null,
      null,
      '普攻伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
    ],
  },
  {
    name: '航母装母',
    slug: 'carrier',
    headerRow: 2,
    noteRow: 1,
    inheritName: true,
    category: '航母装母',
    fields: [
      ['name', 0, 'string', true],
      ['aircraftMultiplier', 1, 'number', true],
      ['aircraftCdSeconds', 2, 'number', true],
      ['aircraftRangeUnits', 3, 'number', true],
      ['aircraftDamageType', 4, 'string', true],
      ['rowNote', 5, 'string', false],
      ['fighterMultiplier', 8, 'number', false],
      ['fighterCdSeconds', 9, 'number', false],
      ['fighterRangeUnits', 10, 'number', false],
    ],
    headers: [
      '舰灵名',
      '普攻伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '伤害类型',
      null,
      null,
      null,
      '普攻伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
    ],
  },
  {
    name: '航战水母',
    slug: 'aviation-battleship-seaplane',
    headerRow: 1,
    repeatedHeaderRows: [9],
    inheritName: true,
    category: '航战水母',
    fields: [
      ['name', 0, 'string', true],
      ['attackMultiplier', 1, 'number', true],
      ['attackCdSeconds', 2, 'number', true],
      ['attackRangeUnits', 3, 'number', true],
      ['attackDamageType', 4, 'string', true],
      ['projectilesPerRound', 5, 'string', true],
    ],
    headers: [
      '舰灵名',
      '普攻伤害倍率/%',
      '普攻cd/s',
      '有效射程/标准单位',
      '伤害类型',
      '炮弹数/轮',
    ],
  },
]

const FIELD_DEFINITIONS = [
  ['worksheet', 'string', false, '来源工作表'],
  ['worksheetRow', 'number', false, '来源工作表行号'],
  ['rowNote', 'string', true, '来源行备注'],
  ['gunMultiplier', 'number', true, '炮击伤害倍率'],
  ['gunCdSeconds', 'number', true, '炮击冷却秒数'],
  ['gunRangeUnits', 'number', true, '炮击有效射程'],
  ['gunDamageType', 'string', true, '炮击伤害类型'],
  ['torpedoMultiplier', 'number', true, '雷击伤害倍率'],
  ['torpedoNote', 'string', true, '雷击备注'],
  ['torpedoCdSeconds', 'number', true, '雷击冷却秒数'],
  ['torpedoRangeUnits', 'number', true, '雷击有效射程'],
  ['projectilesPerRound', 'string', true, '每轮弹数或架数'],
  ['mainGunMultiplier', 'number', true, '主炮伤害倍率'],
  ['mainGunCdSeconds', 'number', true, '主炮冷却秒数'],
  ['mainGunRangeUnits', 'number', true, '主炮有效射程'],
  ['mainGunDamageType', 'string', true, '主炮伤害类型'],
  ['mainGunProjectilesPerRound', 'string', true, '主炮每轮弹数'],
  ['secondaryGunMultiplier', 'number', true, '副炮伤害倍率'],
  ['secondaryGunCdSeconds', 'number', true, '副炮冷却秒数'],
  ['secondaryGunRangeUnits', 'number', true, '副炮有效射程'],
  ['secondaryGunDamageType', 'string', true, '副炮伤害类型'],
  ['secondaryGunProjectilesPerRound', 'string', true, '副炮每轮弹数'],
  ['aircraftMultiplier', 'number', true, '舰载机伤害倍率'],
  ['aircraftCdSeconds', 'number', true, '舰载机冷却秒数'],
  ['aircraftRangeUnits', 'number', true, '舰载机有效射程'],
  ['aircraftDamageType', 'string', true, '舰载机伤害类型'],
  ['fighterMultiplier', 'number', true, '战斗机巡航倍率'],
  ['fighterCdSeconds', 'number', true, '战斗机巡航冷却秒数'],
  ['fighterRangeUnits', 'number', true, '战斗机巡航有效射程'],
  ['attackMultiplier', 'number', true, '通用普攻伤害倍率'],
  ['attackCdSeconds', 'number', true, '通用普攻冷却秒数'],
  ['attackRangeUnits', 'number', true, '通用普攻有效射程'],
  ['attackDamageType', 'string', true, '通用普攻伤害类型'],
].map(([name, type, nullable, label]) => ({ name, type, nullable, label }))

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

async function sha256File(filePath) {
  return sha256(await readFile(filePath))
}

function normalizeCell(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length === 0 ? null : trimmed
  }
  return value ?? null
}

function columnName(index) {
  let n = index + 1
  let name = ''
  while (n > 0) {
    const mod = (n - 1) % 26
    name = String.fromCharCode(65 + mod) + name
    n = Math.floor((n - mod) / 26)
  }
  return name
}

function errorAt(worksheet, row, column, message) {
  return `${worksheet} row ${row} column ${columnName(column)}: ${message}`
}

function isHeaderRow(row, definition) {
  if (normalizeCell(row[0]) !== '舰灵名') return false
  for (let index = 0; index < row.length; index += 1) {
    const actual = normalizeCell(row[index])
    if (actual === null) continue
    if (actual !== definition.headers[index]) return false
  }
  return true
}

function validateHeader(row, definition, errors) {
  for (let index = 0; index < definition.headers.length; index += 1) {
    const expected = definition.headers[index]
    const actual = normalizeCell(row[index])
    if (actual !== expected) {
      errors.push(
        errorAt(definition.name, definition.headerRow, index, `expected header ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`),
      )
    }
  }
  for (let index = definition.headers.length; index < row.length; index += 1) {
    const actual = normalizeCell(row[index])
    if (actual !== null) {
      errors.push(errorAt(definition.name, definition.headerRow, index, `unknown header ${JSON.stringify(actual)}`))
    }
  }
}

function validateUnknownDataCells(row, definition, rowNumber, errors) {
  const knownColumns = new Set(definition.fields.map(([, column]) => column))
  for (let index = 0; index < row.length; index += 1) {
    const actual = normalizeCell(row[index])
    if (actual !== null && !knownColumns.has(index)) {
      errors.push(errorAt(definition.name, rowNumber, index, `unknown non-empty cell ${JSON.stringify(actual)}`))
    }
  }
}

function parseNumber(value, context, required, errors) {
  const normalized = normalizeCell(value)
  if (normalized === null) {
    if (required) errors.push(`${context}: required numeric value is empty`)
    return null
  }
  if (typeof normalized !== 'number' || !Number.isFinite(normalized)) {
    errors.push(`${context}: expected number, got ${JSON.stringify(normalized)}`)
    return null
  }
  if (normalized <= 0 || normalized > 100) {
    errors.push(`${context}: number ${normalized} is outside allowed range (0, 100]`)
  }
  return normalized
}

function parseString(value, context, required, errors) {
  const normalized = normalizeCell(value)
  if (normalized === null) {
    if (required) errors.push(`${context}: required string value is empty`)
    return null
  }
  if (typeof normalized !== 'string') {
    errors.push(`${context}: expected string, got ${JSON.stringify(normalized)}`)
    return null
  }
  return normalized
}

function parseNumberOrNote(value, fieldName, context, required, errors, values) {
  const normalized = normalizeCell(value)
  if (normalized === null) {
    if (required) errors.push(`${context}: required numeric value is empty`)
    values[fieldName] = null
    return
  }
  if (typeof normalized === 'number' && Number.isFinite(normalized)) {
    values[fieldName] = parseNumber(normalized, context, required, errors)
    return
  }
  if (typeof normalized === 'string') {
    values[fieldName] = null
    values[`${fieldName.replace(/Multiplier$/, '')}Note`] = normalized
    return
  }
  errors.push(`${context}: expected number or note, got ${JSON.stringify(normalized)}`)
  values[fieldName] = null
}

function recordId(definition, name, values) {
  const identity = [
    definition.slug,
    name,
    values.gunDamageType,
    values.torpedoMultiplier,
    values.mainGunDamageType,
    values.mainGunMultiplier,
    values.aircraftDamageType,
    values.aircraftMultiplier,
    values.attackDamageType,
    values.attackMultiplier,
  ]
    .filter((value) => value !== undefined && value !== null)
    .join('|')
  return `${definition.slug}-${sha256(identity).slice(0, 12)}`
}

function parseSheet(sheet, definition, errors, assetId) {
  const records = []
  const rowCount = sheet.data.length
  const header = sheet.data[definition.headerRow - 1] ?? []
  validateHeader(header, definition, errors)

  if (definition.noteRow) {
    const note = sheet.data[definition.noteRow - 1] ?? []
    if (!note.some((cell) => typeof normalizeCell(cell) === 'string' && normalizeCell(cell).startsWith('航系普攻'))) {
      errors.push(errorAt(definition.name, definition.noteRow, 0, 'expected aviation preface note row'))
    }
  }

  let currentName = null
  let dataRows = 0
  for (let rowIndex = definition.headerRow; rowIndex < sheet.data.length; rowIndex += 1) {
    const rowNumber = rowIndex + 1
    const row = sheet.data[rowIndex]
    if (isHeaderRow(row, definition)) continue
    if (row.every((cell) => normalizeCell(cell) === null)) continue

    validateUnknownDataCells(row, definition, rowNumber, errors)
    const values = {
      worksheet: definition.name,
      worksheetRow: rowNumber,
    }
    let rowName = normalizeCell(row[0])
    if (rowName !== null && typeof rowName !== 'string') {
      errors.push(errorAt(definition.name, rowNumber, 0, `expected string, got ${JSON.stringify(rowName)}`))
      rowName = null
    }
    if (rowName) currentName = rowName
    if (!rowName && definition.inheritName) rowName = currentName
    if (!rowName) {
      errors.push(errorAt(definition.name, rowNumber, 0, 'required name is empty'))
      rowName = '(missing-name)'
    }

    for (const [fieldName, column, fieldType, required] of definition.fields) {
      if (fieldName === 'name') continue
      const context = errorAt(definition.name, rowNumber, column, fieldName)
      if (fieldType === 'number') {
        values[fieldName] = parseNumber(row[column], context, required, errors)
      } else if (fieldType === 'numberOrNote') {
        parseNumberOrNote(row[column], fieldName, context, required, errors, values)
      } else {
        values[fieldName] = parseString(row[column], context, required, errors)
      }
    }

    dataRows += 1
    records.push({
      id: recordId(definition, rowName, values),
      sourceElementId: stableSourceElementId(assetId, 'worksheet', {
        worksheet: definition.name,
        row: rowNumber,
      }),
      name: rowName,
      category: definition.category,
      values,
      applicableVersion: APPLICABLE_VERSION,
      verifiedAt: VERIFIED_AT,
      sourceRefs: [assetId],
      status: 'current',
      disposition: 'internal-only',
      dispositionReason:
        'The canonical record remains quarantined until Phase 6 dataset fact review.',
    })
  }

  return {
    records,
    summary: {
      worksheet: definition.name,
      sourceElementId: stableSourceElementId(assetId, 'worksheet', {
        worksheet: definition.name,
      }),
      rowCount,
      dataRows,
      fieldCount: definition.fields.length - 1,
      headerRows: 1 + (definition.repeatedHeaderRows?.length ?? 0),
      noteRows: definition.noteRow ? 1 : 0,
    },
  }
}

function validateRecords(records, errors) {
  const ids = new Map()
  const names = new Map()
  for (const record of records) {
    if (ids.has(record.id)) {
      errors.push(
        `${record.values.worksheet} row ${record.values.worksheetRow} column A: duplicate record id ${record.id}; first seen at ${ids.get(record.id)}`,
      )
    } else {
      ids.set(record.id, `${record.values.worksheet} row ${record.values.worksheetRow}`)
    }

    const key = [
      record.category,
      record.name,
      record.values.gunDamageType,
      record.values.torpedoMultiplier,
      record.values.mainGunDamageType,
      record.values.mainGunMultiplier,
      record.values.aircraftDamageType,
      record.values.aircraftMultiplier,
      record.values.attackDamageType,
      record.values.attackMultiplier,
    ]
      .filter((value) => value !== undefined && value !== null)
      .join('|')
    if (names.has(key)) {
      errors.push(
        `${record.values.worksheet} row ${record.values.worksheetRow} column A: duplicate record key ${key}; first seen at ${names.get(key)}`,
      )
    } else {
      names.set(key, `${record.values.worksheet} row ${record.values.worksheetRow}`)
    }
  }
}

export function parseWorkbookSheets(
  sheets,
  {
    sourcePath,
    sourceSha256,
    assetId = ASSET_ID,
    governance = {
      permission: 'authorized',
      authorizationEvidenceId: null,
      publicRelease: null,
      reviewStatus: 'migration-review-required',
      publishable: false,
    },
  },
) {
  const errors = []
  const actualNames = sheets.map((sheet) => sheet.sheet)
  const expectedNames = SHEET_DEFINITIONS.map((sheet) => sheet.name)
  if (actualNames.length !== expectedNames.length) {
    errors.push(`workbook row 0 column A: expected exactly ${expectedNames.length} worksheets, got ${actualNames.length}`)
  }
  for (let index = 0; index < expectedNames.length; index += 1) {
    if (actualNames[index] !== expectedNames[index]) {
      errors.push(
        `workbook row 0 column ${columnName(index)}: expected worksheet ${JSON.stringify(expectedNames[index])}, got ${JSON.stringify(actualNames[index])}`,
      )
    }
  }

  const records = []
  const worksheetSummaries = []
  for (const definition of SHEET_DEFINITIONS) {
    const sheet = sheets.find((candidate) => candidate.sheet === definition.name)
    if (!sheet) continue
    const parsed = parseSheet(sheet, definition, errors, assetId)
    records.push(...parsed.records)
    worksheetSummaries.push(parsed.summary)
  }
  validateRecords(records, errors)

  const dataset = {
    schemaVersion: 1,
    dataset: {
      id: 'basic-attack',
      version: APPLICABLE_VERSION,
      recordCount: records.length,
      sourceFileHash: sourceSha256,
    },
    assetId,
    source: {
      fileName: path.basename(sourcePath),
      sha256: sourceSha256,
    },
    ...governance,
    fields: FIELD_DEFINITIONS,
    worksheetSummaries,
    totalRecords: records.length,
    records,
  }

  return { dataset, errors }
}

async function validateAgainstSchema(records) {
  const schema = JSON.parse(await readFile('content/schemas/data-record.schema.json', 'utf8'))
  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const errors = []
  for (const record of records) {
    if (!validate(record)) {
      for (const error of validate.errors ?? []) {
        errors.push(`${record.values.worksheet} row ${record.values.worksheetRow} column A: schema ${error.instancePath} ${error.message}`)
      }
    }
  }
  return errors
}

function buildReviewMarkdown(dataset) {
  const lines = [
    '# XLSX Basic Attack Import Review',
    '',
    `- sourceAssetId: ${dataset.assetId}`,
    `- permission: ${dataset.permission}`,
    `- publishable: ${dataset.publishable}`,
    `- applicableVersion: ${APPLICABLE_VERSION}`,
    `- verifiedAt: ${VERIFIED_AT}`,
    `- sourceSha256: ${dataset.source.sha256}`,
    '',
    '## Worksheet Counts',
    '',
    '| Worksheet | Rows | Data Rows | Fields |',
    '| --- | ---: | ---: | ---: |',
  ]
  for (const summary of dataset.worksheetSummaries) {
    lines.push(`| ${summary.worksheet} | ${summary.rowCount} | ${summary.dataRows} | ${summary.fieldCount} |`)
  }
  lines.push(
    '',
    '## Checklist',
    '',
    '- [x] Workbook has exactly 7 worksheets in the expected order.',
    '- [x] Headers and aviation preface rows match the maintained mapping.',
    '- [x] Names, inherited names, unique IDs, numeric ranges, empty cells, and unknown cells were validated.',
    '- [x] Source authorization is recorded separately from migration review state.',
    '- [x] Outputs remain non-publishable until dataset fact review is complete.',
  )
  return `${lines.join('\n')}\n`
}

export async function importXlsx({
  sourcePath = DEFAULT_SOURCE_PATH,
  outputDir = DEFAULT_OUTPUT_DIR,
  assetId = ASSET_ID,
} = {}) {
  const sourceBuffer = await readFile(sourcePath)
  const sourceSha256 = sha256(sourceBuffer)
  const { asset } = await loadSourceAsset(assetId)
  if (asset.assetType !== 'xlsx') {
    throw new Error(`${assetId} is registered as ${asset.assetType}, not xlsx`)
  }
  if (asset.hashes.sha256 !== sourceSha256) {
    throw new Error(`${assetId}: source SHA-256 does not match the source ledger`)
  }
  const governance = importGovernance(asset)
  const sheets = await readXlsxFile(sourcePath)
  const { dataset, errors } = parseWorkbookSheets(sheets, {
    sourcePath,
    sourceSha256,
    assetId,
    governance,
  })
  errors.push(...(await validateAgainstSchema(dataset.records)))
  if (errors.length > 0) {
    const error = new Error(`XLSX import validation failed (${errors.length})`)
    error.failures = errors
    throw error
  }

  const absoluteOutputDir = path.resolve(outputDir)
  await mkdir(absoluteOutputDir, { recursive: true })

  const recordsPath = path.join(absoluteOutputDir, 'records.json')
  const reportPath = path.join(absoluteOutputDir, 'import-report.json')
  const reviewPath = path.join(absoluteOutputDir, 'review.md')

  const recordsJson = stableJson(dataset)
  await writeFile(recordsPath, recordsJson, 'utf8')

  const report = {
    schemaVersion: 1,
    assetId,
    source: dataset.source,
    permission: dataset.permission,
    authorizationEvidenceId: dataset.authorizationEvidenceId,
    publicRelease: dataset.publicRelease,
    reviewStatus: dataset.reviewStatus,
    publishable: dataset.publishable,
    applicableVersion: APPLICABLE_VERSION,
    verifiedAt: VERIFIED_AT,
    worksheetCount: dataset.worksheetSummaries.length,
    worksheetSummaries: dataset.worksheetSummaries,
    totalRecords: dataset.totalRecords,
    outputs: {
      records: {
        path: path.relative(process.cwd(), recordsPath).split(path.sep).join('/'),
        sha256: sha256(recordsJson),
        bytes: Buffer.byteLength(recordsJson),
      },
      review: {
        path: path.relative(process.cwd(), reviewPath).split(path.sep).join('/'),
      },
    },
    validation: {
      status: 'passed',
      errors: [],
    },
  }
  const reviewMarkdown = buildReviewMarkdown(dataset)
  await writeFile(reviewPath, reviewMarkdown, 'utf8')
  report.outputs.review.sha256 = sha256(reviewMarkdown)
  report.outputs.review.bytes = Buffer.byteLength(reviewMarkdown)
  await writeFile(reportPath, stableJson(report), 'utf8')
  report.outputs.report = {
    path: path.relative(process.cwd(), reportPath).split(path.sep).join('/'),
    sha256: await sha256File(reportPath),
    bytes: Buffer.byteLength(stableJson(report)),
  }

  return { ...report, recordsPath, reportPath, reviewPath }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [sourcePath = DEFAULT_SOURCE_PATH, outputDir = DEFAULT_OUTPUT_DIR] = process.argv.slice(2)
  try {
    const result = await importXlsx({ sourcePath, outputDir })
    console.log(
      `XLSX imported: ${result.outputs.records.path} (${result.worksheetCount} worksheets, ${result.totalRecords} records, sha256 ${result.source.sha256}).`,
    )
  } catch (error) {
    console.error(error.message)
    for (const failure of error.failures ?? []) console.error(`- ${failure}`)
    process.exit(1)
  }
}

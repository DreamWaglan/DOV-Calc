import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { importXlsx, parseWorkbookSheets } from '../../scripts/content/import-xlsx.mjs'

const sourcePath =
  'F:\\Visual Studio Project\\Project_Test\\拂晓手册\\8 主题攻略-伤害计算篇\\8.2 拂晓舰灵普攻倍率cd.xlsx'
const outputDir = 'content/imports/xlsx/basic-attack'

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

async function fileHash(filePath) {
  return sha256(await readFile(filePath))
}

async function directoryFingerprint(directory) {
  const files = (await readdir(directory)).sort()
  const entries = []
  for (const file of files) {
    const fullPath = path.join(directory, file)
    entries.push(`${file}:${await fileHash(fullPath)}`)
  }
  return entries.join('\n')
}

function validSheets() {
  return [
    {
      sheet: '驱逐',
      data: [
        ['舰灵名', '普攻炮击伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '伤害类型', '普攻雷击伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '炮弹数/轮'],
        ['岛风', 0.54, 0.3, 16, '驱逐穿甲', 0.35, 5, 20, '2发'],
      ],
    },
    {
      sheet: '轻巡雷巡',
      data: [
        ['舰灵名', '普攻炮击伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '伤害类型', '炮弹数/轮', '普攻雷击伤害倍率/%', '普攻cd/s', '有效射程/标准单位'],
        ['海伦娜', 2.85, 2.4, 18, '轻巡通常', '15发', '无鱼雷伤害', null, null],
      ],
    },
    {
      sheet: '重巡',
      data: [
        ['舰灵名', '普攻炮击伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '伤害类型', '炮弹数/轮', '普攻雷击伤害倍率/%', '普攻cd/s', '有效射程/标准单位'],
        ['欧根亲王', 2.16, 3, 20, '重巡穿甲', '8发', 0.6, 5, 20],
      ],
    },
    {
      sheet: '战列战巡重炮',
      data: [
        ['舰灵名', '普攻主炮炮击伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '伤害类型', '炮弹数/轮', '普攻副炮炮击伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '伤害类型', '炮弹数/轮'],
        ['胡德', 1.76, 4.2, 25, '战列穿甲', '4发', 0.4, 2, 15, '驱逐穿甲', '8发'],
      ],
    },
    {
      sheet: '轻母',
      data: [
        ['航系普攻同模组，共用cd，每次普攻随机释放1架轰炸机或鱼雷机，总比例1:1', null, null, null, null, null, '航系通用模组战斗机巡航，不对敌方血量造成伤害', null, null, null],
        ['舰灵名', '普攻伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '伤害类型', null, null, '普攻伤害倍率/%', '普攻cd/s', '有效射程/标准单位'],
        ['巨像', 1.66, 3.5, 30, '轰炸', null, null, 1.76, 5, 30],
        [null, 1.66, 3.5, 30, '鱼雷', null, null, null, null, null],
      ],
    },
    {
      sheet: '航母装母',
      data: [
        ['航系普攻同模组，共用cd，每次普攻随机释放2架轰炸机或鱼雷机，总比例1:1', null, null, null, null, null, null, '航系通用模组战斗机巡航，不对敌方血量造成伤害', null, null, null],
        ['舰灵名', '普攻伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '伤害类型', null, null, null, '普攻伤害倍率/%', '普攻cd/s', '有效射程/标准单位'],
        ['赤城', 1.6, 5, 30, '轰炸', null, null, null, 1.76, 5, 30],
        [null, 2.4, 5, 30, '鱼雷', null, null, null, null, null, null],
      ],
    },
    {
      sheet: '航战水母',
      data: [
        ['舰灵名', '普攻伤害倍率/%', '普攻cd/s', '有效射程/标准单位', '伤害类型', '炮弹数/轮'],
        ['伊势·改', 1.76, 4.2, 25, '战列高爆', '4发'],
        [null, 0.6, 3.5, 30, '轰炸', '1架/轮'],
      ],
    },
  ]
}

function parseWith(sheets) {
  return parseWorkbookSheets(sheets, {
    sourcePath,
    sourceSha256: '0'.repeat(64),
  })
}

{
  const sheets = validSheets()
  sheets[0].data[0][9] = '未知表头'
  const { errors } = parseWith(sheets)
  assert.ok(errors.some((error) => error.includes('驱逐 row 1 column J: unknown header')))
}

{
  const sheets = validSheets()
  sheets[0].data.push(['岛风复制', 0.54, 0.3, 16, '驱逐穿甲', 0.35, 5, 20, '2发'])
  sheets[0].data[2] = [...sheets[0].data[1]]
  const { errors } = parseWith(sheets)
  assert.ok(errors.some((error) => error.includes('duplicate record id')))
}

{
  const sheets = validSheets()
  sheets[0].data[1][1] = -1
  const { errors } = parseWith(sheets)
  assert.ok(errors.some((error) => error.includes('驱逐 row 2 column B') && error.includes('outside allowed range')))
}

{
  const sheets = validSheets()
  sheets[0].data[1][0] = null
  const { errors } = parseWith(sheets)
  assert.ok(errors.some((error) => error.includes('驱逐 row 2 column A: required name is empty')))
}

if (!existsSync(sourcePath)) {
  console.log('SKIP import-xlsx: local handbook source workbook is unavailable.')
  process.exit(0)
}

const first = await importXlsx({ sourcePath, outputDir })
const firstFingerprint = await directoryFingerprint(outputDir)
const second = await importXlsx({ sourcePath, outputDir })
const secondFingerprint = await directoryFingerprint(outputDir)

assert.equal(secondFingerprint, firstFingerprint, 'XLSX import output must be byte-stable')
assert.equal(first.source.sha256, '0f1e9968adbcd3dcdc669168af97f0f40d5de55f928d645e99a9e30d95bf0379')
assert.equal(first.source.sha256, second.source.sha256)
assert.equal(first.publishable, false)
assert.equal(first.permission, 'authorized')
assert.equal(first.authorizationEvidenceId, 'auth-user-declaration-20260730')
assert.equal(first.reviewStatus, 'migration-review-required')
assert.equal(first.worksheetCount, 7)
assert.equal(first.totalRecords, 225)
assert.deepEqual(
  first.worksheetSummaries.map((summary) => [summary.worksheet, summary.rowCount, summary.dataRows, summary.fieldCount]),
  [
    ['驱逐', 51, 50, 8],
    ['轻巡雷巡', 42, 38, 8],
    ['重巡', 27, 26, 8],
    ['战列战巡重炮', 49, 43, 10],
    ['轻母', 20, 18, 7],
    ['航母装母', 51, 44, 8],
    ['航战水母', 11, 6, 5],
  ],
)

const records = JSON.parse(await readFile(path.join(outputDir, 'records.json'), 'utf8'))
assert.equal(records.records.length, 225)
assert.equal(records.publishable, false)
assert.equal(records.records[0].applicableVersion, '2026-07')
assert.equal(records.records[0].verifiedAt, '2026-07-29')
assert.deepEqual(records.records[0].sourceRefs, ['src-0c5b7db892f6'])
assert.equal(records.records[0].disposition, 'internal-only')
assert.match(
  records.records[0].sourceElementId,
  /^src-[a-f0-9]{12}:worksheet:[a-f0-9]{16}$/,
)
assert.equal(
  new Set(records.records.map((record) => record.sourceElementId)).size,
  225,
)
assert.equal(
  new Set(records.worksheetSummaries.map((summary) => summary.sourceElementId))
    .size,
  7,
)

console.log('import-xlsx tests passed.')

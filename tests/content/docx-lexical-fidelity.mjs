import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { unzipSync } from 'fflate'
import { parseWordprocessingXml } from '../../scripts/content/import-docx.mjs'

const fixturePath = 'tests/content/fixtures/docx-lexical-fidelity.document.xml'
const levelingPagePath = 'docs/progression/leveling-strategy.md'
const levelingAssetId = 'src-6eba63c4aa7b'

const lexicalFixtureValues = [
  '80',
  '-7',
  '1.0',
  '15.',
  '0012',
  '0.94',
  '%',
  'A80级B',
  '英A中80',
]

const levelingTableLexemes = [
  '等级',
  '提升',
  '经验需求',
  '（单位：千）',
  '占满级（',
  '100',
  '级',
  '）',
  '总经验',
  '比率',
  '累积经验',
  '比率',
  '1-40',
  '85',
  '0.94',
  '%',
  '0.94',
  '%',
  '40-50',
  '162',
  '1.78',
  '%',
  '2.72',
  '%',
  '50-60',
  '998',
  '1',
  '1.0%',
  '13.7',
  '%',
  '60-70',
  '1443',
  '15.',
  '8%',
  '29.',
  '5%',
  '70-80',
  '1600',
  '17.6',
  '%',
  '47.',
  '1%',
  '80-90',
  '2400',
  '26.4',
  '%',
  '73.',
  '5%',
  '90-100',
  '2400',
  '26.4',
  '%',
  '100',
  '%',
]

const expectedLevelingPageFragments = [
  '## 3.为什么是80级？',
  '在拂晓的各种玩法中，80级已能够在JJC、遭遇战中',
  '| 等级提升 | 经验需求（单位：千） | 占满级（100级）总经验比率 | 累积经验比率 |',
  '| 1-40 | 85 | 0.94% | 0.94% |',
  '| 40-50 | 162 | 1.78% | 2.72% |',
  '| 50-60 | 998 | 11.0% | 13.7% |',
  '| 60-70 | 1443 | 15.8% | 29.5% |',
  '| 70-80 | 1600 | 17.6% | 47.1% |',
  '| 80-90 | 2400 | 26.4% | 73.5% |',
  '| 90-100 | 2400 | 26.4% | 100% |',
  '最后，80-90（目前尚未开放100级）的那部分经验',
]

function nodeName(node) {
  return Object.keys(node).find((key) => key !== ':@' && key !== '#text')
}

function childrenOf(node) {
  if (!node) return []
  if (Array.isArray(node)) return node
  const name = nodeName(node)
  const value = name ? node[name] : node
  return Array.isArray(value) ? value : []
}

function collectParsedTextNodes(node, nodes = []) {
  if (!node || typeof node !== 'object') return nodes
  if (Array.isArray(node)) {
    for (const child of node) collectParsedTextNodes(child, nodes)
    return nodes
  }
  if (Object.hasOwn(node, '#text')) nodes.push(node['#text'])
  for (const child of childrenOf(node)) collectParsedTextNodes(child, nodes)
  return nodes
}

function extractRawTextLexemes(xml) {
  return [...xml.matchAll(/<w:t(?:\s[^>]*)?>(.*?)<\/w:t>/g)].map((match) =>
    match[1]
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"')
      .replaceAll('&apos;', "'")
      .replaceAll('&amp;', '&'),
  )
}

function assertSubsequence(actual, expected, message) {
  let offset = 0
  for (const value of expected) {
    const index = actual.indexOf(value, offset)
    assert.notEqual(
      index,
      -1,
      `${message}: missing ${JSON.stringify(value)} after offset ${offset}`,
    )
    offset = index + 1
  }
}

async function loadRegisteredDocxXml(assetId) {
  const ledger = JSON.parse(
    await readFile('content/governance/source-assets.json', 'utf8'),
  )
  const asset = ledger.assets.find((candidate) => candidate.id === assetId)
  assert.ok(asset, `${assetId} must be registered in source-assets.json`)
  const sourcePath = path.join(ledger.sourceRoot.path, asset.origin.path)
  if (!existsSync(sourcePath)) {
    console.log(`SKIP docx-lexical-fidelity: local source DOCX is unavailable: ${sourcePath}`)
    process.exit(0)
  }
  const zip = unzipSync(new Uint8Array(await readFile(sourcePath)))
  return Buffer.from(zip['word/document.xml']).toString('utf8')
}

const failures = []
function check(name, callback) {
  try {
    callback()
  } catch (error) {
    failures.push(`${name}: ${error.message}`)
  }
}

const fixtureXml = await readFile(fixturePath, 'utf8')
const parsedFixtureTextNodes = collectParsedTextNodes(
  parseWordprocessingXml(fixtureXml),
)
const rawFixtureLexemes = extractRawTextLexemes(fixtureXml)

check('fixture preserves every expected raw w:t lexeme', () => {
  assertSubsequence(rawFixtureLexemes, lexicalFixtureValues, 'fixture raw XML')
})

check('parseWordprocessingXml keeps numeric-looking w:t values as strings', () => {
  for (const value of lexicalFixtureValues) {
    assert.ok(
      parsedFixtureTextNodes.includes(value),
      `parsed text nodes must include ${JSON.stringify(value)} as a string`,
    )
  }
})

check('parseWordprocessingXml does not coerce w:t lexemes to numbers', () => {
  const coercedValues = parsedFixtureTextNodes.filter(
    (value) => typeof value !== 'string',
  )
  assert.deepEqual(coercedValues, [])
})

const levelingXml = await loadRegisteredDocxXml(levelingAssetId)
const levelingLexemes = extractRawTextLexemes(levelingXml)
const levelingPage = await readFile(levelingPagePath, 'utf8')

check('registered source DOCX contains the screenshot leveling table lexemes', () => {
  assertSubsequence(levelingLexemes, levelingTableLexemes, 'leveling source XML')
})

check('public leveling page preserves the screenshot heading, table, and paragraphs', () => {
  const expectedNarrativeFragments = expectedLevelingPageFragments.filter(
    (fragment) => !fragment.startsWith('|'),
  )
  for (const fragment of expectedNarrativeFragments) {
    assert.ok(
      levelingPage.includes(fragment),
      `target page must include ${JSON.stringify(fragment)}`,
    )
  }
  const tableSourceId = 'src-6eba63c4aa7b:table:766f6679573ff408'
  const tableMarkup = levelingPage.match(
    new RegExp(
      `<table[^>]*data-source-table="${tableSourceId}"[^>]*>[\\s\\S]*?</table>`,
    ),
  )?.[0]
  assert.ok(tableMarkup, `target page must include table ${tableSourceId}`)
  const visibleTableText = tableMarkup
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, '')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/\s+/gu, '')
  const expectedTableRows = expectedLevelingPageFragments
    .filter((fragment) => fragment.startsWith('|'))
    .map((row) => row.split('|').slice(1, -1).join('').replace(/\s+/gu, ''))
  for (const row of expectedTableRows) {
    assert.ok(
      visibleTableText.includes(row),
      `target table must include ${JSON.stringify(row)}`,
    )
  }
})

if (failures.length > 0) {
  assert.fail(
    `DOCX lexical fidelity regressions:\n${failures
      .map((failure) => `- ${failure}`)
      .join('\n')}`,
  )
}

console.log('docx-lexical-fidelity tests passed.')

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  loadPages,
  printResult,
  readJson,
  writeReport,
} from './lib/content-utils.mjs'

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function extractImportedBody(markdown, filePath) {
  const startMarker = '## Imported Body'
  const endMarker = '## Quarantine Review Items'
  const start = markdown.indexOf(startMarker)
  const end = markdown.indexOf(endMarker)
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`${filePath}: imported body markers are missing or invalid`)
  }
  const contentStart = markdown.indexOf('\n', start + startMarker.length) + 1
  return markdown.slice(contentStart, end).trim()
}

const SOURCE_IMPORTS = new Map([
  ['src-7d080e8d651b', 'content/imports/docx/arena'],
  ['src-d35e870ffcd7', 'content/imports/docx/advanced/encounter'],
  ['src-51475ba227c9', 'content/imports/docx/advanced/endless-sea'],
  [
    'src-c8852cf69a7b',
    'content/imports/docx/advanced/damage-calculation',
  ],
  ['src-e2d43eca15b2', 'content/imports/docx/advanced/laguz'],
])

const EXPECTED_BY_ASSET = new Map([
  [
    'src-7d080e8d651b',
    { paragraphs: 451, headings: 79, tables: 82, drawings: 490, media: 119, formulas: 0 },
  ],
  [
    'src-d35e870ffcd7',
    { paragraphs: 340, headings: 41, tables: 17, drawings: 69, media: 58, formulas: 0 },
  ],
  [
    'src-51475ba227c9',
    { paragraphs: 155, headings: 28, tables: 1, drawings: 13, media: 13, formulas: 0 },
  ],
  [
    'src-c8852cf69a7b',
    { paragraphs: 624, headings: 86, tables: 49, drawings: 222, media: 223, formulas: 24 },
  ],
  [
    'src-e2d43eca15b2',
    { paragraphs: 184, headings: 0, tables: 0, drawings: 37, media: 37, formulas: 0 },
  ],
])

const manifest = await readJson(
  'content/migrations/advanced-content-pages.json',
)
const stage4 = await readJson('content/migration/stage4-docx-map.json')
const fullMap = await readJson('content/migrations/full-content-map.json')
const pages = await loadPages()
const byId = new Map(pages.map((page) => [page.frontmatter.id, page]))
const failures = []
const pageIds = []
const advancedAssetIds = new Set(SOURCE_IMPORTS.keys())
const localTotals = {
  paragraphs: 0,
  headings: 0,
  tables: 0,
  drawings: 0,
  media: 0,
  formulas: 0,
}

if (manifest.sources?.length !== 5) {
  failures.push(
    `advanced source count: expected 5, got ${manifest.sources?.length ?? 0}`,
  )
}
if (manifest.summary?.sourcePages !== 18) {
  failures.push(
    `advanced source page count: expected 18, got ${manifest.summary?.sourcePages ?? 0}`,
  )
}
if (manifest.summary?.editorialOverviews !== 5) {
  failures.push(
    `advanced overview count: expected 5, got ${manifest.summary?.editorialOverviews ?? 0}`,
  )
}
if (manifest.summary?.coveredChars !== manifest.summary?.sourceChars) {
  failures.push(
    `advanced source coverage: ${manifest.summary?.coveredChars}/${manifest.summary?.sourceChars}`,
  )
}

for (const source of manifest.sources ?? []) {
  const importDir = SOURCE_IMPORTS.get(source.sourceAssetId)
  if (!importDir) {
    failures.push(`${source.sourceAssetId}: unknown advanced source`)
    continue
  }
  const reviewPath = path.join(importDir, 'review.md')
  const reportPath = path.join(importDir, 'import-report.json')
  const imported = extractImportedBody(
    await readFile(reviewPath, 'utf8'),
    reviewPath,
  )
  const importReport = JSON.parse(await readFile(reportPath, 'utf8'))
  const stageEntry = stage4.assets.find(
    (asset) => asset.assetId === source.sourceAssetId,
  )
  const expected = EXPECTED_BY_ASSET.get(source.sourceAssetId)
  if (!stageEntry || !expected) {
    failures.push(`${source.sourceAssetId}: missing Stage 4 baseline`)
    continue
  }
  for (const field of Object.keys(localTotals)) {
    localTotals[field] += importReport.counts[field]
    if (
      importReport.counts[field] !== expected[field] ||
      stageEntry.counts[field] !== expected[field]
    ) {
      failures.push(
        `${source.sourceAssetId}: ${field} baseline differs from ${expected[field]}`,
      )
    }
  }
  if (
    sha256(imported) !== source.sourceBodySha256 ||
    imported.length !== source.sourceChars
  ) {
    failures.push(`${source.sourceAssetId}: source body hash or length changed`)
  }

  const ordered = [...source.pages].sort(
    (left, right) => left.sourceRange.start - right.sourceRange.start,
  )
  const bodyIndexed = importReport.elements.filter((element) =>
    Number.isInteger(element.sourcePosition?.bodyIndex),
  )
  let charCursor = 0
  let bodyCursor = Math.min(
    ...bodyIndexed.map((element) => element.sourcePosition.bodyIndex),
  )
  let tableCursor = 1
  for (const entry of ordered) {
    pageIds.push(entry.pageId)
    if (entry.sourceRange.start !== charCursor) {
      failures.push(
        `${entry.pageId}: source gap or overlap at ${charCursor}/${entry.sourceRange.start}`,
      )
    }
    const slice = imported.slice(
      entry.sourceRange.start,
      entry.sourceRange.end,
    )
    if (
      sha256(slice) !== entry.sourceSliceSha256 ||
      slice.length !== entry.sourceChars
    ) {
      failures.push(`${entry.pageId}: source slice hash or length changed`)
    }
    charCursor = entry.sourceRange.end
    if (entry.sourceElementRange?.bodyIndexStart !== bodyCursor) {
      failures.push(`${entry.pageId}: body range is not contiguous`)
    }
    bodyCursor = entry.sourceElementRange?.bodyIndexEndExclusive
    if (entry.sourceElementRange?.tableIndexStart !== tableCursor) {
      failures.push(`${entry.pageId}: table range is not contiguous`)
    }
    tableCursor = entry.sourceElementRange?.tableIndexEndExclusive

    const page = byId.get(entry.pageId)
    if (!page) {
      failures.push(`${entry.pageId}: generated page is missing`)
      continue
    }
    if (
      page.filePath !== entry.file ||
      page.route !== entry.route ||
      sha256(page.source) !== entry.outputSha256
    ) {
      failures.push(`${entry.pageId}: generated page path, route, or hash drifted`)
    }
    const sourceRef = (page.frontmatter.sources ?? []).find(
      (candidate) => candidate.assetId === source.sourceAssetId,
    )
    if (
      !sourceRef ||
      sourceRef.permission !== 'authorized' ||
      sourceRef.publicUse?.body !== true ||
      sourceRef.publicUse?.asset !== false
    ) {
      failures.push(`${entry.pageId}: authorized source boundary is invalid`)
    }
    if (page.frontmatter.status !== 'draft' || entry.status !== 'draft') {
      failures.push(`${entry.pageId}: source-backed page must remain draft`)
    }
  }
  if (charCursor !== imported.length) {
    failures.push(
      `${source.sourceAssetId}: source coverage ends at ${charCursor}/${imported.length}`,
    )
  }
  const expectedBodyEnd =
    Math.max(
      ...bodyIndexed.map((element) => element.sourcePosition.bodyIndex),
    ) + 1
  if (bodyCursor !== expectedBodyEnd) {
    failures.push(
      `${source.sourceAssetId}: body coverage ends at ${bodyCursor}/${expectedBodyEnd}`,
    )
  }
  if (tableCursor !== importReport.counts.tables + 1) {
    failures.push(
      `${source.sourceAssetId}: table coverage ends at ${tableCursor}/${importReport.counts.tables + 1}`,
    )
  }
}

for (const entry of manifest.editorialOverviews ?? []) {
  const page = byId.get(entry.pageId)
  if (!page) {
    failures.push(`${entry.pageId}: editorial overview is missing`)
    continue
  }
  if (
    page.filePath !== entry.file ||
    page.route !== entry.route ||
    sha256(page.source) !== entry.outputSha256
  ) {
    failures.push(`${entry.pageId}: overview path, route, or hash drifted`)
  }
  if (page.frontmatter.status !== 'draft' || entry.status !== 'draft') {
    failures.push(`${entry.pageId}: editorial overview must remain draft`)
  }
  const sourceRef = (page.frontmatter.sources ?? []).find((source) =>
    advancedAssetIds.has(source.assetId),
  )
  if (
    !sourceRef ||
    sourceRef.permission !== 'authorized' ||
    sourceRef.publicUse?.body !== true ||
    sourceRef.publicUse?.asset !== false
  ) {
    failures.push(`${entry.pageId}: overview authorization boundary is invalid`)
  }
}

const expectedLocalTotals = {
  paragraphs: 1754,
  headings: 234,
  tables: 149,
  drawings: 831,
  media: 450,
  formulas: 24,
}
for (const [field, expected] of Object.entries(expectedLocalTotals)) {
  if (localTotals[field] !== expected) {
    failures.push(
      `advanced ${field}: expected ${expected}, got ${localTotals[field]}`,
    )
  }
}

const allowedPageIds = new Set(pageIds)
const advancedElements = fullMap.elements.filter((element) =>
  advancedAssetIds.has(element.sourceAssetId),
)
const advancedRelations = fullMap.drawingRelations.filter((relation) =>
  advancedAssetIds.has(relation.sourceAssetId),
)
for (const entry of [...advancedElements, ...advancedRelations]) {
  if (
    entry.targetPageIds.length === 0 ||
    entry.targetPageIds.some((pageId) => !allowedPageIds.has(pageId))
  ) {
    failures.push(
      `${entry.sourceElementId ?? entry.sourceRelationId}: invalid advanced page ownership`,
    )
  }
}
const formulas = advancedElements.filter(
  (element) => element.elementType === 'formula',
)
if (
  formulas.length !== 24 ||
  formulas.some(
    (formula) =>
      formula.sourceAssetId !== 'src-c8852cf69a7b' ||
      !formula.equivalent?.value ||
      !formula.equivalent?.reviewStatus ||
      !formula.factReviewer ||
      formula.targetPageIds.length === 0,
  )
) {
  failures.push('advanced formula closure is incomplete')
}

if (new Set(pageIds).size !== pageIds.length) {
  failures.push('advanced page IDs are not unique')
}

const report = {
  schemaVersion: 1,
  summary: {
    sourceAssets: manifest.sources?.length ?? 0,
    sourcePages: manifest.summary?.sourcePages ?? 0,
    editorialOverviews: manifest.summary?.editorialOverviews ?? 0,
    sourceChars: manifest.summary?.sourceChars ?? 0,
    coveredChars: manifest.summary?.coveredChars ?? 0,
    ...localTotals,
    mappedElements: advancedElements.length,
    mappedDrawingRelations: advancedRelations.length,
    failures: failures.length,
  },
  pageIds,
  failures,
}
const reportPath = await writeReport('advanced-content-migration', report)
printResult('Advanced content migration validation', failures, reportPath)

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
  ['src-9ac6e41a613e', 'content/imports/docx/core/preface/review.md'],
  ['src-ea0b63d069bf', 'content/imports/docx/core/game-intro/review.md'],
  ['src-842246bdb075', 'content/imports/docx/core/beginner/review.md'],
  ['src-6eba63c4aa7b', 'content/imports/docx/core/leveling/review.md'],
  ['src-d47e51aa8321', 'content/imports/docx/core/event-push/review.md'],
  ['src-94e76e4522b1', 'content/imports/docx/core/pve-team/review.md'],
])

const migration = await readJson('content/migrations/core-content-pages.json')
const pages = await loadPages()
const byId = new Map(pages.map((page) => [page.frontmatter.id, page]))
const failures = []

if (migration.sources?.length !== 6) {
  failures.push(`core source count: expected 6, got ${migration.sources?.length ?? 0}`)
}
if (migration.summary?.sourcePages !== 13) {
  failures.push(
    `source-backed page count: expected 13, got ${migration.summary?.sourcePages ?? 0}`,
  )
}
if (migration.summary?.editorialOverviews !== 3) {
  failures.push(
    `editorial overview count: expected 3, got ${migration.summary?.editorialOverviews ?? 0}`,
  )
}
if (migration.summary?.coveredChars !== migration.summary?.sourceChars) {
  failures.push(
    `source character coverage: ${migration.summary?.coveredChars}/${migration.summary?.sourceChars}`,
  )
}

const pageIds = []
for (const source of migration.sources ?? []) {
  const importPath = SOURCE_IMPORTS.get(source.sourceAssetId)
  if (!importPath) {
    failures.push(`${source.sourceAssetId}: no core import path`)
    continue
  }
  const imported = extractImportedBody(
    await readFile(importPath, 'utf8'),
    importPath,
  )
  if (sha256(imported) !== source.sourceBodySha256) {
    failures.push(`${source.sourceAssetId}: source body hash changed`)
  }
  if (imported.length !== source.sourceChars) {
    failures.push(`${source.sourceAssetId}: source body character count changed`)
  }
  const ordered = [...source.pages].sort(
    (left, right) => left.sourceRange.start - right.sourceRange.start,
  )
  const importReport = JSON.parse(
    await readFile(
      path.join(path.dirname(importPath), 'import-report.json'),
      'utf8',
    ),
  )
  const bodyIndexedElements = importReport.elements.filter((element) =>
    Number.isInteger(element.sourcePosition?.bodyIndex),
  )
  const expectedBodyStart = Math.min(
    ...bodyIndexedElements.map((element) => element.sourcePosition.bodyIndex),
  )
  const expectedBodyEnd =
    Math.max(
      ...bodyIndexedElements.map((element) => element.sourcePosition.bodyIndex),
    ) + 1
  let cursor = 0
  let bodyCursor = expectedBodyStart
  let tableCursor = 1
  for (const entry of ordered) {
    pageIds.push(entry.pageId)
    if (entry.sourceRange.start !== cursor) {
      failures.push(
        `${source.sourceAssetId}: gap or overlap before ${entry.pageId} at ${cursor}/${entry.sourceRange.start}`,
      )
    }
    const slice = imported.slice(entry.sourceRange.start, entry.sourceRange.end)
    if (sha256(slice) !== entry.sourceSliceSha256) {
      failures.push(`${entry.pageId}: source slice hash changed`)
    }
    if (slice.length !== entry.sourceChars) {
      failures.push(`${entry.pageId}: source slice character count changed`)
    }
    cursor = entry.sourceRange.end
    if (entry.sourceElementRange?.bodyIndexStart !== bodyCursor) {
      failures.push(
        `${entry.pageId}: body element range starts at ${entry.sourceElementRange?.bodyIndexStart}, expected ${bodyCursor}`,
      )
    }
    if (
      !Number.isInteger(entry.sourceElementRange?.bodyIndexEndExclusive) ||
      entry.sourceElementRange.bodyIndexEndExclusive <= bodyCursor
    ) {
      failures.push(`${entry.pageId}: invalid body element range`)
    } else {
      bodyCursor = entry.sourceElementRange.bodyIndexEndExclusive
    }
    if (entry.sourceElementRange?.tableIndexStart !== tableCursor) {
      failures.push(
        `${entry.pageId}: table element range starts at ${entry.sourceElementRange?.tableIndexStart}, expected ${tableCursor}`,
      )
    }
    if (
      !Number.isInteger(entry.sourceElementRange?.tableIndexEndExclusive) ||
      entry.sourceElementRange.tableIndexEndExclusive < tableCursor
    ) {
      failures.push(`${entry.pageId}: invalid table element range`)
    } else {
      tableCursor = entry.sourceElementRange.tableIndexEndExclusive
    }

    const page = byId.get(entry.pageId)
    if (!page) {
      failures.push(`${entry.pageId}: generated page is missing`)
      continue
    }
    if (page.filePath !== entry.file || page.route !== entry.route) {
      failures.push(`${entry.pageId}: generated page path or route drifted`)
    }
    if (sha256(page.source) !== entry.outputSha256) {
      failures.push(`${entry.pageId}: generated page hash drifted`)
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
      failures.push(`${entry.pageId}: authorized body/source boundary is invalid`)
    }
    if (
      (page.frontmatter.reviewers ?? []).some(
        (reviewer) => reviewer.name === '待指派',
      )
    ) {
      failures.push(`${entry.pageId}: reviewer is still unassigned`)
    }
  }
  if (cursor !== imported.length) {
    failures.push(
      `${source.sourceAssetId}: source coverage ends at ${cursor}/${imported.length}`,
    )
  }
  if (bodyCursor !== expectedBodyEnd) {
    failures.push(
      `${source.sourceAssetId}: body element coverage ends at ${bodyCursor}/${expectedBodyEnd}`,
    )
  }
  const expectedTableEnd =
    importReport.elements.filter(
      (element) => element.elementType === 'table',
    ).length + 1
  if (tableCursor !== expectedTableEnd) {
    failures.push(
      `${source.sourceAssetId}: table element coverage ends at ${tableCursor}/${expectedTableEnd}`,
    )
  }
}

if (new Set(pageIds).size !== pageIds.length) {
  failures.push('core content page IDs are not unique')
}

const readingPath = [
  ['start-game-introduction', './first-week'],
  ['start-first-week', '../progression/leveling'],
  ['progression-leveling', '../combat/event-maps'],
  ['combat-event-maps', './pve-team-building'],
]
for (const [pageId, expectedLink] of readingPath) {
  const page = byId.get(pageId)
  if (!page) {
    failures.push(`${pageId}: core reading path page is missing`)
  } else if (!page.body.includes(`](${expectedLink})`)) {
    failures.push(`${pageId}: missing core reading path link ${expectedLink}`)
  }
}

const report = {
  schemaVersion: 1,
  summary: {
    sourceAssets: migration.sources?.length ?? 0,
    sourcePages: migration.summary?.sourcePages ?? 0,
    editorialOverviews: migration.summary?.editorialOverviews ?? 0,
    sourceChars: migration.summary?.sourceChars ?? 0,
    coveredChars: migration.summary?.coveredChars ?? 0,
    uniquePageIds: new Set(pageIds).size,
    readingPathSteps: readingPath.length,
    failures: failures.length,
  },
  pageIds,
  failures,
}
const reportPath = await writeReport('core-content-migration', report)
printResult('Core content migration validation', failures, reportPath)

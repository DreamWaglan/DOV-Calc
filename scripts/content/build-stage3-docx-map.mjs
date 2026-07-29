import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const mapPath = path.join(root, 'content', 'migration', 'stage3-docx-map.json')
const generatedAt = '2026-07-29T00:00:00.000Z'

const specifications = [
  {
    assetId: 'src-9ac6e41a613e',
    importDir: 'preface',
    suggestedPageId: 'start-preface',
  },
  {
    assetId: 'src-ea0b63d069bf',
    importDir: 'game-intro',
    suggestedPageId: 'start-game-introduction',
  },
  {
    assetId: 'src-842246bdb075',
    importDir: 'beginner',
    suggestedPageId: 'start-first-week',
  },
  {
    assetId: 'src-6eba63c4aa7b',
    importDir: 'leveling',
    suggestedPageId: 'progression-leveling',
  },
  {
    assetId: 'src-d47e51aa8321',
    importDir: 'event-push',
    suggestedPageId: 'combat-event-maps',
  },
  {
    assetId: 'src-94e76e4522b1',
    importDir: 'pve-team',
    suggestedPageId: 'combat-pve-team-building',
  },
]

function headingsFromReview(markdown) {
  const excluded = new Set([
    'Imported Body',
    'Quarantine Review Items',
  ])
  return [...markdown.matchAll(/^(#{1,6})\s+(.+)$/gm)]
    .map((match) => ({
      level: match[1].length,
      title: match[2].trim(),
    }))
    .filter(
      (heading) =>
        !heading.title.startsWith('DOCX Import Review:') &&
        !excluded.has(heading.title),
    )
    .slice(0, 60)
}

const assets = []
for (const specification of specifications) {
  const importRoot = path.join(
    root,
    'content',
    'imports',
    'docx',
    'core',
    specification.importDir,
  )
  const report = JSON.parse(
    await readFile(path.join(importRoot, 'import-report.json'), 'utf8'),
  )
  const review = await readFile(path.join(importRoot, 'review.md'), 'utf8')

  if (
    report.assetId !== specification.assetId ||
    report.permission !== 'pending' ||
    report.publishable !== false
  ) {
    throw new Error(
      `${specification.importDir}: import report does not match the pending source specification`,
    )
  }

  assets.push({
    assetId: specification.assetId,
    sourceFileName: report.source.fileName,
    importDir: specification.importDir,
    hash: report.source.sha256,
    counts: report.counts,
    headingOutline: headingsFromReview(review),
    suggestedPageId: specification.suggestedPageId,
    reviewItems: report.reviewItems,
    publishable: false,
  })
}

const map = {
  schemaVersion: 1,
  generatedAt,
  source: 'content/imports/docx/core',
  assets,
}

await writeFile(mapPath, `${JSON.stringify(map, null, 2)}\n`, 'utf8')
console.log(
  `Stage 3 DOCX map generated: ${path.relative(root, mapPath)} (${assets.length} assets)`,
)

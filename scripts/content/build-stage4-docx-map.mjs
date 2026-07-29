import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const outputPath = path.join(
  root,
  'content',
  'migration',
  'stage4-docx-map.json',
)

const specifications = [
  {
    assetId: 'src-7d080e8d651b',
    importDir: 'arena',
    importPath: ['content', 'imports', 'docx', 'arena'],
    suggestedPageId: 'combat-pvp-arena',
  },
  {
    assetId: 'src-d35e870ffcd7',
    importDir: 'advanced/encounter',
    importPath: ['content', 'imports', 'docx', 'advanced', 'encounter'],
    suggestedPageId: 'combat-encounter',
  },
  {
    assetId: 'src-51475ba227c9',
    importDir: 'advanced/endless-sea',
    importPath: ['content', 'imports', 'docx', 'advanced', 'endless-sea'],
    suggestedPageId: 'combat-endless-sea',
  },
  {
    assetId: 'src-c8852cf69a7b',
    importDir: 'advanced/damage-calculation',
    importPath: [
      'content',
      'imports',
      'docx',
      'advanced',
      'damage-calculation',
    ],
    suggestedPageId: 'mechanics-damage-model',
  },
  {
    assetId: 'src-e2d43eca15b2',
    importDir: 'advanced/laguz',
    importPath: ['content', 'imports', 'docx', 'advanced', 'laguz'],
    suggestedPageId: 'topic-laguz',
  },
]

function extractHeadings(markdown) {
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
  const importRoot = path.join(root, ...specification.importPath)
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
      `${specification.importDir}: import report violates the pending-source contract`,
    )
  }

  assets.push({
    assetId: specification.assetId,
    sourceFileName: report.source.fileName,
    importDir: specification.importDir,
    hash: report.source.sha256,
    counts: report.counts,
    headingOutline: extractHeadings(review),
    suggestedPageId: specification.suggestedPageId,
    reviewItems: report.reviewItems,
    permission: 'pending',
    publishable: false,
  })
}

const map = {
  schemaVersion: 1,
  generatedAt: '2026-07-29T00:00:00.000Z',
  source: 'content/imports/docx',
  assets,
}

await writeFile(outputPath, `${JSON.stringify(map, null, 2)}\n`, 'utf8')
console.log(
  `Stage 4 DOCX map generated: ${path.relative(root, outputPath)} (${assets.length} assets)`,
)

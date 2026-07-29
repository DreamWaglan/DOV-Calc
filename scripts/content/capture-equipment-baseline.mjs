import { createHash } from 'node:crypto'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const sourcePath = path.resolve(
  process.argv[2] ?? 'docs/.vitepress/data/equipment-data.json',
)
const outputPath = path.resolve(
  process.argv[3] ?? 'tests/fixtures/equipment-baseline.json',
)
const publicRoot = path.resolve(
  process.argv[4] ?? 'docs/public',
)

const sourceText = await readFile(sourcePath, 'utf8')
const source = JSON.parse(sourceText)
const items = Array.isArray(source.items) ? source.items : []

const fieldNames = [...new Set(items.flatMap((item) => Object.keys(item)))].sort()
const fieldPresence = Object.fromEntries(
  fieldNames.map((field) => [
    field,
    {
      present: items.filter((item) => item[field] !== undefined).length,
      nullish: items.filter((item) => item[field] == null).length,
    },
  ]),
)

const categoryCounts = Object.fromEntries(
  [...new Set(items.map((item) => item.category ?? '(missing)'))]
    .sort((left, right) => String(left).localeCompare(String(right), 'zh-CN'))
    .map((category) => [
      category,
      items.filter((item) => (item.category ?? '(missing)') === category).length,
    ]),
)

const duplicateGroups = Object.entries(
  items.reduce((groups, item, index) => {
    const key = `${item.category ?? ''}::${item.name ?? ''}`
    groups[key] ??= []
    groups[key].push(index)
    return groups
  }, {}),
)
  .filter(([, indexes]) => indexes.length > 1)
  .map(([key, indexes]) => ({ key, indexes }))

const idIndexes = items.reduce((groups, item, index) => {
  const key = String(item.id ?? '(missing)')
  groups[key] ??= []
  groups[key].push(index)
  return groups
}, {})
const duplicateIds = Object.entries(idIndexes)
  .filter(([, indexes]) => indexes.length > 1)
  .map(([id, indexes]) => ({ id, indexes }))
const numericIds = items
  .map((item) => item.id)
  .filter((id) => Number.isInteger(id))
  .sort((left, right) => left - right)

const requiredFields = ['category', 'name', 'image']
const missingRequired = items.flatMap((item, index) =>
  requiredFields
    .filter((field) => item[field] == null || item[field] === '')
    .map((field) => ({ index, field })),
)

function publicAssetPath(imagePath) {
  if (typeof imagePath !== 'string' || imagePath.length === 0) return null
  const normalized = imagePath
    .replace(/^\/DOV-Calc\//i, '/')
    .replace(/^\/+/, '')
  return path.join(publicRoot, ...normalized.split('/'))
}

const imageChecks = []
for (const [index, item] of items.entries()) {
  const candidate = publicAssetPath(item.image)
  let exists = false
  if (candidate) {
    exists = await access(candidate).then(
      () => true,
      () => false,
    )
  }
  imageChecks.push({
    index,
    image: item.image ?? null,
    resolvedPath: candidate ? path.relative(process.cwd(), candidate).split(path.sep).join('/') : null,
    exists,
  })
}

const canonicalItemHash = createHash('sha256')
  .update(JSON.stringify(items), 'utf8')
  .digest('hex')

const baseline = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  sourcePath: path.relative(process.cwd(), sourcePath).split(path.sep).join('/'),
  sourceSha256: createHash('sha256').update(sourceText, 'utf8').digest('hex'),
  metadata: source.metadata ?? null,
  itemCount: items.length,
  primaryKey: 'id',
  primaryKeyEvidence: {
    duplicateIds,
    missingIds: items
      .map((item, index) => ({ index, id: item.id }))
      .filter((entry) => !Number.isInteger(entry.id)),
    contiguousFromOne:
      numericIds.length === items.length &&
      numericIds.every((id, index) => id === index + 1),
  },
  secondaryNaturalKeyCandidate: ['category', 'name'],
  canonicalItemsSha256: canonicalItemHash,
  fieldNames,
  fieldPresence,
  categoryCounts,
  duplicateGroups,
  missingRequired,
  images: {
    totalReferences: imageChecks.filter((entry) => entry.image).length,
    existing: imageChecks.filter((entry) => entry.exists).length,
    missing: imageChecks.filter((entry) => entry.image && !entry.exists),
    hardcodedBaseReferences: imageChecks.filter((entry) =>
      /^\/DOV-Calc\//i.test(entry.image ?? ''),
    ).length,
  },
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8')
console.log(
  `Equipment baseline written: ${outputPath} (${baseline.itemCount} items, ${baseline.images.missing.length} missing images).`,
)

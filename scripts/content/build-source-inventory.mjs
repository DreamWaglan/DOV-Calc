import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const supportedExtensions = new Set(['.docx', '.xlsx', '.png', '.jpg', '.jpeg'])

const sourceRoot = path.resolve(
  process.argv[2] ?? process.env.FUXIAO_SOURCE_ROOT ?? '',
)
const outputPath = path.resolve(
  process.argv[3] ?? 'content/governance/source-assets.json',
)
const previousManifest = await readFile(outputPath, 'utf8').then(
  (text) => JSON.parse(text),
  () => null,
)
const previousById = new Map(
  (previousManifest?.assets ?? []).map((asset) => [asset.id, asset]),
)
const previousByHash = new Map(
  (previousManifest?.assets ?? []).map((asset) => [
    asset.hashes?.sha256,
    asset,
  ]),
)

if (!process.argv[2] && !process.env.FUXIAO_SOURCE_ROOT) {
  console.error(
    'Usage: node scripts/content/build-source-inventory.mjs <source-root> [output-path]',
  )
  process.exit(2)
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(absolutePath)))
      continue
    }

    if (entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(absolutePath)
    }
  }

  return files
}

function normalizeRelativePath(absolutePath) {
  return path.relative(sourceRoot, absolutePath).split(path.sep).join('/')
}

function classify(extension) {
  if (extension === '.docx') {
    return {
      assetType: 'docx',
    }
  }

  if (extension === '.xlsx') {
    return {
      assetType: 'xlsx',
    }
  }

  return {
    assetType: 'image',
  }
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(filePath)
    stream.on('error', reject)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

function stableSourceId(relativePath) {
  const digest = createHash('sha256').update(relativePath, 'utf8').digest('hex')
  return `src-${digest.slice(0, 12)}`
}

const files = (await listFiles(sourceRoot)).sort((left, right) =>
  normalizeRelativePath(left).localeCompare(normalizeRelativePath(right), 'zh-CN'),
)

const assets = []
for (const absolutePath of files) {
  const fileStat = await stat(absolutePath)
  const relativePath = normalizeRelativePath(absolutePath)
  const extension = path.extname(absolutePath).toLowerCase()
  const classification = classify(extension)
  const candidateId = stableSourceId(relativePath)
  const sha256 = await sha256File(absolutePath)
  const previous =
    previousById.get(candidateId) ?? previousByHash.get(sha256) ?? null
  const id = previous?.id ?? candidateId
  const defaultPublicRelease = {
    body: false,
    asset: false,
    searchIndex: false,
    sitemap: false,
    download: false,
    derivative: false,
    structuredData: false,
    mode: 'blocked',
    reason: '作者、适用版本和公开转载许可尚未完成签核。',
  }

  assets.push({
    id,
    title: path.basename(absolutePath),
    extension,
    ...classification,
    sizeBytes: fileStat.size,
    modifiedAt: fileStat.mtime.toISOString(),
    sourceTier: previous?.sourceTier ?? 'unclassified',
    origin: {
      sourceType: 'local-file',
      sourceRootAlias: 'fuxiao-handbook-integrated',
      path: relativePath,
      updatedAt: fileStat.mtime.toISOString().slice(0, 10),
    },
    permission: previous?.permission ?? 'pending',
    status: previous?.status ?? 'needs-review',
    owners: previous?.owners ?? [
      {
        name: '待指派',
        role: '内容保管责任角色',
      },
    ],
    reviewers: previous?.reviewers ?? [
      {
        name: '待指派',
        role: '版权/来源责任人',
      },
      {
        name: '待指派',
        role: '事实审核人',
      },
    ],
    hashes: {
      sha256,
    },
    ...(previous?.licenseEvidence
      ? { licenseEvidence: previous.licenseEvidence }
      : {}),
    ...(previous?.authorization
      ? { authorization: previous.authorization }
      : {}),
    publicRelease: {
      ...defaultPublicRelease,
      ...(previous?.publicRelease ?? {}),
    },
    importedAt: previous?.importedAt ?? new Date().toISOString(),
    notes:
      previous?.notes ??
      '源文件已登记；具体作者、适用版本和许可须在内容迁移前补齐。',
  })
}

const totalsByKind = Object.fromEntries(
  ['docx', 'xlsx', 'image'].map((assetType) => [
    assetType,
    assets.filter((asset) => asset.assetType === assetType).length,
  ]),
)

const manifest = {
  schemaVersion: 1,
  entrySchema: '../schemas/source-asset.schema.json',
  generatedAt: new Date().toISOString(),
  sourceRoot: {
    alias: 'fuxiao-handbook-integrated',
    path: sourceRoot,
  },
  expectedAssetCount: 29,
  assetCount: assets.length,
  totalSizeBytes: assets.reduce((total, asset) => total + asset.sizeBytes, 0),
  totalsByKind,
  governanceDefaults: {
    permission: 'pending',
    publicRelease: false,
    rule: '默认不公开；只有 owned 或 authorized 资产完成证据登记后才可进入公开构建。',
  },
  ...(previousManifest?.authorizationUpdatedAt
    ? { authorizationUpdatedAt: previousManifest.authorizationUpdatedAt }
    : {}),
  assets,
}

await mkdir(path.dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

if (assets.length !== manifest.expectedAssetCount) {
  console.error(
    `Inventory written, but expected ${manifest.expectedAssetCount} assets and found ${assets.length}.`,
  )
  process.exitCode = 1
} else {
  console.log(
    `Inventory written: ${outputPath} (${assets.length} assets, ${manifest.totalSizeBytes} bytes).`,
  )
}

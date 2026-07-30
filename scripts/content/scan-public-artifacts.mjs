import { createHash } from 'node:crypto'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import {
  PUBLIC_RELEASE_FIELDS,
  derivePublicRelease,
} from './lib/authorization-policy.mjs'
import { validateDerivativeManifest } from './lib/public-artifact-policy.mjs'
import {
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'

const failures = []
const inventory = await readJson('content/governance/source-assets.json')
const publicAssets = await readJson('content/governance/public-assets.json')
const sourceById = new Map(
  (inventory.assets ?? []).map((asset) => [asset.id, asset]),
)
const sourceByHash = new Map(
  (inventory.assets ?? []).map((asset) => [asset.hashes?.sha256, asset]),
)
const protectedImageBasenames = new Map(
  (inventory.assets ?? [])
    .filter(
      (asset) =>
        asset.assetType === 'image' &&
        derivePublicRelease(asset).publicRelease.download !== true,
    )
    .map((asset) => [asset.title.toLocaleLowerCase('zh-CN'), asset]),
)

async function listPublicFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  )
  const files = []
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listPublicFiles(absolutePath)))
    if (entry.isFile()) files.push(absolutePath)
  }
  return files
}

const scanRoots = [
  path.join(root, 'docs', 'public'),
  path.join(root, 'docs', '.vitepress', 'dist'),
]
const files = []
for (const scanRoot of scanRoots) {
  if (
    await access(scanRoot).then(
      () => true,
      () => false,
    )
  ) {
    files.push(...(await listPublicFiles(scanRoot)))
  }
}

let exactSourceLeaks = 0
let sourceBasenameLeaks = 0
let internalMarkerLeaks = 0
let unregisteredPublicFiles = 0
const collectionRoots = (publicAssets.collections ?? []).map((collection) => {
  const absoluteRoot = path.join(root, collection.root)
  return {
    collection,
    absoluteRoot,
  }
})
for (const file of files) {
  const relativePath = path.relative(root, file).split(path.sep).join('/')
  const data = await readFile(file)
  const sha256 = createHash('sha256').update(data).digest('hex')
  const exactSource = sourceByHash.get(sha256)
  if (
    exactSource &&
    derivePublicRelease(exactSource).publicRelease.download !== true
  ) {
    exactSourceLeaks += 1
    failures.push(
      `${relativePath}: exact source bytes published while download=false (${exactSource.id})`,
    )
  }
  const protectedImage = protectedImageBasenames.get(
    path.basename(file).toLocaleLowerCase('zh-CN'),
  )
  if (protectedImage) {
    sourceBasenameLeaks += 1
    failures.push(
      `${relativePath}: source image basename published while download=false (${protectedImage.id})`,
    )
  }

  if (relativePath.startsWith('docs/public/')) {
    const registered = collectionRoots.some(
      ({ absoluteRoot }) =>
        file === absoluteRoot || file.startsWith(`${absoluteRoot}${path.sep}`),
    )
    if (!registered) {
      unregisteredPublicFiles += 1
      failures.push(`${relativePath}: public file is not registered in public-assets.json`)
    }
  }

  if (
    /\.(?:html|js|json|xml|txt|md|css|svg)$/i.test(relativePath) &&
    data.length <= 8 * 1024 * 1024
  ) {
    const text = data.toString('utf8')
    for (const marker of [
      'F:\\Visual Studio Project\\Project_Test\\拂晓手册',
      'content/imports/docx/',
      'review.md',
      'quarantine.json',
      'authorization-evidence/',
    ]) {
      if (text.includes(marker)) {
        internalMarkerLeaks += 1
        failures.push(`${relativePath}: contains internal marker ${marker}`)
      }
    }
  }
}

let collectionViolations = 0
for (const collection of publicAssets.collections ?? []) {
  const source = sourceById.get(collection.sourceId)
  if (!source) continue
  const decision = derivePublicRelease(source)
  if (collection.publicUse && collection.derivative === true) {
    if (!decision.publicRelease.derivative) {
      collectionViolations += 1
      failures.push(
        `${collection.id}: public derivative exceeds derivative scope for ${source.id}`,
      )
    } else {
      const manifestErrors = await validateDerivativeManifest({
        repositoryRoot: root,
        collection,
        source,
      })
      for (const error of manifestErrors) {
        collectionViolations += 1
        failures.push(`${collection.id}: ${error}`)
      }
    }
  } else if (
    collection.publicUse &&
    !decision.publicRelease.asset
  ) {
    collectionViolations += 1
    failures.push(
      `${collection.id}: public collection exceeds asset scope for ${source.id}`,
    )
  }
}

const report = {
  schemaVersion: 1,
  check: 'public-artifacts',
  generatedAt: new Date().toISOString(),
  scanRoots: scanRoots.map((entry) =>
    path.relative(root, entry).split(path.sep).join('/'),
  ),
  summary: {
    sourceAssets: sourceById.size,
    publicReleaseFields: PUBLIC_RELEASE_FIELDS.length,
    scannedFiles: files.length,
    exactSourceLeaks,
    sourceBasenameLeaks,
    unregisteredPublicFiles,
    internalMarkerLeaks,
    collectionViolations,
    failures: failures.length,
  },
  failures,
}
const reportPath = await writeReport('public-artifacts', report)
printResult('Public artifact scan', failures, reportPath)

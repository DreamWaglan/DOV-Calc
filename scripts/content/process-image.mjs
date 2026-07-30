import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import {
  importGovernance,
  loadSourceAsset,
  stableJson,
  stableSourceElementId,
} from './lib/migration-elements.mjs'

const MAX_DERIVATIVE_PIXELS = 4_500_000
const MAX_SOURCE_PIXELS = 50_000_000
const SEGMENT_HEIGHT = 4000
const THUMB_WIDTH = 360

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

async function fileInfo(filePath) {
  const data = await readFile(filePath)
  const stats = await stat(filePath)
  return { sha256: sha256(data), bytes: stats.size }
}

async function writeWebp(buffer, outputPath) {
  await writeFile(outputPath, buffer)
  const metadata = await sharp(buffer).metadata()
  return {
    width: metadata.width,
    height: metadata.height,
    ...(await fileInfo(outputPath)),
  }
}

function constrainedWidth(sourceWidth, sourceHeight, preferredWidth) {
  const pixelBound = Math.floor(
    Math.sqrt((MAX_DERIVATIVE_PIXELS * sourceWidth) / sourceHeight),
  )
  return Math.max(1, Math.min(sourceWidth, preferredWidth, pixelBound))
}

export async function processImage({
  sourcePath,
  assetId,
  outputDir,
  generateDerivatives = true,
}) {
  if (!sourcePath || !assetId || !outputDir) {
    throw new Error('processImage requires sourcePath, assetId, and outputDir')
  }

  const absoluteSourcePath = path.resolve(sourcePath)
  const absoluteOutputDir = path.resolve(outputDir)
  const source = await fileInfo(absoluteSourcePath)
  const image = sharp(absoluteSourcePath, {
    limitInputPixels: generateDerivatives ? MAX_SOURCE_PIXELS : false,
  })
  const metadata = await image.metadata()
  if (!metadata.width || !metadata.height) throw new Error('Unable to read image dimensions')
  const { asset } = await loadSourceAsset(assetId)
  if (asset.assetType !== 'image') {
    throw new Error(`${assetId} is registered as ${asset.assetType}, not image`)
  }
  if (asset.hashes.sha256 !== source.sha256) {
    throw new Error(`${assetId}: source SHA-256 does not match the source ledger`)
  }
  const governance = importGovernance(asset)

  await mkdir(absoluteOutputDir, { recursive: true })
  const derivatives = []

  if (generateDerivatives) {
    const thumbnailPath = path.join(absoluteOutputDir, 'thumbnail.webp')
    const thumbnailBuffer = await sharp(absoluteSourcePath, {
      limitInputPixels: MAX_SOURCE_PIXELS,
    })
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
    const thumbnail = await writeWebp(thumbnailBuffer, thumbnailPath)
    derivatives.push({
      kind: 'thumbnail',
      path: path.relative(process.cwd(), thumbnailPath).split(path.sep).join('/'),
      ...thumbnail,
      maxPixels: MAX_DERIVATIVE_PIXELS,
    })

    const segmentCount = Math.ceil(metadata.height / SEGMENT_HEIGHT)
    for (let index = 0; index < segmentCount; index += 1) {
      const top = index * SEGMENT_HEIGHT
      const height = Math.min(SEGMENT_HEIGHT, metadata.height - top)
      const width = constrainedWidth(metadata.width, height, metadata.width)
      const segmentPath = path.join(
        absoluteOutputDir,
        `segment-${String(index + 1).padStart(2, '0')}.webp`,
      )
      const segmentBuffer = await sharp(absoluteSourcePath, {
        limitInputPixels: MAX_SOURCE_PIXELS,
      })
        .extract({ left: 0, top, width: metadata.width, height })
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 88 })
        .toBuffer()
      const segment = await writeWebp(segmentBuffer, segmentPath)
      derivatives.push({
        kind: 'segment',
        index: index + 1,
        sourceCrop: { left: 0, top, width: metadata.width, height },
        path: path.relative(process.cwd(), segmentPath).split(path.sep).join('/'),
        ...segment,
        maxPixels: MAX_DERIVATIVE_PIXELS,
      })
    }
  }

  const manifest = {
    schemaVersion: 1,
    assetId,
    source: {
      fileName: path.basename(absoluteSourcePath),
      sha256: source.sha256,
      bytes: source.bytes,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    },
    ...governance,
    originalCopied: false,
    sourceElement: {
      sourceAssetId: assetId,
      sourceElementId: stableSourceElementId(assetId, 'image', {
        sourceFile: asset.origin.path,
      }),
      elementType: 'image',
      sourcePosition: {
        sourceFile: asset.origin.path,
      },
    },
    derivativePolicy: {
      generated: generateDerivatives,
      format: 'webp',
      maxDerivativePixels: MAX_DERIVATIVE_PIXELS,
      maxSourcePixels: MAX_SOURCE_PIXELS,
      segmentHeight: SEGMENT_HEIGHT,
    },
    derivatives,
  }

  const manifestPath = path.join(absoluteOutputDir, 'manifest.json')
  await writeFile(manifestPath, stableJson(manifest), 'utf8')
  return { ...manifest, manifestPath, outputDir: absoluteOutputDir }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [sourcePath, assetId, outputDir] = process.argv.slice(2)
  if (!sourcePath || !assetId || !outputDir) {
    console.error('Usage: node scripts/content/process-image.mjs <source-image> <asset-id> <output-dir>')
    process.exit(2)
  }
  const result = await processImage({ sourcePath, assetId, outputDir })
  console.log(
    `Image processed: ${path.relative(process.cwd(), result.manifestPath)} (${result.source.width}x${result.source.height}, ${result.derivatives.length} derivatives).`,
  )
}

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { importDocx } from '../../scripts/content/import-docx.mjs'
import { processImage } from '../../scripts/content/process-image.mjs'

const docxSource =
  'F:\\Visual Studio Project\\Project_Test\\拂晓手册\\7 主题攻略-进阶玩法篇\\7.1 争锋竞技场简易百科.docx'
const imageSource =
  'F:\\Visual Studio Project\\Project_Test\\拂晓手册\\5 立香也能看懂的一图流攻略合集\\2-拂晓新手入门思维导图 v2.4 260720.png'
const docxOutput = 'content/imports/docx/arena'
const imageOutput = 'content/imports/images/beginner-map'

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

if (!existsSync(docxSource) || !existsSync(imageSource)) {
  console.log('SKIP import-docx-image: local handbook source files are unavailable.')
  process.exit(0)
}

const firstDocx = await importDocx({
  sourcePath: docxSource,
  assetId: 'src-7d080e8d651b',
  outputDir: docxOutput,
})
const firstDocxFingerprint = await directoryFingerprint(docxOutput)
const secondDocx = await importDocx({
  sourcePath: docxSource,
  assetId: 'src-7d080e8d651b',
  outputDir: docxOutput,
})
const secondDocxFingerprint = await directoryFingerprint(docxOutput)
assert.equal(secondDocxFingerprint, firstDocxFingerprint, 'DOCX import output must be byte-stable')
assert.equal(firstDocx.source.sha256, secondDocx.source.sha256)
assert.equal(firstDocx.publishable, false)
assert.equal(firstDocx.permission, 'pending')
assert.equal(firstDocx.counts.paragraphs, 451)
assert.equal(firstDocx.counts.tables, 82)
assert.equal(firstDocx.counts.drawings, 490)
assert.equal(firstDocx.counts.media, 119)
assert.equal(firstDocx.counts.footnotesPresent, true)
assert.ok(firstDocx.reviewItems.some((item) => item.kind === 'drawings'))
assert.ok(firstDocx.reviewItems.some((item) => item.kind === 'media'))
assert.ok(firstDocx.reviewItems.some((item) => item.kind === 'footnotes'))
const reviewMarkdown = await readFile(path.join(docxOutput, 'review.md'), 'utf8')
assert.match(reviewMarkdown, /Quarantine Review Items/)
assert.doesNotMatch(firstDocx.outputs.markdown.path, /^docs\/public\//)

const originalImageHash = await fileHash(imageSource)
const firstImage = await processImage({
  sourcePath: imageSource,
  assetId: 'src-ec1754535996',
  outputDir: imageOutput,
})
const firstImageFingerprint = await directoryFingerprint(imageOutput)
const secondImage = await processImage({
  sourcePath: imageSource,
  assetId: 'src-ec1754535996',
  outputDir: imageOutput,
})
const secondImageFingerprint = await directoryFingerprint(imageOutput)
assert.equal(secondImageFingerprint, firstImageFingerprint, 'Image import output must be byte-stable')
assert.equal(await fileHash(imageSource), originalImageHash, 'Original image hash must not change')
assert.equal(firstImage.source.sha256, originalImageHash)
assert.equal(firstImage.source.width, 1081)
assert.equal(firstImage.source.height, 12800)
assert.equal(firstImage.publishable, false)
assert.equal(firstImage.permission, 'pending')
assert.equal(firstImage.originalCopied, false)
assert.equal(firstImage.derivatives.filter((item) => item.kind === 'segment').length, 4)
for (const derivative of firstImage.derivatives) {
  assert.ok(derivative.width > 0)
  assert.ok(derivative.height > 0)
  assert.ok(derivative.bytes > 0)
  assert.match(derivative.sha256, /^[a-f0-9]{64}$/)
  assert.ok(derivative.width * derivative.height <= derivative.maxPixels)
}

console.log('import-docx-image tests passed.')

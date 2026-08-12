import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { validateMediaItem } from '../../scripts/content/lib/media-policy.mjs'

const library = JSON.parse(
  await readFile(
    new URL('../../content/migrations/media-library.json', import.meta.url),
    'utf8',
  ),
)
const maxDerivativePixels = library.derivativePolicy.maxDerivativePixels
const sample = structuredClone(library.standaloneItems[0])

assert.deepEqual(
  validateMediaItem(sample, { maxDerivativePixels }),
  [],
)

const withoutAlt = structuredClone(sample)
withoutAlt.alt = ''
assert(
  validateMediaItem(withoutAlt, { maxDerivativePixels }).some((error) =>
    error.includes('alt is required'),
  ),
)

const exposedOriginal = structuredClone(sample)
exposedOriginal.downloadAllowed = false
assert(
  validateMediaItem(exposedOriginal, { maxDerivativePixels }).some((error) =>
    error.includes('original path is exposed while download is disabled'),
  ),
)

const mismatchedOriginal = structuredClone(sample)
mismatchedOriginal.originalPublicPath = '/wiki-media/mismatched/original.png'
assert(
  validateMediaItem(mismatchedOriginal, { maxDerivativePixels }).some((error) =>
    error.includes('authorized original download metadata is incomplete'),
  ),
)

const invalidDimensions = structuredClone(sample)
invalidDimensions.files[0].width = 0
assert(
  validateMediaItem(invalidDimensions, { maxDerivativePixels }).some((error) =>
    error.includes('invalid dimensions'),
  ),
)

const longSample = structuredClone(
  library.standaloneItems.find((item) => item.longImage),
)
longSample.groups.push({
  kind: 'segment',
  index: 1,
  anchorId: 'segment-1',
  files: [],
})
assert(
  validateMediaItem(longSample, { maxDerivativePixels }).some((error) =>
    error.includes('segmented media groups are forbidden'),
  ),
)

console.log('Media library policy contracts passed.')

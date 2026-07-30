import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  resolveRepositoryPath,
  validateDerivativeManifest,
} from '../../scripts/content/lib/public-artifact-policy.mjs'

const repositoryRoot = await mkdtemp(
  path.join(tmpdir(), 'dov-public-artifact-policy-'),
)
try {
  const publicRoot = path.join(repositoryRoot, 'docs', 'public', 'guide')
  const manifestRoot = path.join(repositoryRoot, 'content', 'manifests')
  await mkdir(publicRoot, { recursive: true })
  await mkdir(manifestRoot, { recursive: true })
  const data = Buffer.from('derived-image')
  const filePath = path.join(publicRoot, 'guide.webp')
  await writeFile(filePath, data)
  const sha256 = createHash('sha256').update(data).digest('hex')
  const sourceHash = 'a'.repeat(64)
  const manifestPath = path.join(manifestRoot, 'guide.json')
  await writeFile(
    manifestPath,
    JSON.stringify({
      sourceId: 'src-image',
      derivedFrom: sourceHash,
      files: [
        {
          path: 'docs/public/guide/guide.webp',
          sha256,
          width: 1200,
          height: 800,
          format: 'webp',
        },
      ],
    }),
  )

  const validErrors = await validateDerivativeManifest({
    repositoryRoot,
    collection: {
      root: 'docs/public/guide',
      manifest: 'content/manifests/guide.json',
    },
    source: {
      id: 'src-image',
      hashes: { sha256: sourceHash },
    },
  })
  assert.deepEqual(validErrors, [])

  assert.equal(resolveRepositoryPath(repositoryRoot, '../escape.json'), null)
  assert.equal(resolveRepositoryPath(repositoryRoot, 'C:\\escape.json'), null)

  const missingErrors = await validateDerivativeManifest({
    repositoryRoot,
    collection: {
      root: 'docs/public/guide',
      manifest: 'content/manifests/missing.json',
    },
    source: {
      id: 'src-image',
      hashes: { sha256: sourceHash },
    },
  })
  assert.ok(missingErrors.includes('manifest does not exist or is unreadable'))
} finally {
  await rm(repositoryRoot, { recursive: true, force: true })
}

console.log('public artifact policy tests passed.')

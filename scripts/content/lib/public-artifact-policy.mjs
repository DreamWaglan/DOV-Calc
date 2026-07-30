import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export function resolveRepositoryPath(repositoryRoot, relativePath) {
  if (
    typeof relativePath !== 'string' ||
    relativePath.trim() === '' ||
    path.isAbsolute(relativePath) ||
    /^[A-Za-z]:/.test(relativePath)
  ) {
    return null
  }
  const absolutePath = path.resolve(repositoryRoot, relativePath)
  const relation = path.relative(repositoryRoot, absolutePath)
  if (
    relation === '' ||
    relation === '..' ||
    relation.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relation)
  ) {
    return null
  }
  return absolutePath
}

export async function validateDerivativeManifest({
  repositoryRoot,
  collection,
  source,
}) {
  const errors = []
  const manifestPath = resolveRepositoryPath(
    repositoryRoot,
    collection.manifest,
  )
  if (!manifestPath) return ['manifest must be a repository-relative path']

  const manifestText = await readFile(manifestPath, 'utf8').catch(() => null)
  if (manifestText === null) return ['manifest does not exist or is unreadable']

  let manifest
  try {
    manifest = JSON.parse(manifestText)
  } catch {
    return ['manifest is not valid JSON']
  }

  if (manifest.sourceId !== source.id) {
    errors.push('manifest sourceId differs from collection sourceId')
  }
  if (manifest.derivedFrom !== source.hashes?.sha256) {
    errors.push('manifest derivedFrom differs from source SHA-256')
  }
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    errors.push('manifest files must be a non-empty array')
    return errors
  }

  const collectionRoot = resolveRepositoryPath(
    repositoryRoot,
    collection.root,
  )
  if (!collectionRoot) {
    errors.push('collection root must be a repository-relative path')
    return errors
  }

  for (const entry of manifest.files) {
    const filePath = resolveRepositoryPath(repositoryRoot, entry.path)
    if (
      !filePath ||
      (filePath !== collectionRoot &&
        !filePath.startsWith(`${collectionRoot}${path.sep}`))
    ) {
      errors.push(`${entry.path ?? '(missing path)'}: file is outside collection root`)
      continue
    }
    const data = await readFile(filePath).catch(() => null)
    if (!data) {
      errors.push(`${entry.path}: derived file does not exist`)
      continue
    }
    const sha256 = createHash('sha256').update(data).digest('hex')
    if (entry.sha256 !== sha256) {
      errors.push(`${entry.path}: SHA-256 differs from manifest`)
    }
    if (!Number.isInteger(entry.width) || entry.width <= 0) {
      errors.push(`${entry.path}: width must be a positive integer`)
    }
    if (!Number.isInteger(entry.height) || entry.height <= 0) {
      errors.push(`${entry.path}: height must be a positive integer`)
    }
    if (typeof entry.format !== 'string' || entry.format.trim() === '') {
      errors.push(`${entry.path}: format is required`)
    }
  }

  return errors
}

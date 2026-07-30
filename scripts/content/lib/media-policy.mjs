const HASH_PATTERN = /^[a-f0-9]{64}$/

export function validateMediaItem(item, { maxDerivativePixels }) {
  const errors = []
  const label = item.libraryId ?? '(missing libraryId)'
  for (const [field, value] of [
    ['libraryId', item.libraryId],
    ['sourceAssetId', item.sourceAssetId],
    ['sourceElementId', item.sourceElementId],
    ['alt', item.alt],
    ['caption', item.caption],
    ['sourceLabel', item.sourceLabel],
    ['version', item.version],
    ['authorizationEvidenceId', item.authorizationEvidenceId],
  ]) {
    if (typeof value !== 'string' || value.trim() === '') {
      errors.push(`${label}: ${field} is required`)
    }
  }
  if (!HASH_PATTERN.test(item.sourceSha256 ?? '')) {
    errors.push(`${label}: sourceSha256 is invalid`)
  }
  if (!Array.isArray(item.targetPageIds) || item.targetPageIds.length === 0) {
    errors.push(`${label}: targetPageIds is empty`)
  }
  if (!Array.isArray(item.files) || item.files.length === 0) {
    errors.push(`${label}: derivative files are empty`)
  }
  if (item.downloadAllowed !== true && item.originalPublicPath !== null) {
    errors.push(`${label}: original path is exposed while download is disabled`)
  }

  const anchors = new Set()
  const segmentIndexes = []
  for (const group of item.groups ?? []) {
    if (!group.anchorId || anchors.has(group.anchorId)) {
      errors.push(`${label}: segment/preview anchors are missing or duplicated`)
    }
    anchors.add(group.anchorId)
    if (group.kind === 'segment') segmentIndexes.push(group.index)
  }
  if (item.longImage) {
    const expected = Array.from(
      { length: segmentIndexes.length },
      (_, index) => index + 1,
    )
    if (JSON.stringify(segmentIndexes) !== JSON.stringify(expected)) {
      errors.push(`${label}: long-image segment indexes are not contiguous`)
    }
  }

  const formats = new Set()
  for (const file of item.files ?? []) {
    formats.add(file.format)
    if (!HASH_PATTERN.test(file.sha256 ?? '')) {
      errors.push(`${label}: ${file.path ?? '(missing path)'} has invalid SHA-256`)
    }
    if (
      !Number.isInteger(file.width) ||
      file.width <= 0 ||
      !Number.isInteger(file.height) ||
      file.height <= 0
    ) {
      errors.push(`${label}: ${file.path ?? '(missing path)'} has invalid dimensions`)
    } else if (file.width * file.height > maxDerivativePixels) {
      errors.push(`${label}: ${file.path} exceeds the derivative pixel budget`)
    }
    if (!['avif', 'webp'].includes(file.format)) {
      errors.push(`${label}: ${file.path} uses an unsupported derivative format`)
    }
    if (file.exifRemoved !== true) {
      errors.push(`${label}: ${file.path} did not record EXIF removal`)
    }
  }
  for (const requiredFormat of ['avif', 'webp']) {
    if (!formats.has(requiredFormat)) {
      errors.push(`${label}: ${requiredFormat} derivative is missing`)
    }
  }
  return errors
}

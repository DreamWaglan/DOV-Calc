import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { derivePublicRelease, releaseDecisionMatches } from './authorization-policy.mjs'

export const SOURCE_ELEMENT_TYPES = Object.freeze([
  'paragraph',
  'heading',
  'table',
  'media',
  'formula',
  'worksheet',
  'image',
])

export const DISPOSITIONS = Object.freeze([
  'published',
  'merged',
  'internal-only',
  'omitted-with-rationale',
])

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    )
  }
  return value
}

export function stableSourceElementId(sourceAssetId, elementType, sourcePosition) {
  if (!/^src-[a-f0-9]{12}$/.test(sourceAssetId)) {
    throw new Error(`Invalid source asset ID: ${sourceAssetId}`)
  }
  if (!SOURCE_ELEMENT_TYPES.includes(elementType)) {
    throw new Error(`Unsupported source element type: ${elementType}`)
  }
  const identity = JSON.stringify(
    canonicalize({ sourceAssetId, elementType, sourcePosition }),
  )
  const digest = createHash('sha256').update(identity).digest('hex').slice(0, 16)
  return `${sourceAssetId}:${elementType}:${digest}`
}

export function stableSourceRelationId(sourceAssetId, relationType, sourcePosition) {
  const identity = JSON.stringify(
    canonicalize({ sourceAssetId, relationType, sourcePosition }),
  )
  const digest = createHash('sha256').update(identity).digest('hex').slice(0, 16)
  return `${sourceAssetId}:relation:${digest}`
}

export function stablePlacementId(sourceAssetId, placementType, sourcePosition) {
  const identity = JSON.stringify(
    canonicalize({ sourceAssetId, placementType, sourcePosition }),
  )
  const digest = createHash('sha256').update(identity).digest('hex').slice(0, 16)
  return `${sourceAssetId}:placement:${digest}`
}

export function tableCellMediaToken(occurrenceId) {
  return `<!-- docx-cell-media:${occurrenceId} -->`
}

export function tableCellPlacementErrors(tableCell) {
  const errors = []
  const integerAtLeast = (value, minimum) =>
    Number.isInteger(value) && value >= minimum
  if (!tableCell || typeof tableCell !== 'object') return ['missing tableCell']
  if (!/^src-[a-f0-9]{12}:placement:[a-f0-9]{16}$/.test(tableCell.cellPlacementId ?? '')) {
    errors.push('invalid cellPlacementId')
  }
  if (!/^src-[a-f0-9]{12}:table:[a-f0-9]{16}$/.test(tableCell.tableSourceElementId ?? '')) {
    errors.push('invalid tableSourceElementId')
  }
  for (const [field, minimum] of [
    ['tableIndex', 1],
    ['rowIndex', 1],
    ['cellIndex', 1],
    ['gridColumn', 1],
    ['gridSpan', 1],
    ['rowSpan', 0],
    ['paragraphIndex', 0],
    ['runIndex', 0],
    ['drawingIndexInParagraph', 0],
    ['drawingIndexInCell', 1],
    ['cellContentOrdinal', 1],
  ]) {
    if (!integerAtLeast(tableCell[field], minimum)) errors.push(`invalid ${field}`)
  }
  if (![null, 'restart', 'continue'].includes(tableCell.verticalMerge)) {
    errors.push('invalid verticalMerge')
  }
  if (tableCell.verticalMerge === 'continue' && tableCell.rowSpan !== 0) {
    errors.push('vertical merge continuation must have rowSpan 0')
  }
  if (tableCell.verticalMerge !== 'continue' && tableCell.rowSpan < 1) {
    errors.push('rendered cell must have rowSpan at least 1')
  }
  if (!Array.isArray(tableCell.cellPath) || tableCell.cellPath.length === 0) {
    errors.push('missing cellPath')
    return errors
  }
  const leaf = tableCell.cellPath.at(-1)
  for (const field of [
    'tableIndex',
    'tableSourceElementId',
    'rowIndex',
    'cellIndex',
    'gridColumn',
    'gridSpan',
    'verticalMerge',
  ]) {
    if (leaf?.[field] !== tableCell[field]) errors.push(`cellPath leaf mismatch: ${field}`)
  }
  return errors
}

export function dispositionErrors(entry) {
  const errors = []
  if (!DISPOSITIONS.includes(entry?.disposition)) {
    errors.push(`invalid disposition: ${entry?.disposition ?? '(missing)'}`)
  }
  if (
    entry?.disposition === 'omitted-with-rationale' &&
    (typeof entry.reason !== 'string' || entry.reason.trim() === '')
  ) {
    errors.push('omitted-with-rationale requires a non-empty reason')
  }
  return errors
}

export async function loadSourceLedger(
  ledgerPath = path.join(process.cwd(), 'content', 'governance', 'source-assets.json'),
) {
  const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'))
  if (!Array.isArray(ledger.assets)) {
    throw new Error(`${ledgerPath}: assets must be an array`)
  }
  return ledger
}

export async function loadSourceAsset(assetId, ledgerPath) {
  const ledger = await loadSourceLedger(ledgerPath)
  const asset = ledger.assets.find((candidate) => candidate.id === assetId)
  if (!asset) throw new Error(`Source asset is not registered: ${assetId}`)
  const derived = derivePublicRelease(asset)
  if (!derived.valid || !releaseDecisionMatches(asset.publicRelease, derived)) {
    throw new Error(`Source asset has an invalid authorization decision: ${assetId}`)
  }
  return { ledger, asset, publicRelease: derived.publicRelease }
}

export function importGovernance(asset) {
  return {
    permission: asset.permission,
    authorizationEvidenceId: asset.authorization?.evidenceId ?? null,
    publicRelease: asset.publicRelease,
    reviewStatus: 'migration-review-required',
    publishable: false,
  }
}

export function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

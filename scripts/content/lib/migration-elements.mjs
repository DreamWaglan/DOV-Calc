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

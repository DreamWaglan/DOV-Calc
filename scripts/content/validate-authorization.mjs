import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { access } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  PUBLIC_RELEASE_FIELDS,
  derivePublicRelease,
  releaseDecisionMatches,
} from './lib/authorization-policy.mjs'
import {
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'

const failures = []
const now = new Date()
const inventory = await readJson('content/governance/source-assets.json')
const evidenceRegistry = await readJson(
  'content/governance/authorization-evidence/index.json',
)
const sourceSchema = await readJson(
  'content/schemas/source-asset.schema.json',
)
const evidenceSchema = await readJson(
  'content/schemas/authorization-evidence.schema.json',
)

const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
ajv.addSchema(sourceSchema)
const validateSource = ajv.getSchema(sourceSchema.$id)
const validateEvidence = ajv.compile(evidenceSchema)

const evidenceById = new Map(
  (evidenceRegistry.evidence ?? []).map((evidence) => [
    evidence.id,
    evidence,
  ]),
)
const decisions = []
const sourceIds = new Set()
const hashes = new Set()
let assetsWithEvidence = 0
let pendingAssignments = 0
let overScopeExports = 0
let expiredEvidence = 0
let restrictedExportViolations = 0

if (
  inventory.expectedAssetCount !== 29 ||
  inventory.assetCount !== 29 ||
  inventory.assets?.length !== 29
) {
  failures.push(
    `source asset inventory must contain 29 entries; found ${inventory.assets?.length ?? 0}`,
  )
}

for (const evidence of evidenceRegistry.evidence ?? []) {
  if (!validateEvidence(evidence)) {
    for (const error of validateEvidence.errors ?? []) {
      failures.push(
        `${evidence.id ?? '(missing evidence id)'}${error.instancePath}: ${error.message}`,
      )
    }
  }
  const evidenceFile = evidence.evidencePath
    ? await access(evidence.evidencePath).then(
        () => true,
        () => false,
      )
    : false
  if (!evidenceFile) {
    failures.push(
      `${evidence.id ?? '(missing evidence id)'}: evidencePath does not exist`,
    )
  }
}

for (const asset of inventory.assets ?? []) {
  if (!validateSource(asset)) {
    for (const error of validateSource.errors ?? []) {
      failures.push(`${asset.id ?? '(missing asset id)'}${error.instancePath}: ${error.message}`)
    }
  }

  if (sourceIds.has(asset.id)) failures.push(`${asset.id}: duplicate asset id`)
  sourceIds.add(asset.id)
  if (hashes.has(asset.hashes?.sha256)) {
    failures.push(`${asset.id}: duplicate SHA-256`)
  }
  hashes.add(asset.hashes?.sha256)

  const requiresEvidence = ['owned', 'authorized', 'quoted'].includes(
    asset.permission,
  )
  const evidence = requiresEvidence
    ? evidenceById.get(asset.authorization?.evidenceId)
    : null
  if (requiresEvidence) {
    if (evidence && evidence.appliesToAssetIds?.includes(asset.id)) {
      assetsWithEvidence += 1
    } else {
      failures.push(`${asset.id}: authorization evidence does not cover asset`)
    }
  }

  const assignedPeople = [...(asset.owners ?? []), ...(asset.reviewers ?? [])]
  if (
    assignedPeople.some(
      (person) => !person.name || person.name.trim() === '待指派',
    )
  ) {
    pendingAssignments += 1
    failures.push(`${asset.id}: authorization responsibility is unassigned`)
  }

  if (requiresEvidence && evidence) {
    for (const field of PUBLIC_RELEASE_FIELDS) {
      if (
        asset.authorization?.scope?.[field] === true &&
        evidence.confirmedScope?.[field] !== true
      ) {
        overScopeExports += 1
        failures.push(`${asset.id}: ${field} exceeds evidence scope`)
      }
    }
    if (['expired', 'revoked'].includes(evidence.status)) {
      expiredEvidence += 1
      failures.push(`${asset.id}: evidence status is ${evidence.status}`)
    }
  }

  const decision = derivePublicRelease(asset, now)
  if (!decision.valid) {
    if (
      decision.deniedReasons.some((reason) => reason.includes('expired at'))
    ) {
      expiredEvidence += 1
    }
    failures.push(
      `${asset.id}: ${decision.deniedReasons.join('; ') || 'invalid authorization'}`,
    )
  }
  if (!releaseDecisionMatches(asset.publicRelease, decision)) {
    overScopeExports += 1
    failures.push(`${asset.id}: publicRelease differs from policy derivation`)
  }
  if (
    ['pending', 'restricted'].includes(asset.permission) &&
    PUBLIC_RELEASE_FIELDS.some((field) => asset.publicRelease?.[field])
  ) {
    restrictedExportViolations += 1
    failures.push(`${asset.id}: ${asset.permission} asset has public output`)
  }

  decisions.push({
    assetId: asset.id,
    permission: asset.permission,
    evidenceId: asset.authorization?.evidenceId ?? null,
    scope: asset.authorization?.scope ?? null,
    deniedScopes: asset.authorization?.deniedScopes ?? [],
    derived: decision.publicRelease,
    storedMatchesDerived: releaseDecisionMatches(
      asset.publicRelease,
      decision,
    ),
    valid: decision.valid,
  })
}

for (const evidence of evidenceRegistry.evidence ?? []) {
  for (const assetId of evidence.appliesToAssetIds ?? []) {
    if (!sourceIds.has(assetId)) {
      failures.push(`${evidence.id}: references unknown asset ${assetId}`)
    }
  }
}

const sampleAuthorization = {
  evidenceId: 'matrix-sample',
  rightsHolder: 'matrix sample',
  grantedBy: 'matrix sample',
  grantedAt: '2026-07-30',
  evidencePath:
    'content/governance/authorization-evidence/user-declaration-20260730.md',
  attribution: 'matrix sample',
  expiresAt: null,
  restrictions: [],
  deniedScopes: [],
  scope: Object.fromEntries(
    PUBLIC_RELEASE_FIELDS.map((field) => [field, true]),
  ),
}
const permissionMatrix = Object.fromEntries(
  ['owned', 'authorized', 'quoted', 'pending', 'restricted'].map(
    (permission) => {
      const sample = { permission, authorization: sampleAuthorization }
      return [permission, derivePublicRelease(sample, now).publicRelease]
    },
  ),
)

const matrixReport = {
  schemaVersion: 1,
  check: 'authorization-matrix',
  generatedAt: now.toISOString(),
  publicReleaseFields: PUBLIC_RELEASE_FIELDS,
  permissionMatrix,
  assetDecisions: decisions,
  summary: {
    permissions: Object.keys(permissionMatrix).length,
    publicReleaseFields: PUBLIC_RELEASE_FIELDS.length,
    assets: decisions.length,
    storedPolicyMismatches: decisions.filter(
      (decision) => !decision.storedMatchesDerived,
    ).length,
  },
}
const matrixReportPath = await writeReport(
  'authorization-matrix',
  matrixReport,
)

const report = {
  schemaVersion: 1,
  check: 'authorization',
  generatedAt: now.toISOString(),
  evidenceRegistry:
    'content/governance/authorization-evidence/index.json',
  summary: {
    expectedAssets: 29,
    assetCount: inventory.assets?.length ?? 0,
    evidenceRecords: evidenceById.size,
    assetsWithEvidence,
    pendingAssignments,
    overScopeExports,
    expiredEvidence,
    restrictedExportViolations,
    policyConsumers: [
      'validate-authorization',
      'validate-provenance',
      'scan-public-artifacts',
    ],
    failures: failures.length,
  },
  matrixReport: path.relative(root, matrixReportPath).split(path.sep).join('/'),
  failures,
}
const reportPath = await writeReport('authorization', report)
printResult('Authorization validation', failures, reportPath)

if (failures.length === 0) {
  console.log(`Authorization matrix report: ${matrixReportPath}`)
}

if (failures.length > 0) process.exitCode = 1

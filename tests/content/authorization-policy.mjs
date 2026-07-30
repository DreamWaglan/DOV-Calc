import assert from 'node:assert/strict'
import {
  PUBLIC_RELEASE_FIELDS,
  authorizationErrors,
  derivePublicRelease,
  permissionIsNoWider,
  releaseDecisionMatches,
} from '../../scripts/content/lib/authorization-policy.mjs'

const now = new Date('2026-07-30T12:00:00.000Z')

function authorization(scope = {}, overrides = {}) {
  return {
    evidenceId: 'auth-test',
    rightsHolder: 'Test rights holder',
    grantedBy: 'Test grantor',
    grantedAt: '2026-07-30',
    evidencePath: 'content/governance/authorization-evidence/test.md',
    attribution: 'Test attribution',
    expiresAt: null,
    restrictions: [],
    deniedScopes: [],
    scope: Object.fromEntries(
      PUBLIC_RELEASE_FIELDS.map((field) => [field, scope[field] ?? true]),
    ),
    ...overrides,
  }
}

function asset(permission, scope = {}, overrides = {}) {
  return {
    id: `test-${permission}`,
    permission,
    authorization: authorization(scope),
    ...overrides,
  }
}

{
  const owned = derivePublicRelease(asset('owned'), now)
  assert.equal(owned.valid, true)
  assert.ok(PUBLIC_RELEASE_FIELDS.every((field) => owned.publicRelease[field]))
  assert.equal(owned.publicRelease.mode, 'public')
}

{
  const authorized = derivePublicRelease(
    asset('authorized', {
      asset: false,
      download: false,
      structuredData: false,
    }),
    now,
  )
  assert.equal(authorized.publicRelease.body, true)
  assert.equal(authorized.publicRelease.asset, false)
  assert.equal(authorized.publicRelease.download, false)
  assert.equal(authorized.publicRelease.structuredData, false)
}

{
  const quoted = derivePublicRelease(asset('quoted'), now)
  assert.equal(quoted.valid, true)
  assert.equal(quoted.publicRelease.body, true)
  assert.equal(quoted.publicRelease.mode, 'quote-only')
  assert.ok(
    PUBLIC_RELEASE_FIELDS.filter((field) => field !== 'body').every(
      (field) => quoted.publicRelease[field] === false,
    ),
  )
}

for (const permission of ['pending', 'restricted']) {
  const decision = derivePublicRelease(
    {
      ...asset(permission),
      publicRelease: Object.fromEntries(
        PUBLIC_RELEASE_FIELDS.map((field) => [field, true]),
      ),
    },
    now,
  )
  assert.equal(decision.publicRelease.mode, 'blocked')
  assert.ok(
    PUBLIC_RELEASE_FIELDS.every(
      (field) => decision.publicRelease[field] === false,
    ),
  )
}

{
  const pendingWithoutEvidence = derivePublicRelease(
    { id: 'pending-without-evidence', permission: 'pending' },
    now,
  )
  assert.equal(pendingWithoutEvidence.valid, true)
  assert.ok(
    PUBLIC_RELEASE_FIELDS.every(
      (field) => pendingWithoutEvidence.publicRelease[field] === false,
    ),
  )
}

{
  const missingEvidence = derivePublicRelease(
    { id: 'missing', permission: 'authorized' },
    now,
  )
  assert.equal(missingEvidence.valid, false)
  assert.ok(missingEvidence.deniedReasons.includes('authorization metadata is required'))
  assert.ok(
    PUBLIC_RELEASE_FIELDS.every(
      (field) => missingEvidence.publicRelease[field] === false,
    ),
  )
}

{
  const expired = asset('authorized', {}, {
    authorization: authorization({}, { expiresAt: '2026-07-29' }),
  })
  assert.ok(
    authorizationErrors(expired, now).some((error) =>
      error.includes('expired at 2026-07-29'),
    ),
  )
  assert.equal(derivePublicRelease(expired, now).valid, false)
}

{
  const restrictedDownload = asset('authorized', {}, {
    authorization: authorization({}, { deniedScopes: ['download'] }),
  })
  const decision = derivePublicRelease(restrictedDownload, now)
  assert.equal(decision.publicRelease.download, false)
  assert.equal(decision.publicRelease.body, true)
}

{
  const decision = derivePublicRelease(asset('authorized'), now)
  assert.equal(
    releaseDecisionMatches(decision.publicRelease, decision),
    true,
  )
  assert.equal(
    releaseDecisionMatches(
      { ...decision.publicRelease, download: false },
      decision,
    ),
    false,
  )
}

assert.equal(permissionIsNoWider('pending', 'authorized'), true)
assert.equal(permissionIsNoWider('quoted', 'authorized'), true)
assert.equal(permissionIsNoWider('authorized', 'pending'), false)
assert.equal(permissionIsNoWider('owned', 'quoted'), false)

console.log('authorization policy tests passed.')

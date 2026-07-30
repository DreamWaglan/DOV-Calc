import assert from 'node:assert/strict'
import { hasCompleteSourceTraceability } from '../../scripts/quality/traceability-policy.mjs'

function report(sourceRootAvailable, overrides = {}) {
  return {
    sourceRootAvailable,
    summary: {
      sourceAssets: 29,
      sourceHashesChecked: sourceRootAvailable ? 29 : 0,
      importArtifactsChecked: 30,
      importAssetsChecked: 29,
      ...overrides,
    },
  }
}

assert.equal(
  hasCompleteSourceTraceability(report(true)),
  true,
  'local validation must accept complete source and import coverage',
)
assert.equal(
  hasCompleteSourceTraceability(report(false)),
  true,
  'clean CI must accept complete committed-import coverage without local sources',
)
assert.equal(
  hasCompleteSourceTraceability(report(false, { importAssetsChecked: 28 })),
  false,
  'clean CI must reject partial unique-asset coverage',
)
assert.equal(
  hasCompleteSourceTraceability(report(true, { sourceHashesChecked: 28 })),
  false,
  'local validation must reject partial source hash coverage',
)
assert.equal(
  hasCompleteSourceTraceability(report(false, { sourceHashesChecked: 1 })),
  false,
  'unavailable source roots must not report misleading partial source coverage',
)
assert.equal(
  hasCompleteSourceTraceability(report(false, { importArtifactsChecked: 28 })),
  false,
  'artifact coverage must not be lower than the registered asset count',
)

console.log('source traceability policy tests passed.')

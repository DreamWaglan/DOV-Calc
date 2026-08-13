import assert from 'node:assert/strict'
import { hasCompleteMediaSourceTraceability } from '../../scripts/quality/media-source-policy.mjs'

function report(sourceRootAvailable, overrides = {}) {
  return {
    sourceRootAvailable,
    summary: {
      verifiedStandaloneSourceBytes: sourceRootAvailable ? 15 : 0,
      verifiedDocxPackageMedia: sourceRootAvailable ? 585 : 0,
      skippedStandaloneSourceBytes: sourceRootAvailable ? 0 : 15,
      skippedDocxPackageMedia: sourceRootAvailable ? 0 : 585,
      ...overrides,
    },
  }
}

assert.equal(hasCompleteMediaSourceTraceability(report(true)), true)
assert.equal(hasCompleteMediaSourceTraceability(report(false)), true)
assert.equal(
  hasCompleteMediaSourceTraceability(
    report(true, { verifiedDocxPackageMedia: 584 }),
  ),
  false,
)
assert.equal(
  hasCompleteMediaSourceTraceability(
    report(false, { skippedStandaloneSourceBytes: 14 }),
  ),
  false,
)
assert.equal(
  hasCompleteMediaSourceTraceability(
    report(false, { verifiedStandaloneSourceBytes: 1 }),
  ),
  false,
)

console.log('media source traceability policy tests passed.')

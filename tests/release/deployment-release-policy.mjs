import assert from 'node:assert/strict'
import {
  deployedReleaseTag,
  deploymentReleaseFailures,
  releaseStateAccepted,
} from '../../scripts/release/deployment-release-policy.mjs'

function manifest(state, { present = false, matchesHead = false } = {}) {
  return {
    release: {
      state,
      candidateTag: 'wiki-v1.1.6',
    },
    repository: {
      tag: { present, matchesHead },
    },
  }
}

const candidate = manifest('candidate')
assert.equal(releaseStateAccepted(candidate), true)
assert.equal(releaseStateAccepted(candidate, { requireTagged: true }), false)
assert.deepEqual(deploymentReleaseFailures(candidate), [])
assert.equal(deployedReleaseTag(candidate), null)

const tagged = manifest('tagged', { present: true, matchesHead: true })
assert.equal(releaseStateAccepted(tagged), true)
assert.equal(releaseStateAccepted(tagged, { requireTagged: true }), true)
assert.deepEqual(deploymentReleaseFailures(tagged), [])
assert.equal(deployedReleaseTag(tagged), 'wiki-v1.1.6')

const invalidTagged = manifest('tagged', {
  present: true,
  matchesHead: false,
})
assert.equal(releaseStateAccepted(invalidTagged), false)
assert.equal(deploymentReleaseFailures(invalidTagged).length, 1)

const invalidState = manifest('draft')
assert.equal(releaseStateAccepted(invalidState), false)
assert.equal(deploymentReleaseFailures(invalidState).length, 1)

console.log('Deployment release policy tests passed.')

import assert from 'node:assert/strict'
import { parseReleaseValidationArguments } from '../../scripts/release/release-validation-arguments.mjs'

const deployed = parseReleaseValidationArguments(['--require-deployed'])
assert.equal(deployed.requireDeployed, true)
assert.equal(deployed.requireTagged, false)

const taggedDeployment = parseReleaseValidationArguments([
  '--',
  '--require-deployed',
  '--require-tagged',
  '--manifest',
  'tmp/release-manifest.json',
])
assert.equal(taggedDeployment.requireDeployed, true)
assert.equal(taggedDeployment.requireTagged, true)
assert.equal(taggedDeployment.manifest, 'tmp/release-manifest.json')

assert.throws(
  () => parseReleaseValidationArguments(['--manifest']),
  /缺少取值/,
)
assert.throws(
  () => parseReleaseValidationArguments(['--unknown']),
  /不支持的参数/,
)

console.log('Release validation argument tests passed.')

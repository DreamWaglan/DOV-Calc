import assert from 'node:assert/strict'
import { parseDeploymentArguments } from '../../scripts/release/deployment-arguments.mjs'

const parsed = parseDeploymentArguments([
  '--',
  '--url',
  'https://example.test/wiki/',
  '--deployed-commit',
  'abc123',
  '--workflow-run-id',
  '42',
  '--workflow-url',
  'https://example.test/actions/42',
])

assert.equal(parsed.url, 'https://example.test/wiki/')
assert.equal(parsed.deployedCommit, 'abc123')
assert.equal(parsed.workflowRunId, '42')
assert.equal(parsed.workflowUrl, 'https://example.test/actions/42')
assert.equal(
  parseDeploymentArguments([]).manifest,
  'content/release/release-manifest.json',
)
assert.throws(
  () => parseDeploymentArguments(['--unknown']),
  /不支持的参数/,
)
assert.throws(
  () => parseDeploymentArguments(['--url', '--workflow-run-id', '42']),
  /缺少取值/,
)

console.log('deployment argument parser tests passed.')

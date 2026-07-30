import assert from 'node:assert/strict'
import { canonicalTextSha256 } from '../../scripts/content/lib/content-utils.mjs'

const lf = '---\nid: example\n---\n正文\n'
const crlf = lf.replaceAll('\n', '\r\n')
const legacyCr = lf.replaceAll('\n', '\r')

assert.equal(
  canonicalTextSha256(crlf),
  canonicalTextSha256(lf),
  'page review hashes must be stable across Windows and Linux line endings',
)
assert.equal(
  canonicalTextSha256(legacyCr),
  canonicalTextSha256(lf),
  'page review hashes must normalize legacy carriage-return line endings',
)
assert.notEqual(
  canonicalTextSha256(`${lf}changed\n`),
  canonicalTextSha256(lf),
  'page review hashes must still detect content changes',
)

console.log('page review canonical hash tests passed.')

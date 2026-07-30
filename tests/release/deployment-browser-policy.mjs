import assert from 'node:assert/strict'
import {
  classifyBrowserErrors,
  ensureLazyToolLoaded,
} from '../../scripts/release/deployment-browser-policy.mjs'

const calls = []
const root = { id: 'loaded-tool' }
const loadButton = {
  async click() {
    calls.push('click')
  },
}
let loaded = false
const page = {
  async $(selector) {
    calls.push(`query:${selector}`)
    if (selector === '.basic-attack-explorer') return loaded ? root : null
    if (selector === '.tool-loading button') return loadButton
    return null
  },
  async waitForSelector(selector, options) {
    calls.push(`wait:${selector}:${options.timeout}`)
    loaded = true
    return root
  },
}

assert.equal(
  await ensureLazyToolLoaded(page, '.basic-attack-explorer'),
  root,
)
assert.deepEqual(calls, [
  'query:.basic-attack-explorer',
  'query:.tool-loading button',
  'click',
  'wait:.basic-attack-explorer:15000',
  'query:.basic-attack-explorer',
])

calls.length = 0
assert.equal(
  await ensureLazyToolLoaded(page, '.basic-attack-explorer'),
  root,
)
assert.deepEqual(calls, ['query:.basic-attack-explorer'])

const messages = [
  'Failed to load resource: the server responded with a status of 404 ()',
  'Uncaught TypeError: broken',
]

assert.deepEqual(classifyBrowserErrors(messages), {
  raw: messages,
  substantive: messages,
  suppressed: [],
})

assert.deepEqual(
  classifyBrowserErrors(messages, {
    allowSingleBenignMissingResource: true,
  }),
  {
    raw: messages,
    substantive: ['Uncaught TypeError: broken'],
    suppressed: [
      'Failed to load resource: the server responded with a status of 404 ()',
    ],
  },
)

assert.deepEqual(
  classifyBrowserErrors(
    [
      'Failed to load resource: the server responded with a status of 404 ()',
      'Failed to load resource: the server responded with a status of 404 (second)',
    ],
    { allowSingleBenignMissingResource: true },
  ),
  {
    raw: [
      'Failed to load resource: the server responded with a status of 404 ()',
      'Failed to load resource: the server responded with a status of 404 (second)',
    ],
    substantive: [
      'Failed to load resource: the server responded with a status of 404 (second)',
    ],
    suppressed: [
      'Failed to load resource: the server responded with a status of 404 ()',
    ],
  },
)

console.log('Deployment browser policy tests passed.')

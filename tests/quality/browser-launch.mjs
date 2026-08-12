import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { launchBrowser } from '../../scripts/quality/lib/browser-launch.mjs'

const launchResult = { kind: 'launched' }
const primaryPuppeteer = {
  launch: async (options) => {
    assert.equal(options.executablePath, 'browser.exe')
    assert.deepEqual(options.args, ['--no-sandbox'])
    return launchResult
  },
  connect: async () => {
    assert.fail('primary launch should not connect to a relaunched browser')
  },
}

assert.equal(
  await launchBrowser(primaryPuppeteer, {
    executablePath: 'browser.exe',
    userDataDir: 'profile',
    args: ['--no-sandbox'],
  }),
  launchResult,
)

const profile = await mkdtemp(
  path.join(os.tmpdir(), 'dov-browser-launch-test-'),
)
try {
  await writeFile(
    path.join(profile, 'DevToolsActivePort'),
    '9222\n/devtools/browser/test-id\n',
  )
  const relaunchedResult = { kind: 'reconnected' }
  const relaunchPuppeteer = {
    launch: async () => {
      throw new Error('browser launcher exited during Edge relaunch')
    },
    connect: async ({ browserWSEndpoint }) => {
      assert.equal(
        browserWSEndpoint,
        'ws://127.0.0.1:9222/devtools/browser/test-id',
      )
      return relaunchedResult
    },
  }

  assert.equal(
    await launchBrowser(relaunchPuppeteer, {
      executablePath: 'msedge.exe',
      userDataDir: profile,
    }),
    relaunchedResult,
  )
} finally {
  await rm(profile, { recursive: true, force: true })
}

console.log('browser launch compatibility tests passed.')

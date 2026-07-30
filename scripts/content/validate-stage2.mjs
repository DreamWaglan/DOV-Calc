import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const scripts = [
  'validate-content-schema.mjs',
  'validate-authorization.mjs',
  'validate-provenance.mjs',
  'validate-links.mjs',
  'validate-drift.mjs',
]

for (const script of scripts) {
  const result = spawnSync(
    process.execPath,
    [path.join('scripts', 'content', script)],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      windowsHide: true,
    },
  )
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log('Stage 2 content quality validation passed.')

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const checks = [
  'scripts/content/validate-stage0.mjs',
  'scripts/content/validate-vitepress-migration.mjs',
  'tests/content/authorization-policy.mjs',
  'tests/content/public-artifact-policy.mjs',
  'scripts/content/validate-authorization.mjs',
  'scripts/content/scan-public-artifacts.mjs',
  'scripts/test-imports.mjs',
  'scripts/content/validate-full-content-map.mjs',
  'tests/content/redirect-policy.mjs',
  'scripts/content/validate-core-content.mjs',
  'scripts/content/validate-redirects.mjs',
  'scripts/content/validate-stage4.mjs',
  'scripts/quality/search-quality.mjs',
  'tests/quality/mobile-a11y-static.mjs',
  'scripts/quality/staleness-report.mjs',
]

for (const check of checks) {
  const result = spawnSync(process.execPath, [path.normalize(check)], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log('Repository tests passed.')

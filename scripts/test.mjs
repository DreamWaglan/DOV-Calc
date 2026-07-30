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
  'tests/content/advanced-content-ownership.mjs',
  'tests/content/redirect-policy.mjs',
  'tests/content/legacy-anchor-redirects.mjs',
  'scripts/content/validate-core-content.mjs',
  'scripts/content/validate-advanced-content.mjs',
  'scripts/content/validate-basic-attack-dataset.mjs',
  'tests/tools/basic-attack-model.mjs',
  'tests/content/page-review-hash.mjs',
  'scripts/content/validate-page-reviews.mjs',
  'scripts/content/validate-drift.mjs',
  'scripts/content/validate-document-structures.mjs',
  'scripts/content/validate-formulas.mjs',
  'tests/content/media-policy.mjs',
  'scripts/content/validate-media-library.mjs',
  'scripts/content/validate-redirects.mjs',
  'scripts/content/validate-stage4.mjs',
  'scripts/quality/search-quality.mjs',
  'tests/quality/mobile-a11y-static.mjs',
  'tests/quality/lighthouse-policy.mjs',
  'tests/quality/traceability-policy.mjs',
  'tests/release/deployment-arguments.mjs',
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

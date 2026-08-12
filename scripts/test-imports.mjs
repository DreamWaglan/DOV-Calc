import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

for (const test of [
  'tests/content/migration-elements.mjs',
  'tests/content/docx-table-cell-placement.mjs',
  'tests/content/import-docx-image.mjs',
  'tests/content/import-xlsx.mjs',
  'tests/content/basic-attack-dataset.mjs',
  'tests/content/full-content-map.mjs',
  'tests/content/advanced-content-ownership.mjs',
  'tests/content/media-policy.mjs',
  'tests/content/import-determinism.mjs',
]) {
  const result = spawnSync(process.execPath, [path.normalize(test)], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

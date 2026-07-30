import assert from 'node:assert/strict'
import {
  headingSlugs,
  redirectGraphErrors,
  slugifyHeading,
  splitRouteAnchor,
} from '../../scripts/content/lib/redirect-policy.mjs'

assert.equal(slugifyHeading('第二阶段  1-1至8-10'), '第二阶段-1-1至8-10')
assert.equal(slugifyHeading('三、初步配队'), '三-初步配队')
assert.deepEqual(splitRouteAnchor('/start/foo#第二章'), {
  route: '/start/foo',
  anchor: '第二章',
})
assert.deepEqual(
  headingSlugs('# 标题\n\n## 重复\n\n## 重复\n\n## 三、初步配队'),
  ['标题', '重复', '重复-1', '三-初步配队'],
)
assert.deepEqual(
  redirectGraphErrors([
    {
      legacyPath: '/old',
      targetPath: '/new',
    },
  ]),
  [],
)
assert.ok(
  redirectGraphErrors([
    {
      legacyPath: '/old',
      targetPath: '/middle',
    },
    {
      legacyPath: '/middle',
      targetPath: '/new',
    },
  ]).some((error) => error.includes('flattened')),
)
assert.ok(
  redirectGraphErrors([
    {
      legacyPath: '/a',
      targetPath: '/b',
    },
    {
      legacyPath: '/b',
      targetPath: '/a',
    },
  ]).some((error) => error.includes('cycle')),
)

console.log('redirect policy tests passed.')

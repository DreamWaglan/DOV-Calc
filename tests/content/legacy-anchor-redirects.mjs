import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  legacyAnchorTarget,
  routeWithoutBase,
} from '../../docs/.vitepress/theme/legacyAnchorRedirectModel.js'

const ledger = JSON.parse(
  await readFile('content/governance/redirects.json', 'utf8'),
)

assert.equal(
  routeWithoutBase('/DOV-Calc/start/first-week', '/DOV-Calc/'),
  '/start/first-week',
)
assert.equal(routeWithoutBase('/start/first-week', '/'), '/start/first-week')

for (const redirect of ledger.redirects) {
  const [pathname, hash = ''] = redirect.legacyPath.split('#', 2)
  assert.equal(
    legacyAnchorTarget(
      ledger.redirects,
      {
        pathname: `/DOV-Calc${pathname}`,
        hash: `#${encodeURIComponent(hash)}`,
      },
      '/DOV-Calc/',
    ),
    redirect.targetPath,
    redirect.legacyPath,
  )
}

assert.equal(
  legacyAnchorTarget(
    ledger.redirects,
    {
      pathname: '/DOV-Calc/start/first-week',
      hash: '#不存在',
    },
    '/DOV-Calc/',
  ),
  null,
)

console.log(`legacy anchor redirect contracts passed (${ledger.redirects.length})`)

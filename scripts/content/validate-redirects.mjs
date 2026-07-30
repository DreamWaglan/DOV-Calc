import { readFile } from 'node:fs/promises'
import Ajv from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { loadPages, printResult, readJson, writeReport } from './lib/content-utils.mjs'
import {
  headingSlugs,
  redirectGraphErrors,
  splitRouteAnchor,
} from './lib/redirect-policy.mjs'

const ledger = await readJson('content/governance/redirects.json')
const schema = await readJson('content/schemas/redirects.schema.json')
const pages = await loadPages()
const byId = new Map(pages.map((page) => [page.frontmatter.id, page]))
const byRoute = new Map(pages.map((page) => [page.route, page]))
const failures = []

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)
if (!validate(ledger)) {
  for (const error of validate.errors ?? []) {
    failures.push(`schema ${error.instancePath || '/'} ${error.message}`)
  }
}

failures.push(...redirectGraphErrors(ledger.redirects ?? []))

let releaseBlocked = 0
for (const redirect of ledger.redirects ?? []) {
  const target = byId.get(redirect.targetPageId)
  const { route: targetRoute, anchor: targetAnchor } = splitRouteAnchor(
    redirect.targetPath,
  )
  const { route: legacyRoute, anchor: legacyAnchor } = splitRouteAnchor(
    redirect.legacyPath,
  )
  if (!target) {
    failures.push(`${redirect.legacyPath}: target page ID does not exist`)
    continue
  }
  if (target.route !== targetRoute) {
    failures.push(
      `${redirect.legacyPath}: target path ${targetRoute} differs from ${target.route}`,
    )
  }
  if (redirect.kind === 'anchor' && !legacyAnchor) {
    failures.push(`${redirect.legacyPath}: anchor redirect has no legacy anchor`)
  }
  if (targetAnchor && !headingSlugs(target.body).includes(targetAnchor)) {
    failures.push(
      `${redirect.legacyPath}: target anchor ${targetAnchor} does not exist on ${target.filePath}`,
    )
  }
  if (
    redirect.kind !== 'anchor' &&
    byRoute.has(legacyRoute) &&
    legacyRoute !== target.route
  ) {
    failures.push(`${redirect.legacyPath}: legacy path collides with a page route`)
  }
  if (
    redirect.status === 'active' &&
    !['current', 'stale'].includes(target.frontmatter.status)
  ) {
    failures.push(
      `${redirect.legacyPath}: active redirect target is ${target.frontmatter.status}`,
    )
  }
  if (
    redirect.status !== 'active' ||
    !['current', 'stale'].includes(target.frontmatter.status)
  ) {
    releaseBlocked += 1
  }
  if (
    redirect.noindex !== true ||
    redirect.searchIndex !== false ||
    redirect.sitemap !== false
  ) {
    failures.push(`${redirect.legacyPath}: redirect indexing policy is unsafe`)
  }
  const serialized = JSON.stringify(redirect)
  if (
    /[A-Za-z]:[\\/]|content[\\/]imports|quarantine|\.docx|\.xlsx/i.test(
      serialized,
    )
  ) {
    failures.push(`${redirect.legacyPath}: redirect leaks an internal source marker`)
  }
}

const report = {
  schemaVersion: 1,
  summary: {
    redirects: ledger.redirects?.length ?? 0,
    active: (ledger.redirects ?? []).filter(
      (redirect) => redirect.status === 'active',
    ).length,
    planned: (ledger.redirects ?? []).filter(
      (redirect) => redirect.status === 'planned',
    ).length,
    releaseBlocked,
    failures: failures.length,
  },
  redirects: (ledger.redirects ?? []).map((redirect) => ({
    legacyPath: redirect.legacyPath,
    targetPageId: redirect.targetPageId,
    targetPath: redirect.targetPath,
    status: redirect.status,
  })),
  failures,
}
const reportPath = await writeReport('redirects', report)
printResult('Redirect ledger validation', failures, reportPath)

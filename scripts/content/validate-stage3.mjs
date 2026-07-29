import { spawnSync } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'

const stage2 = spawnSync(
  process.execPath,
  [path.join('scripts', 'content', 'validate-stage2.mjs')],
  {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  },
)
if (stage2.status !== 0) process.exit(stage2.status ?? 1)

const failures = []
const pages = await loadPages()
const byId = new Map(pages.map((page) => [page.frontmatter.id, page]))

const requiredPages = new Map([
  ['start-index', '/start/'],
  ['start-preface', '/start/preface'],
  ['start-game-introduction', '/start/game-introduction'],
  ['start-first-week', '/start/first-week'],
  ['progression-index', '/progression/'],
  ['progression-leveling', '/progression/leveling'],
  ['combat-index', '/combat/'],
  ['combat-event-maps', '/combat/event-maps'],
  ['combat-pve-team-building', '/combat/pve-team-building'],
  ['topic-new-player-checklist', '/topics/new-player-checklist'],
  ['topic-pve-selection', '/topics/pve-selection'],
  ['topic-beginner-equipment', '/topics/beginner-equipment'],
  ['about-sources', '/about/sources-and-copyright'],
  ['about-contributing', '/about/contributing'],
  ['about-version-log', '/about/version-log'],
])

for (const [id, route] of requiredPages) {
  const page = byId.get(id)
  if (!page) {
    failures.push(`missing Stage 3 page: ${id}`)
    continue
  }
  if (page.route !== route) {
    failures.push(`${id}: expected route ${route}, found ${page.route}`)
  }
}

const readingPath = [
  ['site-home', './start/'],
  ['start-index', './game-introduction'],
  ['start-game-introduction', './first-week'],
  ['start-first-week', '../progression/leveling'],
  ['progression-leveling', '../combat/event-maps'],
  ['combat-event-maps', './pve-team-building'],
]

for (const [id, expectedLink] of readingPath) {
  const page = byId.get(id)
  if (!page?.body.includes(`](${expectedLink})`) && !page?.body.includes(`href="${expectedLink}"`)) {
    failures.push(`${id}: missing newcomer reading-path link ${expectedLink}`)
  }
}

const tacticalPages = [
  'start-first-week',
  'progression-leveling',
  'combat-event-maps',
  'combat-pve-team-building',
  'topic-new-player-checklist',
  'topic-pve-selection',
  'topic-beginner-equipment',
]

for (const id of tacticalPages) {
  const page = byId.get(id)
  if (!page) continue
  const sources = page.frontmatter.sources ?? []
  const publicEvidence = sources.some(
    (source) =>
      ['official', 'wiki', 'author-post', 'forum', 'video'].includes(
        source.sourceType,
      ) &&
      source.permission === 'quoted' &&
      source.publicUse?.body === true &&
      source.publicUse?.asset === false,
  )
  if (!publicEvidence) {
    failures.push(`${id}: missing publicly traceable quoted evidence`)
  }
}

const textVersions = new Map([
  ['topic-new-player-checklist', 'src-ec1754535996'],
  ['topic-pve-selection', 'src-a82171ad36dd'],
  ['topic-beginner-equipment', 'src-3f75f2339e43'],
])

for (const [id, sourceAssetId] of textVersions) {
  const page = byId.get(id)
  const source = (page?.frontmatter.sources ?? []).find(
    (candidate) => candidate.assetId === sourceAssetId,
  )
  if (
    !source ||
    source.permission !== 'pending' ||
    source.publicUse?.body !== false ||
    source.publicUse?.asset !== false
  ) {
    failures.push(
      `${id}: pending long-image source must be registered with public use disabled`,
    )
  }
}

const docxMap = await readJson('content/migration/stage3-docx-map.json')
const sourceRegistry = await readJson('content/governance/source-assets.json')
const sourceById = new Map(
  (sourceRegistry.assets ?? []).map((source) => [source.id, source]),
)
if (docxMap.assets?.length !== 6) {
  failures.push(
    `Stage 3 DOCX map must contain 6 assets, found ${docxMap.assets?.length ?? 0}`,
  )
}

const serializedMap = JSON.stringify(docxMap)
if (/[A-Za-z]:[\\/]/.test(serializedMap)) {
  failures.push('Stage 3 DOCX map contains an absolute Windows path')
}
if (serializedMap.includes('鍓嶈') || serializedMap.includes('\uFFFD')) {
  failures.push('Stage 3 DOCX map contains mojibake or replacement characters')
}

for (const asset of docxMap.assets ?? []) {
  const registered = sourceById.get(asset.assetId)
  if (!registered) {
    failures.push(`${asset.assetId}: DOCX map source is not registered`)
  } else {
    if (asset.hash !== registered.hashes?.sha256) {
      failures.push(`${asset.assetId}: DOCX map hash differs from source registry`)
    }
    if (asset.sourceFileName !== registered.title) {
      failures.push(
        `${asset.assetId}: DOCX source file name differs from source registry`,
      )
    }
  }
  if (asset.publishable !== false) {
    failures.push(`${asset.assetId}: pending DOCX import must not be publishable`)
  }
  if ((asset.headingOutline?.length ?? 0) > 60) {
    failures.push(`${asset.assetId}: heading outline exceeds 60 entries`)
  }
  const target = byId.get(asset.suggestedPageId)
  if (!target) {
    failures.push(
      `${asset.assetId}: mapped page ${asset.suggestedPageId} does not exist`,
    )
  }
  const sourceReference = (target?.frontmatter.sources ?? []).find(
    (source) => source.assetId === asset.assetId,
  )
  if (
    !sourceReference ||
    sourceReference.permission !== 'pending' ||
    sourceReference.publicUse?.body !== false ||
    sourceReference.publicUse?.asset !== false
  ) {
    failures.push(
      `${asset.assetId}: mapped public page must keep pending source use disabled`,
    )
  }
}

const publicRoot = path.join(root, 'docs', 'public')
const publicListing = await readJson('content/governance/public-assets.json')
const allowedRoots = (publicListing.collections ?? []).map((collection) =>
  path.join(root, collection.root),
)

async function listPublicFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    () => [],
  )
  const files = []
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listPublicFiles(absolutePath)))
    } else if (entry.isFile()) {
      files.push(absolutePath)
    }
  }
  return files
}

if (allowedRoots.length === 0) {
  failures.push('public asset allowlist is missing the retained equipment collection')
}
for (const publicFile of await listPublicFiles(publicRoot)) {
  const allowed = allowedRoots.some(
    (allowedRoot) =>
      publicFile === allowedRoot || publicFile.startsWith(`${allowedRoot}${path.sep}`),
  )
  if (!allowed) {
    failures.push(
      `${path.relative(root, publicFile)}: public file is outside the authorized allowlist`,
    )
  }
}

const report = {
  schemaVersion: 1,
  check: 'stage3-core-content',
  summary: {
    pages: pages.length,
    requiredPages: requiredPages.size,
    tacticalPages: tacticalPages.length,
    textVersions: textVersions.size,
    docxImports: docxMap.assets?.length ?? 0,
    failures: failures.length,
  },
  newcomerPath: readingPath.map(([id]) => id),
  requiredPageIds: [...requiredPages.keys()],
  failures,
}

const reportPath = await writeReport('stage3-core-content', report)
printResult('Stage 3 core content validation', failures, reportPath)

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'
import { pageReviewDecision } from './lib/page-review-decisions.mjs'

const DAMAGE_SOURCE_ID = 'src-c8852cf69a7b'
const fullMap = await readJson('content/migrations/full-content-map.json')
const advanced = await readJson(
  'content/migrations/advanced-content-pages.json',
)
const fixture = await readJson('tests/fixtures/damage-calculator-golden.json')
const pages = await loadPages()
const pageById = new Map(pages.map((page) => [page.frontmatter.id, page]))
const failures = []
const formulas = fullMap.elements.filter(
  (element) => element.elementType === 'formula',
)
const damagePages =
  advanced.sources.find((source) => source.sourceAssetId === DAMAGE_SOURCE_ID)
    ?.pages ?? []

function owningPage(bodyIndex) {
  return damagePages.find(
    (page) =>
      bodyIndex >= page.sourceElementRange.bodyIndexStart &&
      bodyIndex < page.sourceElementRange.bodyIndexEndExclusive,
  )
}

if (formulas.length !== 24) {
  failures.push(`formula count: expected 24, got ${formulas.length}`)
}

const seen = new Set()
for (const formula of formulas) {
  if (seen.has(formula.sourceElementId)) {
    failures.push(`${formula.sourceElementId}: duplicate formula ID`)
  }
  seen.add(formula.sourceElementId)
  if (formula.sourceAssetId !== DAMAGE_SOURCE_ID) {
    failures.push(`${formula.sourceElementId}: formula belongs to another source`)
  }
  if (
    !Number.isInteger(formula.sourcePosition?.bodyIndex) ||
    !Number.isInteger(formula.sourcePosition?.formulaIndex) ||
    !['m:oMath', 'm:oMathPara'].includes(formula.sourcePosition?.ooxmlKind)
  ) {
    failures.push(`${formula.sourceElementId}: source position is incomplete`)
  }
  if (
    formula.equivalent?.format !== 'source-text' ||
    !formula.equivalent?.value?.trim() ||
    formula.equivalent?.reviewStatus !== 'pending-fact-review'
  ) {
    failures.push(`${formula.sourceElementId}: accessible equivalent is incomplete`)
  }
  if (!formula.factReviewer?.trim()) {
    failures.push(`${formula.sourceElementId}: fact reviewer is missing`)
  }
  const owner = owningPage(formula.sourcePosition?.bodyIndex)
  if (!owner || formula.targetPageIds.length !== 1) {
    failures.push(`${formula.sourceElementId}: formula does not have one owning page`)
  } else if (formula.targetPageIds[0] !== owner.pageId) {
    failures.push(
      `${formula.sourceElementId}: expected ${owner.pageId}, got ${formula.targetPageIds[0]}`,
    )
  }
  for (const pageId of formula.targetPageIds) {
    const page = pageById.get(pageId)
    const decision = pageReviewDecision(pageId)
    if (
      !page ||
      !decision ||
      page.frontmatter.status !== decision.finalStatus ||
      !String(decision.tracks?.factual ?? '').startsWith('approved')
    ) {
      failures.push(
        `${formula.sourceElementId}: final formula page review decision is incomplete`,
      )
    }
  }
}

const goldenResult = spawnSync(
  process.execPath,
  [path.join(root, 'tests/tools/damage-calculator-helpers.mjs')],
  {
    cwd: root,
    env: process.env,
    encoding: 'utf8',
    windowsHide: true,
  },
)
if (goldenResult.status !== 0) {
  failures.push(
    `damage calculator golden regression failed: ${goldenResult.stderr || goldenResult.stdout}`,
  )
}

const duplicateTextGroups = Object.values(
  Object.groupBy(formulas, (formula) => formula.sourceTextHash),
)
  .filter((group) => group.length > 1)
  .map((group) => ({
    sourceTextHash: group[0].sourceTextHash,
    formulaIds: group.map((formula) => formula.sourceElementId),
    ooxmlKinds: [...new Set(group.map((formula) => formula.sourcePosition.ooxmlKind))],
  }))

const report = {
  schemaVersion: 1,
  check: 'formula-accessibility-and-regression',
  summary: {
    formulas: formulas.length,
    sourceAssets: new Set(formulas.map((formula) => formula.sourceAssetId)).size,
    targetPages: new Set(formulas.flatMap((formula) => formula.targetPageIds))
      .size,
    calculatorGoldenCases: fixture.cases?.length ?? 0,
    nestedOoxmlDuplicateGroups: duplicateTextGroups.length,
    failures: failures.length,
  },
  reviewBoundary: {
    importAnnotationStatus: 'pending-fact-review',
    finalPageReviewStatus: 'approved-source-version',
    publicationGate:
      'The import annotation records the original extraction gate. Publication requires an approved factual track in the Phase 7 page-review ledger for every owning page.',
    calculatorEvidence:
      'The calculator golden suite remains an independent regression guard; page-level approval is recorded separately from the immutable import annotation.',
  },
  formulas: formulas.map((formula) => ({
    sourceElementId: formula.sourceElementId,
    sourcePosition: formula.sourcePosition,
    targetPageIds: formula.targetPageIds,
    equivalent: formula.equivalent,
    factReviewer: formula.factReviewer,
  })),
  duplicateTextGroups,
  failures,
}

const reportPath = await writeReport('formulas', report)
printResult('Formula accessibility and regression validation', failures, reportPath)

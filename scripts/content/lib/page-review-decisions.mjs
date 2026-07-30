import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
)
const decisionPath = path.join(
  root,
  'content/governance/page-review-decisions.json',
)

let decisionsByPageId = new Map()
try {
  const ledger = JSON.parse(readFileSync(decisionPath, 'utf8'))
  decisionsByPageId = new Map(
    (ledger.decisions ?? []).map((decision) => [decision.pageId, decision]),
  )
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}

export function pageReviewDecision(pageId) {
  return decisionsByPageId.get(pageId) ?? null
}

export function pageReviewStatus(pageId, fallback = 'draft') {
  return pageReviewDecision(pageId)?.finalStatus ?? fallback
}

export function applyPageReviewStatus(definition) {
  return {
    ...definition,
    status: pageReviewStatus(definition.id, definition.status ?? 'draft'),
  }
}

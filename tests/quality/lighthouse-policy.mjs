import assert from 'node:assert/strict'
import {
  effectivePerformanceThresholds,
  isPerformanceBudgetEnforced,
  median,
  requiresPerformanceConfirmation,
  resolvePerformanceBudgetEnforcement,
  summarizePerformanceMeasurements,
} from '../../scripts/quality/lighthouse-policy.mjs'

const thresholds = {
  performance: 0.85,
  largestContentfulPaintMs: 2500,
  cumulativeLayoutShift: 0.1,
}

function measurement(performance, lcp, cls, accessibility = 1, seo = 1) {
  return {
    scores: { performance, accessibility, seo },
    metrics: {
      largestContentfulPaintMs: lcp,
      cumulativeLayoutShift: cls,
    },
  }
}

assert.equal(median([3, 1, 2]), 2)
assert.equal(median([4, 2]), 3)
assert.throws(() => median([]), /at least one value/)
assert.throws(() => median([1, Number.NaN]), /finite numbers/)

const originalMediaPage = {
  performanceBudgetException: {
    exemptBudgets: ['performance', 'largestContentfulPaintMs'],
  },
}
assert.equal(
  isPerformanceBudgetEnforced(originalMediaPage, 'performance'),
  false,
)
assert.equal(
  isPerformanceBudgetEnforced(
    originalMediaPage,
    'largestContentfulPaintMs',
  ),
  false,
)
assert.equal(
  isPerformanceBudgetEnforced(originalMediaPage, 'cumulativeLayoutShift'),
  true,
)
assert.throws(
  () => isPerformanceBudgetEnforced(originalMediaPage, 'unknown-budget'),
  /unknown performance budget/,
)
assert.deepEqual(resolvePerformanceBudgetEnforcement(originalMediaPage), {
  performance: false,
  largestContentfulPaintMs: false,
  cumulativeLayoutShift: true,
  initialJavaScriptGzipBytes: true,
})

const originalMediaThresholds = effectivePerformanceThresholds(
  originalMediaPage,
  thresholds,
)
assert.equal(originalMediaThresholds.performance, Number.NEGATIVE_INFINITY)
assert.equal(
  originalMediaThresholds.largestContentfulPaintMs,
  Number.POSITIVE_INFINITY,
)
assert.equal(originalMediaThresholds.cumulativeLayoutShift, 0.1)
assert.equal(
  requiresPerformanceConfirmation(
    measurement(0.6, 32_000, 0.02),
    originalMediaThresholds,
  ),
  false,
)
assert.equal(
  requiresPerformanceConfirmation(
    measurement(0.6, 32_000, 0.11),
    originalMediaThresholds,
  ),
  true,
)

assert.equal(
  requiresPerformanceConfirmation(
    measurement(0.95, 2200, 0.02),
    thresholds,
  ),
  false,
)
assert.equal(
  requiresPerformanceConfirmation(
    measurement(0.84, 2200, 0.02),
    thresholds,
  ),
  true,
)
assert.equal(
  requiresPerformanceConfirmation(
    measurement(0.95, 2501, 0.02),
    thresholds,
  ),
  true,
)
assert.equal(
  requiresPerformanceConfirmation(
    measurement(0.95, 2200, 0.101),
    thresholds,
  ),
  true,
)

const oneOutlier = summarizePerformanceMeasurements([
  measurement(0.96, 2200, 0.02),
  measurement(0.8, 2800, 0.12, 0.98, 0.99),
  measurement(0.95, 2300, 0.03),
])
assert.deepEqual(oneOutlier, {
  scores: {
    performance: 0.95,
    accessibility: 0.98,
    seo: 0.99,
  },
  metrics: {
    largestContentfulPaintMs: 2300,
    cumulativeLayoutShift: 0.03,
  },
})

const persistentRegression = summarizePerformanceMeasurements([
  measurement(0.84, 2600, 0.11),
  measurement(0.83, 2700, 0.12),
  measurement(0.82, 2800, 0.13),
])
assert.ok(persistentRegression.scores.performance < thresholds.performance)
assert.ok(
  persistentRegression.metrics.largestContentfulPaintMs >
    thresholds.largestContentfulPaintMs,
)
assert.ok(
  persistentRegression.metrics.cumulativeLayoutShift >
    thresholds.cumulativeLayoutShift,
)

console.log('Lighthouse confirmation policy tests passed.')

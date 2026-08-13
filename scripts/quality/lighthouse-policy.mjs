export function median(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('median requires at least one value')
  }
  const sorted = values.map(Number).sort((left, right) => left - right)
  if (sorted.some((value) => !Number.isFinite(value))) {
    throw new Error('median values must be finite numbers')
  }
  const midpoint = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[midpoint - 1] + sorted[midpoint]) / 2
    : sorted[midpoint]
}

const performanceBudgetKeys = new Set([
  'performance',
  'largestContentfulPaintMs',
  'cumulativeLayoutShift',
  'initialJavaScriptGzipBytes',
])

export function isPerformanceBudgetEnforced(page, budgetKey) {
  if (!performanceBudgetKeys.has(budgetKey)) {
    throw new Error(`unknown performance budget: ${budgetKey}`)
  }
  return !(
    page.performanceBudgetException?.exemptBudgets?.includes(budgetKey) ?? false
  )
}

export function resolvePerformanceBudgetEnforcement(page) {
  return Object.fromEntries(
    [...performanceBudgetKeys].map((budgetKey) => [
      budgetKey,
      isPerformanceBudgetEnforced(page, budgetKey),
    ]),
  )
}

export function effectivePerformanceThresholds(page, thresholds) {
  return {
    ...thresholds,
    performance: isPerformanceBudgetEnforced(page, 'performance')
      ? thresholds.performance
      : Number.NEGATIVE_INFINITY,
    largestContentfulPaintMs: isPerformanceBudgetEnforced(
      page,
      'largestContentfulPaintMs',
    )
      ? thresholds.largestContentfulPaintMs
      : Number.POSITIVE_INFINITY,
    cumulativeLayoutShift: isPerformanceBudgetEnforced(
      page,
      'cumulativeLayoutShift',
    )
      ? thresholds.cumulativeLayoutShift
      : Number.POSITIVE_INFINITY,
  }
}

export function requiresPerformanceConfirmation(measurement, thresholds) {
  return (
    measurement.scores.performance < thresholds.performance ||
    measurement.metrics.largestContentfulPaintMs >
      thresholds.largestContentfulPaintMs ||
    measurement.metrics.cumulativeLayoutShift >
      thresholds.cumulativeLayoutShift
  )
}

export function summarizePerformanceMeasurements(measurements) {
  if (!Array.isArray(measurements) || measurements.length === 0) {
    throw new Error('performance summary requires at least one measurement')
  }
  return {
    scores: {
      performance: median(
        measurements.map((measurement) => measurement.scores.performance),
      ),
      accessibility: Math.min(
        ...measurements.map(
          (measurement) => measurement.scores.accessibility,
        ),
      ),
      seo: Math.min(
        ...measurements.map((measurement) => measurement.scores.seo),
      ),
    },
    metrics: {
      largestContentfulPaintMs: median(
        measurements.map(
          (measurement) =>
            measurement.metrics.largestContentfulPaintMs,
        ),
      ),
      cumulativeLayoutShift: median(
        measurements.map(
          (measurement) => measurement.metrics.cumulativeLayoutShift,
        ),
      ),
    },
  }
}

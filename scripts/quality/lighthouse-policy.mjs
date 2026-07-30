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

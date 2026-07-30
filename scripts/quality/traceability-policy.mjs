export function hasCompleteSourceTraceability(drift, expectedAssets = 29) {
  const summary = drift?.summary ?? {}
  const sourceRootAvailable = drift?.sourceRootAvailable === true
  const sourceCoverage = sourceRootAvailable
    ? summary.sourceHashesChecked === expectedAssets
    : summary.sourceHashesChecked === 0

  return (
    summary.sourceAssets === expectedAssets &&
    sourceCoverage &&
    summary.importAssetsChecked === expectedAssets &&
    summary.importArtifactsChecked >= expectedAssets
  )
}

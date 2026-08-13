export function hasCompleteMediaSourceTraceability(
  report,
  { standaloneImages = 15, docxMediaElements = 585 } = {},
) {
  const summary = report?.summary ?? {}
  const sourceRootAvailable = report?.sourceRootAvailable === true

  if (sourceRootAvailable) {
    return (
      summary.verifiedStandaloneSourceBytes === standaloneImages &&
      summary.verifiedDocxPackageMedia === docxMediaElements &&
      summary.skippedStandaloneSourceBytes === 0 &&
      summary.skippedDocxPackageMedia === 0
    )
  }

  return (
    summary.verifiedStandaloneSourceBytes === 0 &&
    summary.verifiedDocxPackageMedia === 0 &&
    summary.skippedStandaloneSourceBytes === standaloneImages &&
    summary.skippedDocxPackageMedia === docxMediaElements
  )
}

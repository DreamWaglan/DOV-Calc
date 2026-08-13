export function isTaggedRelease(manifest) {
  return manifest.release?.state === 'tagged'
}

export function hasMatchingReleaseTag(manifest) {
  return (
    manifest.repository?.tag?.present === true &&
    manifest.repository?.tag?.matchesHead === true
  )
}

export function releaseStateAccepted(manifest, { requireTagged = false } = {}) {
  if (requireTagged) {
    return isTaggedRelease(manifest) && hasMatchingReleaseTag(manifest)
  }

  if (manifest.release?.state === 'candidate') return true
  if (isTaggedRelease(manifest)) return hasMatchingReleaseTag(manifest)
  return false
}

export function deploymentReleaseFailures(manifest) {
  if (releaseStateAccepted(manifest)) return []

  if (!['candidate', 'tagged'].includes(manifest.release?.state)) {
    return ['线上验证要求 release.state 为 candidate 或 tagged']
  }

  return ['tagged 线上验证要求候选标签存在并指向清单 HEAD']
}

export function deployedReleaseTag(manifest) {
  return isTaggedRelease(manifest) ? manifest.release?.candidateTag : null
}

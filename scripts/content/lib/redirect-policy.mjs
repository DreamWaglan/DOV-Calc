const rControl = /[\u0000-\u001f]/g
const rSpecial =
  /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’、，。！？：；《》〈〉（）【】,.?\/]+/g
const rCombining = /[\u0300-\u036f]/g

export function slugifyHeading(value) {
  return String(value)
    .normalize('NFKD')
    .replace(rCombining, '')
    .replace(rControl, '')
    .replace(rSpecial, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(\d)/, '_$1')
    .toLowerCase()
}

export function splitRouteAnchor(value) {
  const [route, ...anchorParts] = value.split('#')
  return {
    route: route || '/',
    anchor: anchorParts.length > 0 ? anchorParts.join('#') : null,
  }
}

export function headingSlugs(markdown) {
  const counts = new Map()
  return [...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => {
    const base = slugifyHeading(
      match[1]
        .replace(/<[^>]+>/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[`*_~]/g, ''),
    )
    const count = counts.get(base) ?? 0
    counts.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  })
}

export function redirectGraphErrors(redirects) {
  const failures = []
  const legacyPaths = new Set()
  for (const redirect of redirects) {
    if (legacyPaths.has(redirect.legacyPath)) {
      failures.push(`duplicate legacyPath: ${redirect.legacyPath}`)
    }
    legacyPaths.add(redirect.legacyPath)
    if (redirect.legacyPath === redirect.targetPath) {
      failures.push(`self redirect: ${redirect.legacyPath}`)
    }
  }

  const byLegacy = new Map(
    redirects.map((redirect) => [redirect.legacyPath, redirect]),
  )
  for (const redirect of redirects) {
    const seen = new Set([redirect.legacyPath])
    let target = redirect.targetPath
    while (byLegacy.has(target)) {
      if (seen.has(target)) {
        failures.push(`redirect cycle: ${[...seen, target].join(' -> ')}`)
        break
      }
      seen.add(target)
      target = byLegacy.get(target).targetPath
    }
    if (seen.size > 1) {
      failures.push(
        `redirect chain must be flattened: ${redirect.legacyPath} -> ${redirect.targetPath}`,
      )
    }
  }
  return failures
}

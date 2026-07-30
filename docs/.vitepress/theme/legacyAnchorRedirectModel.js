function normalizeBase(base = '/') {
  const trimmed = String(base).trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`
}

export function routeWithoutBase(pathname, base = '/') {
  const normalizedBase = normalizeBase(base)
  if (normalizedBase === '/') return pathname || '/'
  const basePrefix = normalizedBase.slice(0, -1)
  if (pathname !== basePrefix && !pathname.startsWith(`${basePrefix}/`)) {
    return pathname || '/'
  }
  return pathname.slice(basePrefix.length) || '/'
}

export function legacyAnchorTarget(redirects, location, base = '/') {
  if (!location?.hash) return null
  const route = routeWithoutBase(location.pathname, base).replace(/\/+$/, '') || '/'
  let decodedHash
  try {
    decodedHash = decodeURIComponent(location.hash)
  } catch {
    return null
  }
  const legacyPath = `${route}${decodedHash}`
  const redirect = redirects.find(
    (entry) =>
      entry.status === 'active' &&
      entry.kind === 'anchor' &&
      entry.legacyPath === legacyPath,
  )
  return redirect?.targetPath ?? null
}

export const PUBLIC_RELEASE_FIELDS = Object.freeze([
  'body',
  'asset',
  'searchIndex',
  'sitemap',
  'download',
  'derivative',
  'structuredData',
])

export const PERMISSIONS = Object.freeze([
  'owned',
  'authorized',
  'quoted',
  'pending',
  'restricted',
])

function disabledRelease(mode = 'blocked', reason = '') {
  return {
    ...Object.fromEntries(PUBLIC_RELEASE_FIELDS.map((field) => [field, false])),
    mode,
    reason,
  }
}

function currentDate(now) {
  return now.toISOString().slice(0, 10)
}

export function authorizationErrors(asset, now = new Date()) {
  const errors = []
  if (!PERMISSIONS.includes(asset?.permission)) {
    return [`unsupported permission: ${asset?.permission ?? '(missing)'}`]
  }
  if (['pending', 'restricted'].includes(asset.permission)) return errors

  const authorization = asset.authorization
  if (!authorization || typeof authorization !== 'object') {
    return ['authorization metadata is required']
  }

  for (const field of [
    'evidenceId',
    'rightsHolder',
    'grantedBy',
    'grantedAt',
    'evidencePath',
    'attribution',
  ]) {
    if (
      typeof authorization[field] !== 'string' ||
      authorization[field].trim() === ''
    ) {
      errors.push(`authorization.${field} is required`)
    }
  }

  if (!authorization.scope || typeof authorization.scope !== 'object') {
    errors.push('authorization.scope is required')
  } else {
    for (const field of PUBLIC_RELEASE_FIELDS) {
      if (typeof authorization.scope[field] !== 'boolean') {
        errors.push(`authorization.scope.${field} must be boolean`)
      }
    }
  }

  if (!Array.isArray(authorization.restrictions)) {
    errors.push('authorization.restrictions must be an array')
  }
  if (!Array.isArray(authorization.deniedScopes)) {
    errors.push('authorization.deniedScopes must be an array')
  } else {
    for (const field of authorization.deniedScopes) {
      if (!PUBLIC_RELEASE_FIELDS.includes(field)) {
        errors.push(`authorization.deniedScopes contains ${field}`)
      }
    }
  }

  if (
    authorization.expiresAt !== null &&
    authorization.expiresAt !== undefined
  ) {
    if (
      typeof authorization.expiresAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(authorization.expiresAt)
    ) {
      errors.push('authorization.expiresAt must be null or an ISO date')
    } else if (authorization.expiresAt < currentDate(now)) {
      errors.push(`authorization expired at ${authorization.expiresAt}`)
    }
  }

  if (
    asset.permission === 'quoted' &&
    authorization.scope?.body !== true
  ) {
    errors.push('quoted permission requires authorization.scope.body=true')
  }

  return errors
}

export function derivePublicRelease(asset, now = new Date()) {
  if (asset?.permission === 'pending') {
    return {
      publicRelease: disabledRelease(
        'blocked',
        '许可范围尚未确认，所有公开出口保持关闭。',
      ),
      deniedReasons: ['permission:pending'],
      valid: true,
    }
  }
  if (asset?.permission === 'restricted') {
    return {
      publicRelease: disabledRelease(
        'blocked',
        '该资产被标记为受限，所有公开出口保持关闭。',
      ),
      deniedReasons: ['permission:restricted'],
      valid: true,
    }
  }

  const errors = authorizationErrors(asset, now)
  if (errors.length > 0) {
    return {
      publicRelease: disabledRelease(
        'blocked',
        '授权证据不完整或已失效，所有公开出口保持关闭。',
      ),
      deniedReasons: errors,
      valid: false,
    }
  }

  const deniedScopes = new Set(asset.authorization.deniedScopes)
  if (asset.permission === 'quoted') {
    return {
      publicRelease: {
        ...disabledRelease(),
        body: asset.authorization.scope.body && !deniedScopes.has('body'),
        mode:
          asset.authorization.scope.body && !deniedScopes.has('body')
            ? 'quote-only'
            : 'blocked',
        reason:
          '仅允许在必要限度内展示短引文；引文本身不进入其他公开出口。',
      },
      deniedReasons: [...deniedScopes].map((field) => `deniedScope:${field}`),
      valid: true,
    }
  }

  const output = Object.fromEntries(
    PUBLIC_RELEASE_FIELDS.map((field) => [
      field,
      asset.authorization.scope[field] && !deniedScopes.has(field),
    ]),
  )
  const hasPublicOutput = Object.values(output).some(Boolean)
  return {
    publicRelease: {
      ...output,
      mode: hasPublicOutput ? 'public' : 'blocked',
      reason: hasPublicOutput
        ? '公开出口由 authorization.scope 与 deniedScopes 派生。'
        : '授权记录有效，但未开放任何公开出口。',
    },
    deniedReasons: [...deniedScopes].map((field) => `deniedScope:${field}`),
    valid: true,
  }
}

export function releaseDecisionMatches(stored, derived) {
  return (
    stored &&
    PUBLIC_RELEASE_FIELDS.every(
      (field) => stored[field] === derived.publicRelease[field],
    ) &&
    stored.mode === derived.publicRelease.mode
  )
}

export function permissionIsNoWider(requested, registered) {
  if (requested === registered) return true
  if (['pending', 'restricted'].includes(requested)) return true
  if (
    requested === 'quoted' &&
    ['owned', 'authorized'].includes(registered)
  ) {
    return true
  }
  return false
}

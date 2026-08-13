export const ARTICLE_PARAGRAPH_SEMANTICS = Object.freeze([
  'prose',
  'non-prose',
])

export const ARTICLE_PROSE_CLASS = 'article-prose'
export const ARTICLE_NON_PROSE_CLASS = 'article-non-prose'

const ARTICLE_PARAGRAPH_MARKER_PATTERN =
  /^<!-- article-paragraph:(prose|non-prose) -->$/

function assertSemantic(value, label = 'article paragraph semantic') {
  if (!ARTICLE_PARAGRAPH_SEMANTICS.includes(value)) {
    throw new Error(`${label} must be one of ${ARTICLE_PARAGRAPH_SEMANTICS.join(', ')}`)
  }
  return value
}

export function articleParagraphPolicyErrors(policy) {
  const errors = []
  if (policy?.schemaVersion !== 1) errors.push('schemaVersion must be 1')
  if (!ARTICLE_PARAGRAPH_SEMANTICS.includes(policy?.defaultSemantic)) {
    errors.push('defaultSemantic must be prose or non-prose')
  }
  if (!policy?.sources || typeof policy.sources !== 'object') {
    errors.push('sources must be an object')
    return errors
  }

  for (const [sourceAssetId, source] of Object.entries(policy.sources)) {
    if (!Array.isArray(source?.nonProseStyleIds)) {
      errors.push(`${sourceAssetId}: nonProseStyleIds must be an array`)
    } else if (
      source.nonProseStyleIds.some(
        (styleId) => typeof styleId !== 'string' || styleId.length === 0,
      )
    ) {
      errors.push(`${sourceAssetId}: nonProseStyleIds must contain non-empty strings`)
    }

    if (!source?.overrides || typeof source.overrides !== 'object') {
      errors.push(`${sourceAssetId}: overrides must be an object`)
      continue
    }
    for (const [sourceElementId, semantic] of Object.entries(source.overrides)) {
      if (!sourceElementId.startsWith(`${sourceAssetId}:paragraph:`)) {
        errors.push(`${sourceElementId}: override must target a paragraph in ${sourceAssetId}`)
      }
      if (!ARTICLE_PARAGRAPH_SEMANTICS.includes(semantic)) {
        errors.push(`${sourceElementId}: override has invalid semantic ${semantic}`)
      }
    }
  }
  return errors
}

export function articleParagraphMarker(semantic) {
  return `<!-- article-paragraph:${assertSemantic(semantic)} -->`
}

export function articleParagraphSemanticFromMarker(value) {
  const match = String(value ?? '').trim().match(ARTICLE_PARAGRAPH_MARKER_PATTERN)
  return match?.[1] ?? null
}

export function resolveImportedParagraphSemantic(element, policy) {
  if (element?.elementType !== 'paragraph') return null

  const source = policy?.sources?.[element.sourceAssetId] ?? {}
  const override = source.overrides?.[element.sourceElementId]
  if (override) return assertSemantic(override, `${element.sourceElementId} override`)

  if (
    element.paragraphStyleId &&
    source.nonProseStyleIds?.includes(element.paragraphStyleId)
  ) {
    return 'non-prose'
  }

  return assertSemantic(policy?.defaultSemantic ?? 'prose', 'defaultSemantic')
}

function articleParagraphClass(semantic) {
  return semantic === 'prose' ? ARTICLE_PROSE_CLASS : ARTICLE_NON_PROSE_CLASS
}

function isStandaloneMediaParagraph(tokens, paragraphIndex) {
  const inline = tokens[paragraphIndex + 1]
  if (inline?.type !== 'inline' || !Array.isArray(inline.children)) return false

  let hasImage = false
  for (const child of inline.children) {
    if (child.type === 'image') {
      hasImage = true
      continue
    }
    if (['softbreak', 'hardbreak'].includes(child.type)) continue
    if (child.type === 'text' && child.content.trim() === '') continue
    return false
  }
  return hasImage
}

export function installArticleParagraphSemantics(markdown) {
  markdown.core.ruler.after('inline', 'article-paragraph-semantics', (state) => {
    let pendingSemantic = null

    for (let index = 0; index < state.tokens.length; index += 1) {
      const token = state.tokens[index]
      if (token.type === 'html_block') {
        const semantic = articleParagraphSemanticFromMarker(token.content)
        if (semantic) {
          pendingSemantic = token.level === 0 ? semantic : null
          token.content = ''
          continue
        }
        pendingSemantic = null
      }

      if (token.type === 'paragraph_open' && token.level === 0) {
        if (isStandaloneMediaParagraph(state.tokens, index)) {
          pendingSemantic = null
          continue
        }
        const semantic = pendingSemantic ?? 'prose'
        token.attrJoin('class', articleParagraphClass(semantic))
        pendingSemantic = null
        continue
      }

      if (
        pendingSemantic &&
        token.level === 0 &&
        token.type !== 'paragraph_close'
      ) {
        pendingSemantic = null
      }
    }
  })
}

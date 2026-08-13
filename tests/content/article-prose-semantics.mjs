import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import {
  ARTICLE_NON_PROSE_CLASS,
  ARTICLE_PROSE_CLASS,
  articleParagraphPolicyErrors,
  articleParagraphMarker,
  articleParagraphSemanticFromMarker,
  installArticleParagraphSemantics,
  resolveImportedParagraphSemantic,
} from '../../scripts/content/lib/article-prose.mjs'

const markdown = new MarkdownIt({ html: true })
markdown.use(installArticleParagraphSemantics)

const rendered = markdown.render(`## Heading

A complete narrative paragraph after a heading.

Another complete narrative paragraph.
${articleParagraphMarker('non-prose')}

Medium armor boss:
${articleParagraphMarker('non-prose')}

https://example.com/guide

- List copy

> Quoted copy

![Media](./media.png)

<div class="tool-card"><p>Component copy</p></div>
`)

assert.match(
  rendered,
  new RegExp(
    `<p class="${ARTICLE_PROSE_CLASS}">A complete narrative paragraph after a heading\\.</p>`,
  ),
)
assert.match(
  rendered,
  new RegExp(
    `<p class="${ARTICLE_PROSE_CLASS}">Another complete narrative paragraph\\.</p>`,
  ),
)
assert.match(
  rendered,
  new RegExp(`<p class="${ARTICLE_NON_PROSE_CLASS}">Medium armor boss:</p>`),
)
assert.match(
  rendered,
  new RegExp(
    `<p class="${ARTICLE_NON_PROSE_CLASS}">https://example.com/guide</p>`,
  ),
)
assert.doesNotMatch(rendered, /<li><p class="article-prose">/)
assert.doesNotMatch(rendered, /<blockquote>\s*<p class="article-prose">/)
assert.doesNotMatch(rendered, /<p class="article-prose"><img/)
assert.match(rendered, /<p><img src="\.\/media\.png" alt="Media"><\/p>/)
assert.match(rendered, /<div class="tool-card"><p>Component copy<\/p><\/div>/)
assert.doesNotMatch(rendered, /article-paragraph:/)

const noSemanticLeak = markdown.render(`${articleParagraphMarker('non-prose')}

<div class="tool-card">Component copy</div>

Narrative paragraph.
`)
assert.match(
  noSemanticLeak,
  new RegExp(`<p class="${ARTICLE_PROSE_CLASS}">Narrative paragraph\\.</p>`),
)

const noNestedSemanticLeak = markdown.render(`> ${articleParagraphMarker('non-prose')}
>
> Quoted copy

Narrative after quote.
`)
assert.match(
  noNestedSemanticLeak,
  new RegExp(`<p class="${ARTICLE_PROSE_CLASS}">Narrative after quote\\.</p>`),
)

assert.equal(articleParagraphSemanticFromMarker(articleParagraphMarker('prose')), 'prose')
assert.equal(
  articleParagraphSemanticFromMarker(articleParagraphMarker('non-prose')),
  'non-prose',
)
assert.equal(articleParagraphSemanticFromMarker('<!-- source-body:1:x:paragraph -->'), null)

const policy = {
  schemaVersion: 1,
  defaultSemantic: 'prose',
  sources: {
    'src-example': {
      nonProseStyleIds: ['label-style'],
      overrides: {
        'src-example:paragraph:label': 'non-prose',
      },
    },
  },
}

assert.deepEqual(articleParagraphPolicyErrors(policy), [])
assert.match(
  articleParagraphPolicyErrors({
    schemaVersion: 1,
    defaultSemantic: 'prose',
    sources: {
      'src-example': {
        nonProseStyleIds: [],
        overrides: { 'src-other:paragraph:x': 'non-prose' },
      },
    },
  }).join('\n'),
  /override must target a paragraph/,
)

const defaultElement = {
  sourceAssetId: 'src-example',
  sourceElementId: 'src-example:paragraph:body',
  elementType: 'paragraph',
  paragraphStyleId: '',
}

assert.equal(resolveImportedParagraphSemantic(defaultElement, policy), 'prose')
assert.equal(
  resolveImportedParagraphSemantic(
    { ...defaultElement, text: 'Short!' },
    policy,
  ),
  'prose',
)
assert.equal(
  resolveImportedParagraphSemantic(
    {
      sourceAssetId: 'src-example',
      sourceElementId: 'src-example:paragraph:styled-label',
      elementType: 'paragraph',
      paragraphStyleId: 'label-style',
    },
    policy,
  ),
  'non-prose',
)
assert.equal(
  resolveImportedParagraphSemantic(
    {
      sourceAssetId: 'src-example',
      sourceElementId: 'src-example:paragraph:label',
      elementType: 'paragraph',
      paragraphStyleId: '',
    },
    policy,
  ),
  'non-prose',
)
assert.equal(
  resolveImportedParagraphSemantic(
    {
      sourceAssetId: 'src-example',
      sourceElementId: 'src-example:heading:title',
      elementType: 'heading',
      paragraphStyleId: 'label-style',
    },
    policy,
  ),
  null,
)

assert.throws(() => articleParagraphMarker('guessed'), /must be one of/)
assert.throws(
  () =>
    resolveImportedParagraphSemantic(
      {
        sourceAssetId: 'src-example',
        sourceElementId: 'src-example:paragraph:bad',
        elementType: 'paragraph',
      },
      { defaultSemantic: 'guessed' },
    ),
  /defaultSemantic must be one of/,
)

console.log('Article prose semantic contract checks passed.')

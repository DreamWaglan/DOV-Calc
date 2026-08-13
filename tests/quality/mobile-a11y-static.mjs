import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const docsRoot = path.join(root, 'docs')
const reportPath = path.join(root, 'content', 'reports', 'mobile-a11y-static.json')

const files = {
  theme: path.join(docsRoot, '.vitepress', 'theme', 'styles.css'),
  config: path.join(docsRoot, '.vitepress', 'config.mts'),
  layout: path.join(docsRoot, '.vitepress', 'theme', 'WikiLayout.vue'),
  damage: path.join(docsRoot, '.vitepress', 'components', 'DamageCalculator.vue'),
  equipment: path.join(docsRoot, '.vitepress', 'components', 'EquipmentLookup.vue'),
  responsiveMedia: path.join(
    docsRoot,
    '.vitepress',
    'theme',
    'components',
    'ResponsiveMedia.vue',
  ),
  originalImageViewer: path.join(
    docsRoot,
    '.vitepress',
    'theme',
    'components',
    'OriginalImageViewer.vue',
  ),
}

const [theme, config, layout, damage, equipment, responsiveMedia, originalImageViewer, markdownPaths] = await Promise.all([
  readFile(files.theme, 'utf8'),
  readFile(files.config, 'utf8'),
  readFile(files.layout, 'utf8'),
  readFile(files.damage, 'utf8'),
  readFile(files.equipment, 'utf8'),
  readFile(files.responsiveMedia, 'utf8'),
  readFile(files.originalImageViewer, 'utf8'),
  collectMarkdownFiles(docsRoot),
])

const markdownEntries = await Promise.all(
  markdownPaths.map(async (file) => ({
    file: path.relative(root, file).replaceAll('\\', '/'),
    body: await readFile(file, 'utf8'),
  })),
)

const emptyAltImages = markdownEntries.flatMap(({ file, body }) =>
  [...body.matchAll(/!\[\s*\]\([^)]+\)/g)].map((match) => ({
    file,
    fragment: match[0],
  })),
)

const rawImagesWithoutAlt = markdownEntries.flatMap(({ file, body }) =>
  [...body.matchAll(/<img\b(?![^>]*\balt\s*=)[^>]*>/gi)].map((match) => ({
    file,
    fragment: match[0],
  })),
)

const markdownTableCount = markdownEntries.reduce(
  (count, { body }) => count + (body.match(/^\|.*\|$/gm)?.length ?? 0),
  0,
)
const markdownImageCount = markdownEntries.reduce(
  (count, { body }) => count + (body.match(/!\[[^\]]*\]\([^)]+\)/g)?.length ?? 0),
  0,
)

const checks = [
  check('global-box-sizing', theme.includes('*::before') && theme.includes('box-sizing: border-box')),
  check(
    'article-width-containment',
    theme.includes('.VPDoc .content') &&
      theme.includes('min-width: 0') &&
      theme.includes('overflow-wrap: anywhere'),
  ),
  check(
    'article-prose-first-line-indent',
    config.includes('installArticleParagraphSemantics') &&
      theme.includes('.vp-doc p.article-prose') &&
      theme.includes('text-indent: 2em') &&
      !theme.includes('.vp-doc p {') &&
      markdownEntries.some(({ body }) =>
        body.includes('<!-- article-paragraph:non-prose -->'),
      ),
  ),
  check(
    'tables-scroll-locally',
    theme.includes('.vp-doc table') &&
      theme.includes('max-width: 100%') &&
      theme.includes('overflow-x: auto'),
  ),
  check(
    'tables-keyboard-focusable',
    layout.includes("document.querySelectorAll<HTMLTableElement>('.vp-doc table')") &&
      layout.includes('focusTarget.tabIndex = 0') &&
      layout.includes("event.key === 'ArrowRight'") &&
      layout.includes('focusTarget.scrollTo') &&
      layout.includes("table.setAttribute('aria-label'"),
  ),
  check(
    'visible-keyboard-focus',
    theme.includes(':focus-visible') &&
      damage.includes(':focus-visible') &&
      equipment.includes(':focus-visible'),
  ),
  check(
    'touch-targets-44px',
    theme.includes('min-height: 44px') &&
      countMatches(damage, /min-height:\s*44px/g) >= 3 &&
      countMatches(equipment, /min-height:\s*44px/g) >= 2,
  ),
  check(
    'reduced-motion',
    theme.includes('@media (prefers-reduced-motion: reduce)') &&
      theme.includes('transition-duration: 0.01ms'),
  ),
  check(
    'narrow-grid-containment',
    theme.includes('minmax(min(100%, 240px), 1fr)') &&
      damage.includes('minmax(min(100%, 140px), 1fr)') &&
      equipment.includes('minmax(min(100%, 280px), 1fr)'),
  ),
  check(
    'responsive-360px-rules',
    theme.includes('@media (max-width: 420px)') &&
      damage.includes('@media (max-width: 480px)') &&
      equipment.includes('@media (max-width: 420px)'),
  ),
  check(
    'responsive-images',
    theme.includes('.vp-doc img') &&
      theme.includes('height: auto') &&
      theme.includes('.responsive-media') &&
      equipment.includes('width="72"') &&
      equipment.includes('height="120"') &&
      equipment.includes('loading="lazy"') &&
      equipment.includes('decoding="async"'),
  ),
  check(
    'responsive-media-contract',
    responsiveMedia.includes('<picture>') &&
      responsiveMedia.includes(':srcset="source.srcset"') &&
      responsiveMedia.includes('sizes="(max-width: 768px)') &&
      responsiveMedia.includes(':alt="alt"') &&
      responsiveMedia.includes(':width="width"') &&
      responsiveMedia.includes(':height="height"') &&
      responsiveMedia.includes('loading="lazy"') &&
      responsiveMedia.includes('decoding="async"') &&
      responsiveMedia.includes("displayMode?: 'viewer' | 'index' | 'table-cell'") &&
      responsiveMedia.includes(':class="`responsive-media--${resolvedMode}`"') &&
      responsiveMedia.includes('class="responsive-media__trigger"') &&
      responsiveMedia.includes('v-if="isIndexCard"') &&
      responsiveMedia.includes('<OriginalImageViewer') &&
      theme.includes('.responsive-media__trigger img') &&
      theme.includes('.responsive-media--table-cell .responsive-media__trigger') &&
      theme.includes('min-width: 44px') &&
      theme.includes('min-height: 44px') &&
      theme.includes('.docx-table-scroll') &&
      theme.includes('overflow-x: auto') &&
      theme.includes('width: auto') &&
      theme.includes('max-width: 100%'),
  ),
  check(
    'public-governance-ui-hidden',
    !layout.includes('SourceList') &&
      !responsiveMedia.includes('<figcaption>') &&
      !responsiveMedia.includes('download') &&
      !originalImageViewer.includes('sourceLabel') &&
      !originalImageViewer.includes('authorization') &&
      !originalImageViewer.includes('image-viewer__download') &&
      !originalImageViewer.includes('image-viewer__info'),
  ),
  check(
    'original-image-viewer-contract',
    originalImageViewer.includes('<Teleport v-if="mounted && open" to="body">') &&
      originalImageViewer.includes('role="dialog"') &&
      originalImageViewer.includes('aria-modal="true"') &&
      originalImageViewer.includes("event.key === 'Escape'") &&
      originalImageViewer.includes("event.key === '+' || event.key === '='") &&
      originalImageViewer.includes("event.key === '0'") &&
      originalImageViewer.includes("event.key.toLowerCase() === 'f'") &&
      originalImageViewer.includes('closeButton.value?.focus()') &&
      originalImageViewer.includes('previousFocus?.focus()') &&
      originalImageViewer.includes('role="region"') &&
      originalImageViewer.includes('tabindex="0"') &&
      originalImageViewer.includes('方向键或拖动浏览') &&
      originalImageViewer.includes('@pointermove="onPointerMove"') &&
      originalImageViewer.includes('@dblclick="onDoubleClick"') &&
      originalImageViewer.includes('@wheel="onWheel"') &&
      originalImageViewer.includes('activePointers') &&
      originalImageViewer.includes('beginPinch') &&
      originalImageViewer.includes('handleTouchTap') &&
      !originalImageViewer.includes('event.ctrlKey') &&
      theme.includes('.image-viewer__dialog') &&
      theme.includes('html.image-viewer-open') &&
      theme.includes('env(safe-area-inset-top)') &&
      theme.includes('env(safe-area-inset-bottom)') &&
      theme.includes('height: 100dvh') &&
      theme.includes('touch-action: none') &&
      theme.includes('min-width: 44px') &&
      theme.includes('min-height: 44px'),
  ),
  check(
    'damage-calculator-name-and-live-result',
    damage.includes('aria-labelledby="damage-calculator-title"') &&
      damage.includes('id="damage-calculator-title"') &&
      damage.includes('<output aria-label="单次期望伤害">') &&
      damage.includes('aria-live="polite"'),
  ),
  check(
    'equipment-filter-semantics',
    equipment.includes('role="search"') &&
      equipment.includes('aria-label="装备筛选"') &&
      equipment.includes(':aria-pressed="selectedCategory === category"') &&
      equipment.includes('aria-atomic="true"'),
  ),
  check('markdown-image-alt-text', emptyAltImages.length === 0, emptyAltImages),
  check('raw-image-alt-text', rawImagesWithoutAlt.length === 0, rawImagesWithoutAlt),
]

const failures = checks.filter((item) => !item.passed)
const report = {
  schemaVersion: '1.0.0',
  gate: 'mobile-a11y-static',
  scope: {
    viewportTargetCssPixels: 360,
    zoomTargetPercent: 200,
    touchTargetCssPixels: 44,
    dynamicChecks: '浏览器、axe 与 Lighthouse 由阶段 5 动态门禁负责。',
  },
  summary: {
    checks: checks.length,
    passed: checks.length - failures.length,
    failures: failures.length,
    markdownFiles: markdownEntries.length,
    markdownTableRows: markdownTableCount,
    markdownImages: markdownImageCount,
  },
  checks,
  failures,
}

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

if (failures.length > 0) {
  console.error(`移动端与可访问性静态门禁失败：${failures.length} 项`)
  for (const failure of failures) {
    console.error(`- ${failure.id}`)
  }
  process.exitCode = 1
} else {
  console.log(
    `移动端与可访问性静态门禁通过：${checks.length}/${checks.length}，` +
      `${markdownEntries.length} 个公开 Markdown 文件。`,
  )
}

function check(id, passed, details = []) {
  return {
    id,
    passed: Boolean(passed),
    ...(details.length > 0 ? { details } : {}),
  }
}

function countMatches(value, pattern) {
  return value.match(pattern)?.length ?? 0
}

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === '.vitepress') {
          return []
        }
        return collectMarkdownFiles(target)
      }
      return entry.isFile() && entry.name.endsWith('.md') ? [target] : []
    }),
  )
  return nested.flat().sort()
}

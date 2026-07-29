import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const docsRoot = path.join(root, 'docs')
const reportPath = path.join(root, 'content', 'reports', 'mobile-a11y-static.json')

const files = {
  theme: path.join(docsRoot, '.vitepress', 'theme', 'styles.css'),
  layout: path.join(docsRoot, '.vitepress', 'theme', 'WikiLayout.vue'),
  damage: path.join(docsRoot, '.vitepress', 'components', 'DamageCalculator.vue'),
  equipment: path.join(docsRoot, '.vitepress', 'components', 'EquipmentLookup.vue'),
}

const [theme, layout, damage, equipment, markdownPaths] = await Promise.all([
  readFile(files.theme, 'utf8'),
  readFile(files.layout, 'utf8'),
  readFile(files.damage, 'utf8'),
  readFile(files.equipment, 'utf8'),
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
    'tables-scroll-locally',
    theme.includes('.vp-doc table') &&
      theme.includes('max-width: 100%') &&
      theme.includes('overflow-x: auto'),
  ),
  check(
    'tables-keyboard-focusable',
    layout.includes("document.querySelectorAll<HTMLTableElement>('.vp-doc table')") &&
      layout.includes('table.tabIndex = 0') &&
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
      equipment.includes('width="72"') &&
      equipment.includes('height="120"') &&
      equipment.includes('loading="lazy"') &&
      equipment.includes('decoding="async"'),
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

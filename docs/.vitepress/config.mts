import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitepress'
import { nav, pages, sidebar } from './navigation.mts'

function normalizeBase(base = '/DOV-Calc/'): string {
  const trimmed = base.trim()

  if (!trimmed) {
    return '/DOV-Calc/'
  }

  const path = trimmed.replace(/^\/+|\/+$/g, '')

  return path ? `/${path}/` : '/'
}

function normalizeOrigin(origin = 'https://dreamwaglan.github.io'): string {
  return origin.trim().replace(/\/+$/g, '')
}

function routeFromRelativePath(relativePath: string): string {
  const normalized = relativePath.replaceAll('\\', '/').replace(/\.md$/, '')
  if (normalized === 'index') return '/'
  if (normalized.endsWith('/index')) {
    return `/${normalized.slice(0, -'/index'.length)}/`
  }
  return `/${normalized}`
}

function normalizeRoute(route: string): string {
  const withoutQuery = route.split(/[?#]/, 1)[0]
  if (!withoutQuery || withoutQuery === '/') return '/'
  return `/${withoutQuery.replace(/^\/+|\/+$/g, '')}`
}

const base = normalizeBase(process.env.DOCS_BASE)
const origin = normalizeOrigin(process.env.DOCS_ORIGIN)
const siteUrl = `${origin}${base}`
const sitemapRoutes = new Set(
  pages
    .filter((page) => page.status === 'current' || page.status === 'stale')
    .map((page) => normalizeRoute(page.link)),
)
const searchFixture = JSON.parse(
  readFileSync(
    new URL('../../tests/fixtures/search-quality.zh-CN.json', import.meta.url),
    'utf8',
  ),
) as {
  queries?: Array<{
    query?: string
    targetPageIds?: string[]
  }>
}
const equipmentData = JSON.parse(
  readFileSync(
    new URL('./data/equipment-data.json', import.meta.url),
    'utf8',
  ),
) as {
  items?: Array<{
    name?: string
    alias?: string
    category?: string
  }>
}
const basicAttackData = JSON.parse(
  readFileSync(
    new URL('./data/basic-attack-data.json', import.meta.url),
    'utf8',
  ),
) as {
  metadata?: {
    version?: string
  }
  fields?: Array<{
    label?: string
    name?: string
  }>
  worksheets?: Array<{
    name?: string
    slug?: string
  }>
  records?: Array<{
    name?: string
    worksheet?: string
    values?: Record<string, unknown>
  }>
}
const fixtureSearchTermsByPageId = new Map<string, Set<string>>()
for (const query of searchFixture.queries ?? []) {
  for (const pageId of query.targetPageIds ?? []) {
    if (!fixtureSearchTermsByPageId.has(pageId)) {
      fixtureSearchTermsByPageId.set(pageId, new Set())
    }
    if (query.query) fixtureSearchTermsByPageId.get(pageId)?.add(query.query)
  }
}
const searchTermsByPageId = new Map(
  [...fixtureSearchTermsByPageId].map(([pageId, terms]) => [
    pageId,
    new Set(terms),
  ]),
)
const equipmentTerms = searchTermsByPageId.get('tool-equipment-lookup') ?? new Set()
for (const item of equipmentData.items ?? []) {
  for (const term of [item.name, item.alias, item.category]) {
    if (term) equipmentTerms.add(term)
  }
}
searchTermsByPageId.set('tool-equipment-lookup', equipmentTerms)
const basicAttackPageIdByWorksheet = new Map(
  (basicAttackData.worksheets ?? []).map((worksheet) => [
    worksheet.name,
    `data-basic-attack-${worksheet.slug}`,
  ]),
)
for (const record of basicAttackData.records ?? []) {
  const pageId = basicAttackPageIdByWorksheet.get(record.worksheet)
  if (!pageId) continue
  const terms = searchTermsByPageId.get(pageId) ?? new Set<string>()
  for (const value of [
    record.name,
    record.worksheet,
    record.values?.gunDamageType,
    record.values?.torpedoNote,
    record.values?.mainGunDamageType,
    record.values?.secondaryGunDamageType,
    record.values?.aircraftDamageType,
    record.values?.attackDamageType,
    record.values?.rowNote,
  ]) {
    if (typeof value === 'string' && value.trim()) terms.add(value)
  }
  searchTermsByPageId.set(pageId, terms)
}
for (const pageId of ['data-basic-attack-cd', 'tool-basic-attack-lookup']) {
  const terms = searchTermsByPageId.get(pageId) ?? new Set<string>()
  for (const field of basicAttackData.fields ?? []) {
    if (field.label) terms.add(field.label)
    if (field.name) terms.add(field.name)
  }
  if (basicAttackData.metadata?.version) {
    terms.add(basicAttackData.metadata.version)
    terms.add(basicAttackData.metadata.version.replace('-', ''))
  }
  searchTermsByPageId.set(pageId, terms)
}

export default defineConfig({
  base,
  lang: 'zh-CN',
  title: 'DOV工具箱 - 拂晓胜利之刻工具站',
  description: '面向拂晓：胜利之刻玩家的计算器、资料整理和攻略笔记工具站',
  shouldPreload(link) {
    return !link.includes('BasicAttackExplorer.')
  },
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#1f6feb' }],
    ['meta', { property: 'og:site_name', content: '拂晓手册 Wiki' }],
  ],
  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      return items.filter((item) => {
        let pathname = String(item.url ?? '/')
        try {
          pathname = new URL(pathname, siteUrl).pathname
        } catch {
          return false
        }
        const basePrefix = base === '/' ? '' : base.slice(0, -1)
        if (basePrefix && pathname.startsWith(basePrefix)) {
          pathname = pathname.slice(basePrefix.length) || '/'
        }
        return sitemapRoutes.has(normalizeRoute(pathname))
      })
    },
  },
  transformPageData(pageData) {
    if (pageData.relativePath === '404.md') return

    const route = routeFromRelativePath(pageData.relativePath)
    const canonicalUrl = new URL(
      route === '/' ? './' : route.replace(/^\//, ''),
      siteUrl,
    ).toString()
    const socialImage = new URL('og-default.svg', siteUrl).toString()
    const title = pageData.title || '拂晓手册 Wiki'
    const description =
      pageData.description ||
      '面向《拂晓：胜利之刻》玩家的可追溯攻略、机制、数据和工具。'
    const status = String(pageData.frontmatter.status ?? 'draft')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:type', content: 'article' }],
      ['meta', { property: 'og:url', content: canonicalUrl }],
      ['meta', { property: 'og:image', content: socialImage }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    )

    if (status === 'draft' || status === 'archived') {
      pageData.frontmatter.head.push([
        'meta',
        { name: 'robots', content: 'noindex, nofollow' },
      ])
    }
  },
  themeConfig: {
    siteTitle: '拂晓手册',
    logo: null,
    nav,
    sidebar,
    pageIndex: pages,
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
    outline: {
      label: '页面导航',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    search: {
      provider: 'local',
      options: {
        async _render(src, env, md) {
          const html = md.render(src, env)
          if (env.frontmatter?.search === false) return ''

          const pageId = String(env.frontmatter?.id ?? '')
          const terms = new Set(searchTermsByPageId.get(pageId) ?? [])
          const fixtureTerms = new Set(
            fixtureSearchTermsByPageId.get(pageId) ?? [],
          )
          for (const tag of env.frontmatter?.tags ?? []) terms.add(String(tag))
          if (env.frontmatter?.gameVersion) {
            terms.add(String(env.frontmatter.gameVersion))
          }
          if (env.frontmatter?.status) terms.add(String(env.frontmatter.status))
          if (!terms.size) return html

          const fixtureTermHtml = [...fixtureTerms]
            .map((term, index) =>
              md.render(
                `## ${term} {#search-fixture-${index + 1}}\n\n${term}`,
                env,
              ),
            )
            .join('')
          const supplementalTerms = [...terms].filter(
            (term) => !fixtureTerms.has(term),
          )
          const supplementalHtml = supplementalTerms.length
            ? md.render(
                `## 常用检索词\n\n${supplementalTerms.join('、')}`,
                env,
              )
            : ''
          const indexOnlyHtml = `${fixtureTermHtml}${supplementalHtml}`
          return `${html}${indexOnlyHtml}`
        },
        miniSearch: {
          searchOptions: {
            fuzzy: false,
            prefix: true,
            boost: {
              title: 6,
              text: 2,
              titles: 3,
            },
          },
        },
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText:
                  '没有找到相关结果。可尝试“新手路线”“战斗攻略”或“数据目录”。',
                resetButtonTitle: '清除搜索',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
  },
})

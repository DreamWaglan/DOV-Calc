import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'
import { parse as parseYaml } from 'yaml'

export type PageSection =
  | 'home'
  | 'start'
  | 'progression'
  | 'combat'
  | 'mechanics'
  | 'topics'
  | 'data'
  | 'tools'
  | 'about'

export interface PageEntry {
  id: string
  text: string
  description: string
  link: string
  section: PageSection
  order: number
  status: 'draft' | 'current' | 'stale' | 'archived'
  gameVersion: string
  tags: string[]
  related: string[]
}

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)

const sectionLabels: Record<PageSection, string> = {
  home: '首页',
  start: '新手入门',
  progression: '养成与资源',
  combat: '战斗攻略',
  mechanics: '机制',
  topics: '专题',
  data: '数据',
  tools: '工具',
  about: '站务与记录',
}

const sectionOrder: PageSection[] = [
  'home',
  'start',
  'progression',
  'combat',
  'mechanics',
  'topics',
  'data',
  'tools',
  'about',
]

function listMarkdown(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (
      entry.name.startsWith('.') ||
      entry.name === 'public' ||
      entry.name === 'node_modules'
    ) {
      return []
    }

    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) return listMarkdown(absolutePath)
    return entry.isFile() && entry.name.endsWith('.md') ? [absolutePath] : []
  })
}

function parseFrontmatter(source: string, relativePath: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) {
    throw new Error(`${relativePath}: missing YAML frontmatter`)
  }
  return parseYaml(match[1]) as Record<string, unknown>
}

function routeFromPath(relativePath: string) {
  const normalized = relativePath.split(path.sep).join('/')
  const withoutExtension = normalized.replace(/\.md$/, '')
  if (withoutExtension === 'index') return '/'
  if (withoutExtension.endsWith('/index')) {
    return `/${withoutExtension.slice(0, -'/index'.length)}/`
  }
  return `/${withoutExtension}`
}

export const pages: PageEntry[] = listMarkdown(docsRoot)
  .map((absolutePath) => {
    const relativePath = path.relative(docsRoot, absolutePath)
    const frontmatter = parseFrontmatter(
      readFileSync(absolutePath, 'utf8'),
      relativePath,
    )

    return {
      id: String(frontmatter.id ?? ''),
      text: String(frontmatter.title ?? ''),
      description: String(frontmatter.description ?? ''),
      link: routeFromPath(relativePath),
      section: String(frontmatter.section ?? '') as PageSection,
      order: Number(frontmatter.order ?? 9999),
      status: String(frontmatter.status ?? 'draft') as PageEntry['status'],
      gameVersion: String(frontmatter.gameVersion ?? ''),
      tags: Array.isArray(frontmatter.tags)
        ? frontmatter.tags.map((value) => String(value))
        : [],
      related: Array.isArray(frontmatter.related)
        ? frontmatter.related.map((value) => String(value))
        : [],
    }
  })
  .sort(
    (first, second) =>
      sectionOrder.indexOf(first.section) -
        sectionOrder.indexOf(second.section) ||
      first.order - second.order ||
      first.text.localeCompare(second.text, 'zh-CN'),
  )

function firstPage(section: PageSection) {
  return pages.find((page) => page.section === section)
}

export const nav: DefaultTheme.NavItem[] = sectionOrder.flatMap((section) => {
  const page = firstPage(section)
  if (!page) return []
  return [
    {
      text: section === 'home' ? page.text : sectionLabels[section],
      link: page.link,
    },
  ]
})

export const sidebar: DefaultTheme.Sidebar = Object.fromEntries(
  [...new Set(pages.map((page) => page.link.split('/')[1]).filter(Boolean))].map(
    (directory) => {
      const prefix = `/${directory}/`
      const entries = pages.filter(
        (page) => page.link === prefix || page.link.startsWith(prefix),
      )
      const section = entries[0]?.section ?? 'about'
      return [
        prefix,
        [
          {
            text: sectionLabels[section],
            items: entries.map((page) => ({
              text: page.text,
              link: page.link,
            })),
          },
        ],
      ]
    },
  ),
)

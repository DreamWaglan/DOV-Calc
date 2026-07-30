import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const docsRoot = path.join(root, 'docs')
const fixturePath = path.join(root, 'tests', 'fixtures', 'search-quality.zh-CN.json')
const reportPath = path.join(root, 'content', 'reports', 'search-quality.json')
const basicAttackDataPath = path.join(
  docsRoot,
  '.vitepress',
  'data',
  'basic-attack-data.json',
)

const aliasByPageId = {
  'site-home': ['拂晓手册', '拂晓wiki', '手册首页', '工具箱'],
  'start-index': ['新手导航', '萌新路线', '入门路线', '新手攻略'],
  'start-preface': ['阅读说明', '页面状态', '资料说明'],
  'start-game-introduction': [
    '拂晓胜利之刻',
    '拂晓是什么游戏',
    '即时海战',
    '舰灵游戏',
  ],
  'start-first-week': [
    '新人开荒',
    '新手开荒',
    '第一周',
    '开局七天',
    '刚入坑先做什么',
    '第一天怎么玩',
  ],
  'topic-new-player-checklist': ['每日登录清单', '每日任务清单', '下线检查'],
  'progression-index': ['养成规划', '资源规划', '养成路线'],
  'progression-leveling': [
    '练船',
    '练级点',
    '满编低耗',
    '练级与资源投入',
    '练船去哪里',
    '满编还是低耗',
  ],
  'combat-index': ['作战攻略', '战斗导航', '配队攻略'],
  'combat-event-maps': [
    '活动攻略',
    '活动图',
    '活动推图',
    '地图条件',
    '推图卡住怎么办',
  ],
  'combat-pve-team-building': [
    'pve阵容',
    'pve配队',
    '编队职责',
    'pve配队方法',
    '队伍职责',
    '关卡怎么配队',
  ],
  'combat-pvp-arena': [
    'pvp',
    '竞技场',
    '争锋',
    '争锋竞技场',
    '竞技场赛季',
    '争锋竟技场',
  ],
  'combat-encounter': ['遭遇战', '遭遇战攻略', '多队作战'],
  'combat-endless-sea': ['无尽海域', '无限海域', '无尽配队'],
  'mechanics-index': ['游戏机制', '战斗规则', '机制目录'],
  'mechanics-damage-model': ['伤害公式', '伤害构成', '减伤模型'],
  'tool-damage-calculator': ['伤害计算', '算伤'],
  'tool-equipment-lookup': ['装备查询', '查装备', '装备表'],
  'data-index': ['数据集', '数据版本', '结构化数据'],
  'data-basic-attack-cd': [
    '舰灵普攻cd',
    '普攻cd',
    '普攻倍率',
    '攻速数据',
  ],
  'topic-beginner-equipment': [
    '新手装备',
    '毕业装',
    '过渡装',
    '配装',
    '装备怎么配',
  ],
  'topic-pve-selection': [
    'pve选人',
    '舰灵推荐',
    '角色推荐',
    '选船',
    '先养谁',
    '新手怎么选船',
  ],
  'topic-laguz': ['拉古兹', '拉古斯', 'laguz'],
  'about-version-log': ['更新日志', '版本记录', '2026年7月更新'],
  'about-contributing': ['编辑规范', '怎么贡献', 'frontmatter规范'],
  'about-sources': ['版权说明', '来源许可', '资料授权'],
  'site-build-record': ['站点架构', 'vitepress迁移', '搭建记录'],
}

const canonicalReplacements = [
  ['拂曉', '拂晓'],
  ['勝利之刻', '胜利之刻'],
  ['無盡', '无尽'],
  ['海域', '海域'],
  ['競技', '竞技'],
  ['竟技', '竞技'],
  ['遭遇站', '遭遇战'],
  ['无限海域', '无尽海域'],
  ['拉古斯', '拉古兹'],
  ['冷却时间', 'cd'],
  ['冷却', 'cd'],
  ['萌新', '新手'],
  ['开荒', '第一周'],
  ['选船', '选人'],
]

const statusWeight = {
  current: 4,
  draft: 2,
  stale: 1,
  archived: 0,
}

const basicAttackData = JSON.parse(await readFile(basicAttackDataPath, 'utf8'))
const basicAttackPageIdByWorksheet = new Map(
  basicAttackData.worksheets.map((worksheet) => [
    worksheet.name,
    `data-basic-attack-${worksheet.slug}`,
  ]),
)
const dynamicAliasesByPageId = new Map()
for (const record of basicAttackData.records) {
  const pageId = basicAttackPageIdByWorksheet.get(record.values?.worksheet)
  if (!pageId) continue
  const aliases = dynamicAliasesByPageId.get(pageId) ?? new Set()
  aliases.add(record.name)
  dynamicAliasesByPageId.set(pageId, aliases)
}

function canonicalize(value) {
  let normalized = String(value ?? '').normalize('NFKC').toLowerCase()
  for (const [from, to] of canonicalReplacements) {
    normalized = normalized.split(from).join(to)
  }
  return normalized.replace(/[^\p{Script=Han}\p{Letter}\p{Number}]+/gu, '')
}

function tokenize(value) {
  const normalized = String(value ?? '').normalize('NFKC').toLowerCase()
  const groups = normalized.match(/[\p{Script=Han}]+|[a-z0-9]+/gu) ?? []
  const tokens = new Set()

  for (const group of groups) {
    const canonical = canonicalize(group)
    if (!canonical) continue
    tokens.add(canonical)
    if (/^\p{Script=Han}+$/u.test(canonical) && canonical.length > 1) {
      for (let index = 0; index < canonical.length - 1; index += 1) {
        tokens.add(canonical.slice(index, index + 2))
      }
    }
  }

  return [...tokens]
}

function scalar(frontmatter, key, fallback = '') {
  const match = frontmatter.match(
    new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|(.+?))\\s*$`, 'm'),
  )
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? fallback).trim()
}

function inlineList(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*?)\\]\\s*$`, 'm'))
  if (!match) return []
  return match[1]
    .split(',')
    .map((value) => value.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

function stripMarkdown(value) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^---[\s\S]*?---\s*/u, '')
    .replace(/[#>*_|~-]+/g, ' ')
}

function routeFromRelative(relativePath) {
  const normalized = relativePath.split(path.sep).join('/').replace(/\.md$/, '')
  if (normalized === 'index') return '/'
  if (normalized.endsWith('/index')) return `/${normalized.slice(0, -6)}/`
  return `/${normalized}`
}

async function listMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'public') continue
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listMarkdown(absolutePath)))
    if (entry.isFile() && entry.name.endsWith('.md')) files.push(absolutePath)
  }
  return files.sort((left, right) => left.localeCompare(right, 'zh-CN'))
}

async function buildIndex() {
  const files = await listMarkdown(docsRoot)
  return Promise.all(
    files.map(async (absolutePath) => {
      const source = await readFile(absolutePath, 'utf8')
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
      if (!match) throw new Error(`${absolutePath}: 缺少 Frontmatter`)
      const relativePath = path.relative(docsRoot, absolutePath)
      const frontmatter = match[1]
      const body = source.slice(match[0].length)
      const title = scalar(frontmatter, 'title')
      const id = scalar(frontmatter, 'id')
      const description = scalar(frontmatter, 'description')
      const status = scalar(frontmatter, 'status', 'draft')
      const tags = inlineList(frontmatter, 'tags')
      const headings = [...body.matchAll(/^#{1,6}\s+(.+)$/gm)].map((item) =>
        item[1].replace(/\s+\{#[^}]+}\s*$/, ''),
      )
      const aliases = [
        ...(aliasByPageId[id] ?? []),
        ...(dynamicAliasesByPageId.get(id) ?? []),
      ]
      const entities = [title, ...tags, ...aliases]

      return {
        id,
        route: routeFromRelative(relativePath),
        file: `docs/${relativePath.split(path.sep).join('/')}`,
        title,
        description,
        status,
        tags,
        headings,
        aliases,
        entities,
        normalized: {
          title: canonicalize(title),
          description: canonicalize(description),
          tags: tags.map(canonicalize),
          headings: headings.map(canonicalize),
          aliases: aliases.map(canonicalize),
          entities: entities.map(canonicalize),
          body: canonicalize(stripMarkdown(body)),
        },
      }
    }),
  )
}

function fieldIncludes(fields, query) {
  return fields.some((field) => field.includes(query))
}

function scorePage(page, query) {
  const normalizedQuery = canonicalize(query)
  const queryTokens = tokenize(query)
  const fields = page.normalized
  let score = statusWeight[page.status] ?? 0
  const reasons = []
  const matchedTokens = new Set()

  if (fields.title === normalizedQuery) {
    score += 1_200
    reasons.push('exact-title')
  }
  if (fields.aliases.includes(normalizedQuery)) {
    score += 1_600
    reasons.push('exact-alias')
  }
  if (fields.tags.includes(normalizedQuery)) {
    score += 700
    reasons.push('exact-tag')
  }
  if (
    normalizedQuery.length >= 2 &&
    fields.title.includes(normalizedQuery) &&
    fields.title !== normalizedQuery
  ) {
    score += 520
    reasons.push('title-contains')
  }
  if (
    normalizedQuery.length >= 2 &&
    fieldIncludes(fields.aliases, normalizedQuery) &&
    !fields.aliases.includes(normalizedQuery)
  ) {
    score += 420
    reasons.push('alias-contains')
  }
  if (
    normalizedQuery.length >= 2 &&
    fieldIncludes(fields.headings, normalizedQuery)
  ) {
    score += 260
    reasons.push('heading-contains')
  }
  if (
    normalizedQuery.length >= 2 &&
    fields.description.includes(normalizedQuery)
  ) {
    score += 180
    reasons.push('description-contains')
  }
  if (normalizedQuery.length >= 2 && fields.body.includes(normalizedQuery)) {
    score += 100
    reasons.push('body-contains')
  }

  for (const token of queryTokens) {
    if (token.length < 2) continue
    if (fields.title.includes(token)) {
      score += 32
      matchedTokens.add(token)
    }
    if (fieldIncludes(fields.aliases, token)) {
      score += 26
      matchedTokens.add(token)
    }
    if (fields.tags.some((tag) => tag.includes(token))) {
      score += 20
      matchedTokens.add(token)
    }
    if (fieldIncludes(fields.headings, token)) {
      score += 12
      matchedTokens.add(token)
    }
    if (fields.description.includes(token)) {
      score += 8
      matchedTokens.add(token)
    }
    if (fields.body.includes(token)) {
      score += 3
      matchedTokens.add(token)
    }
  }

  return {
    score,
    reasons,
    matchedTokenCount: matchedTokens.size,
    queryTokenCount: queryTokens.filter((token) => token.length >= 2).length,
  }
}

function rank(index, query, minimumScore = 25) {
  return index
    .map((page) => ({ page, ...scorePage(page, query) }))
    .filter(
      (entry) =>
        entry.score >= minimumScore &&
        (entry.reasons.length > 0 || entry.matchedTokenCount >= 2),
    )
    .sort(
      (left, right) =>
        right.score - left.score ||
        (statusWeight[right.page.status] ?? 0) -
          (statusWeight[left.page.status] ?? 0) ||
        left.page.title.localeCompare(right.page.title, 'zh-CN'),
    )
}

function suggestions(index, query, limit = 3) {
  const relaxed = rank(index, query, 1)
  const defaults = ['start-index', 'combat-index', 'data-index', 'tools-index']
  const suggested = [
    ...relaxed.map((entry) => entry.page),
    ...defaults.map((id) => index.find((page) => page.id === id)).filter(Boolean),
  ]
  return [...new Map(suggested.map((page) => [page.id, page])).values()]
    .slice(0, limit)
    .map((page) => ({
      id: page.id,
      title: page.title,
      route: page.route,
    }))
}

function percentage(numerator, denominator) {
  return denominator === 0
    ? 0
    : Number(((numerator / denominator) * 100).toFixed(2))
}

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'))
const index = await buildIndex()
const pageById = new Map(index.map((page) => [page.id, page]))
const failures = []
const misses = []

if (fixture.queries.length < 50) {
  failures.push(`查询样本不足 50 条：${fixture.queries.length}`)
}
if (
  !fixture.fixtureVersion ||
  !fixture.generatedAt ||
  !fixture.reviewer ||
  !/^(WORKTREE|[0-9a-f]{7,40})$/i.test(fixture.commitSha ?? '')
) {
  failures.push('冻结元数据必须包含 fixtureVersion、generatedAt、reviewer 和 commitSha')
}

const queryIds = fixture.queries.map((query) => query.id)
if (new Set(queryIds).size !== queryIds.length) {
  failures.push('查询样本 ID 不唯一')
}

const requiredSplitTargets = [
  'start-new-account',
  'progression-leveling-locations',
  'combat-pve-ship-roles',
  'progression-leveling-strategy',
  'start-daily-and-events',
  'combat-pvp-fundamentals',
  'combat-pvp-rules-and-fleet',
  'combat-pvp-reference-teams',
  'combat-encounter-preparation',
  'combat-encounter-practice',
  'combat-encounter-appendix',
  'combat-endless-sea-basics',
  'combat-endless-sea-mechanics',
  'combat-endless-sea-team-building',
  'mechanics-damage-formula-overview',
  'mechanics-attack-power',
  'mechanics-defense-power',
  'mechanics-damage-bonuses',
  'mechanics-hit-critical',
  'topic-laguz-guide',
]
for (const pageId of requiredSplitTargets) {
  if (
    !fixture.queries.some((query) => query.targetPageIds.includes(pageId))
  ) {
    failures.push(`拆分页缺少搜索回归样本：${pageId}`)
  }
}

const requiredQueryClasses = [
  'formal-title',
  'abbreviation',
  'alias',
  'common-typo',
  'mechanic-term',
  'version-term',
]
for (const queryClass of requiredQueryClasses) {
  if (!fixture.queries.some((query) => query.queryClass === queryClass)) {
    failures.push(`查询样本缺少分类：${queryClass}`)
  }
}

for (const query of fixture.queries) {
  if (!query.sourceRef || !query.sourceBucket || !query.queryClass) {
    failures.push(`${query.id}: 缺少来源或查询分类元数据`)
  }
  for (const targetId of query.targetPageIds) {
    if (!pageById.has(targetId)) {
      failures.push(`${query.id}: 目标页面不存在：${targetId}`)
    }
  }
}

const queryResults = fixture.queries.map((query) => {
  const ranked = rank(index, query.query)
  const topFive = ranked.slice(0, 5)
  const targetRanks = query.targetPageIds
    .map((targetId) => ranked.findIndex((item) => item.page.id === targetId) + 1)
    .filter((rankValue) => rankValue > 0)
  const bestTargetRank = targetRanks.length ? Math.min(...targetRanks) : null
  const topFivePassed = bestTargetRank !== null && bestTargetRank <= 5
  const topOnePassed = !query.mustBeTop1 || bestTargetRank === 1

  if (!topFivePassed) {
    misses.push(`${query.id}: “${query.query}” 未在 Top 5 命中目标页面`)
  }
  if (!topOnePassed) {
    failures.push(
      `${query.id}: “${query.query}” 要求 Top 1，实际名次为 ${bestTargetRank ?? '未命中'}`,
    )
  }

  return {
    id: query.id,
    query: query.query,
    sourceBucket: query.sourceBucket,
    queryClass: query.queryClass,
    targetPageIds: query.targetPageIds,
    mustBeTop1: Boolean(query.mustBeTop1),
    bestTargetRank,
    topFivePassed,
    topOnePassed,
    topFive: topFive.map((item, indexValue) => ({
      rank: indexValue + 1,
      id: item.page.id,
      title: item.page.title,
      route: item.page.route,
      status: item.page.status,
      score: item.score,
      reasons: item.reasons,
    })),
  }
})

const noResultChecks = fixture.noResultQueries.map((query) => {
  const results = rank(index, query.query)
  const proposed = suggestions(index, query.query)
  const passed = results.length === 0 && proposed.length > 0
  if (!passed) {
    failures.push(
      `${query.id}: 无结果查询应返回 0 个直接结果和至少 1 个章节建议，实际为 ${results.length}/${proposed.length}`,
    )
  }
  return {
    id: query.id,
    query: query.query,
    directResultCount: results.length,
    suggestions: proposed,
    passed,
  }
})

const topFivePassCount = queryResults.filter((result) => result.topFivePassed).length
const topOneCandidates = queryResults.filter((result) => result.mustBeTop1)
const topOnePassCount = topOneCandidates.filter(
  (result) => result.topOnePassed,
).length
const topFiveRate = percentage(topFivePassCount, queryResults.length)
const topOneRate = percentage(topOnePassCount, topOneCandidates.length)

if (topFiveRate < fixture.thresholds.topFiveRatePercent) {
  failures.push(
    `Top 5 命中率 ${topFiveRate}% 低于阈值 ${fixture.thresholds.topFiveRatePercent}%`,
  )
}
if (topOneRate < fixture.thresholds.exactTopOneRatePercent) {
  failures.push(
    `精确查询 Top 1 命中率 ${topOneRate}% 低于阈值 ${fixture.thresholds.exactTopOneRatePercent}%`,
  )
}

const bucketCounts = Object.fromEntries(
  ['manual-content', 'public-community', 'editorial-task'].map((bucket) => [
    bucket,
    fixture.queries.filter((query) => query.sourceBucket === bucket).length,
  ]),
)
for (const [bucket, targetRatio] of Object.entries(fixture.sourceMixTarget)) {
  const actualRatio = (bucketCounts[bucket] ?? 0) / fixture.queries.length
  if (Math.abs(actualRatio - targetRatio) > 0.05) {
    failures.push(
      `${bucket} 来源比例 ${percentage(bucketCounts[bucket] ?? 0, fixture.queries.length)}% 偏离目标 ${targetRatio * 100}% 超过 5 个百分点`,
    )
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  fixture: {
    path: 'tests/fixtures/search-quality.zh-CN.json',
    fixtureVersion: fixture.fixtureVersion,
    frozenAt: fixture.generatedAt,
    reviewer: fixture.reviewer,
    commitSha: fixture.commitSha,
  },
  index: {
    pageCount: index.length,
    indexedFields: [
      'title',
      'description',
      'headings',
      'body',
      'tags',
      'entities',
      'aliases',
    ],
    implementation: 'deterministic-stdlib-only',
  },
  sample: {
    queryCount: fixture.queries.length,
    noResultQueryCount: fixture.noResultQueries.length,
    sourceBucketCounts: bucketCounts,
    sourceBucketPercentages: Object.fromEntries(
      Object.entries(bucketCounts).map(([bucket, count]) => [
        bucket,
        percentage(count, fixture.queries.length),
      ]),
    ),
  },
  thresholds: fixture.thresholds,
  metrics: {
    topFivePassCount,
    topFiveRatePercent: topFiveRate,
    exactTopOneCandidateCount: topOneCandidates.length,
    exactTopOnePassCount: topOnePassCount,
    exactTopOneRatePercent: topOneRate,
    noResultSuggestionPassCount: noResultChecks.filter((item) => item.passed)
      .length,
  },
  queryResults,
  noResultChecks,
  misses,
  failures,
  passed: failures.length === 0,
}

await mkdir(path.dirname(reportPath), { recursive: true })
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

if (failures.length) {
  console.error(
    `中文搜索质量检查失败：Top 5 ${topFiveRate}%，精确 Top 1 ${topOneRate}%，失败 ${failures.length} 项`,
  )
  for (const failure of failures) console.error(`- ${failure}`)
  console.error('报告：content/reports/search-quality.json')
  process.exitCode = 1
} else {
  console.log(
    `中文搜索质量检查通过：${fixture.queries.length} 条查询，Top 5 ${topFiveRate}%，精确 Top 1 ${topOneRate}%`,
  )
  if (misses.length) console.log(`保留未命中样本：${misses.length} 条`)
  console.log('报告：content/reports/search-quality.json')
}

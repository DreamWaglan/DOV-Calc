import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { loadSourceLedger, stableJson } from './lib/migration-elements.mjs'

const root = process.cwd()
const generatedAt = '2026-07-30T00:00:00.000Z'

const sources = {
  preface: {
    assetId: 'src-9ac6e41a613e',
    importPath: 'content/imports/docx/core/preface/review.md',
  },
  gameIntro: {
    assetId: 'src-ea0b63d069bf',
    importPath: 'content/imports/docx/core/game-intro/review.md',
  },
  beginner: {
    assetId: 'src-842246bdb075',
    importPath: 'content/imports/docx/core/beginner/review.md',
  },
  leveling: {
    assetId: 'src-6eba63c4aa7b',
    importPath: 'content/imports/docx/core/leveling/review.md',
  },
  eventPush: {
    assetId: 'src-d47e51aa8321',
    importPath: 'content/imports/docx/core/event-push/review.md',
  },
  pve: {
    assetId: 'src-94e76e4522b1',
    importPath: 'content/imports/docx/core/pve-team/review.md',
  },
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function extractImportedBody(markdown, filePath) {
  const startMarker = '## Imported Body'
  const endMarker = '## Quarantine Review Items'
  const start = markdown.indexOf(startMarker)
  const end = markdown.indexOf(endMarker)
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`${filePath}: imported body markers are missing or invalid`)
  }
  const contentStart = markdown.indexOf('\n', start + startMarker.length) + 1
  return markdown.slice(contentStart, end).trim()
}

function countMarkdownTables(markdown) {
  return [...markdown.matchAll(/^\|\s*:?-{3,}/gm)].length
}

function splitRanges(body, markers, elements) {
  const starts = markers.map((marker) => {
    const index = marker === null ? 0 : body.indexOf(marker)
    if (index < 0) throw new Error(`Core content split marker not found: ${marker}`)
    return index
  })
  if (new Set(starts).size !== starts.length) {
    throw new Error('Core content split markers are not unique')
  }
  for (let index = 1; index < starts.length; index += 1) {
    if (starts[index] <= starts[index - 1]) {
      throw new Error('Core content split markers are out of order')
    }
  }
  const bodyIndexed = elements.filter((element) =>
    Number.isInteger(element.sourcePosition?.bodyIndex),
  )
  const firstBodyIndex = Math.min(
    ...bodyIndexed.map((element) => element.sourcePosition.bodyIndex),
  )
  const finalBodyIndexExclusive =
    Math.max(
      ...bodyIndexed.map((element) => element.sourcePosition.bodyIndex),
    ) + 1
  const bodyIndexStarts = markers.map((marker, index) => {
    if (index === 0) return firstBodyIndex
    const headingTitle = marker.replace(/^#{1,6}\s+/, '')
    const matches = elements.filter(
      (element) =>
        (element.elementType === 'heading' &&
          (element.title === headingTitle ||
            element.title.startsWith(headingTitle))) ||
        element.textHash === sha256(headingTitle),
    )
    if (matches.length !== 1) {
      throw new Error(
        `Core content split heading must match one source element: ${headingTitle} (${matches.length})`,
      )
    }
    return matches[0].sourcePosition.bodyIndex
  })
  let tableCursor = 1
  return starts.map((start, index) => {
    const end = starts[index + 1] ?? body.length
    const source = body.slice(start, end)
    const tableCount = countMarkdownTables(source)
    const result = {
      start,
      end,
      source,
      sourceElementRange: {
        bodyIndexStart: bodyIndexStarts[index],
        bodyIndexEndExclusive:
          bodyIndexStarts[index + 1] ?? finalBodyIndexExclusive,
        tableIndexStart: tableCursor,
        tableIndexEndExclusive: tableCursor + tableCount,
      },
    }
    tableCursor += tableCount
    return result
  })
}

function normalizeSourceMarkdown(markdown) {
  return markdown
    .replace(
      /<(script|iframe|object|embed|style|link|meta)\b/gi,
      '&lt;$1',
    )
    .replace(/^(#{1,6})(\s+)/gm, (_, hashes, spacing) => {
      return `${'#'.repeat(Math.min(6, hashes.length + 1))}${spacing}`
    })
    .trim()
}

function pageFrontmatter({
  id,
  title,
  description,
  section,
  order,
  audience,
  status,
  asset,
  tags,
  related,
}) {
  return [
    '---',
    `id: ${id}`,
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `section: ${section}`,
    `order: ${order}`,
    `audience: ${JSON.stringify(audience)}`,
    'contentType: guide',
    'gameVersion: "2026-07"',
    `sourceUpdatedAt: ${JSON.stringify(asset.origin.updatedAt)}`,
    'verifiedAt: "2026-07-30"',
    `status: ${status}`,
    'authors:',
    '  - name: DOV-Calc 内容维护组',
    '    role: 授权资料迁移编辑',
    'reviewers:',
    '  - name: DOV-Calc 事实审核组',
    '    role: 核心阅读路径事实审核',
    'sources:',
    `  - title: ${JSON.stringify(asset.title)}`,
    `    assetId: ${asset.id}`,
    '    sourceType: docx',
    `    permission: ${asset.permission}`,
    '    publicUse:',
    '      body: true',
    '      asset: false',
    '    notes: 已迁移授权正文；原始 DOCX 和媒体字节不公开，配套图片仅发布授权响应式派生图。',
    `tags: ${JSON.stringify(tags)}`,
    `related: ${JSON.stringify([
      ...new Set([...related, `media-source-${asset.id.slice(4)}`]),
    ])}`,
    '---',
    '',
  ].join('\n')
}

async function writePage(definition, asset, sourceSlice = null) {
  const warning =
    definition.status === 'draft'
      ? [
          '> [!WARNING] 审核状态',
          '> 本页已完成授权原稿的可搜索迁移，但版本数字、图示依赖和实战结论仍在 Phase 7 事实审核队列。页面状态为 `draft`，使用前请结合当前游戏版本核对。',
          '',
        ].join('\n')
      : [
          '> [!INFO] 来源说明',
          '> 本页正文来自已登记授权资料；仅开放网页正文，不提供原始 DOCX 下载。',
          '',
        ].join('\n')
  const body = sourceSlice
    ? [
        `# ${definition.title}`,
        '',
        warning,
        normalizeSourceMarkdown(sourceSlice.source),
        '',
        definition.nextLink ?? '',
      ]
        .filter(Boolean)
        .join('\n')
    : definition.editorialBody
  const output = `${pageFrontmatter({ ...definition, asset })}${body.trim()}\n`
  const absolutePath = path.join(root, definition.file)
  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, output, 'utf8')
  return {
    pageId: definition.id,
    file: definition.file,
    route: definition.route,
    status: definition.status,
    ...(sourceSlice
      ? {
          sourceRange: {
            start: sourceSlice.start,
            end: sourceSlice.end,
          },
          sourceElementRange: sourceSlice.sourceElementRange,
          sourceSliceSha256: sha256(sourceSlice.source),
          sourceChars: sourceSlice.source.length,
        }
      : { editorialOverview: true }),
    outputSha256: sha256(output),
  }
}

const ledger = await loadSourceLedger()
const assetsById = new Map(ledger.assets.map((asset) => [asset.id, asset]))
const sourceBodies = {}
for (const [key, source] of Object.entries(sources)) {
  const asset = assetsById.get(source.assetId)
  if (!asset) throw new Error(`Core source is not registered: ${source.assetId}`)
  if (asset.permission !== 'authorized' || asset.publicRelease.body !== true) {
    throw new Error(`Core source body is not authorized for migration: ${asset.id}`)
  }
  const review = await readFile(path.join(root, source.importPath), 'utf8')
  const report = JSON.parse(
    await readFile(
      path.join(root, path.dirname(source.importPath), 'import-report.json'),
      'utf8',
    ),
  )
  sourceBodies[key] = {
    asset,
    body: extractImportedBody(review, source.importPath),
    elements: report.elements,
  }
}

const partitions = {
  preface: splitRanges(
    sourceBodies.preface.body,
    [null],
    sourceBodies.preface.elements,
  ),
  gameIntro: splitRanges(
    sourceBodies.gameIntro.body,
    [null],
    sourceBodies.gameIntro.elements,
  ),
  beginner: splitRanges(
    sourceBodies.beginner.body,
    [null, '# 第二阶段', '# 第四阶段'],
    sourceBodies.beginner.elements,
  ),
  leveling: splitRanges(
    sourceBodies.leveling.body,
    [
      null,
      '第二章 练船策略之总纲篇',
      '第三章 练船策略之练级点篇',
      '第四章.练船策略之省油篇',
    ],
    sourceBodies.leveling.elements,
  ),
  eventPush: splitRanges(
    sourceBodies.eventPush.body,
    [null],
    sourceBodies.eventPush.elements,
  ),
  pve: splitRanges(
    sourceBodies.pve.body,
    [null, '# 二、我方常用舰灵', '# 三、初步配队'],
    sourceBodies.pve.elements,
  ),
}

const sourcePageDefinitions = [
  {
    sourceKey: 'preface',
    partition: 0,
    file: 'docs/start/handbook-history.md',
    route: '/start/handbook-history',
    id: 'start-handbook-history',
    title: '《拂晓手册》的缘起与致谢',
    description: '收录手册的编纂缘起、定位、参与者致谢和后续维护愿景。',
    section: 'start',
    order: 125,
    audience: ['new-player', 'regular'],
    status: 'draft',
    tags: ['手册', '编纂', '致谢'],
    related: ['start-preface', 'start-game-introduction', 'start-index'],
  },
  {
    sourceKey: 'gameIntro',
    partition: 0,
    file: 'docs/start/game-introduction.md',
    route: '/start/game-introduction',
    id: 'start-game-introduction',
    title: '这是什么游戏',
    description: '认识《拂晓》的舰灵养成、海战、剧情、活动与社区互动。',
    section: 'start',
    order: 120,
    audience: ['new-player', 'beginner'],
    status: 'current',
    tags: ['游戏简介', '舰灵', '海战'],
    related: ['start-first-week', 'start-preface', 'start-index'],
    nextLink: '下一步：[进入第一周行动路线](./first-week)。',
  },
  {
    sourceKey: 'beginner',
    partition: 0,
    file: 'docs/start/new-account.md',
    route: '/start/new-account',
    id: 'start-new-account',
    title: '新号准备：选区、设置与开局资源',
    description: '从版本提醒、资源认知、选区、性能设置到开局抽卡，完成进入主线前的准备。',
    section: 'start',
    order: 140,
    audience: ['new-player', 'beginner'],
    status: 'draft',
    tags: ['开荒', '选区', '抽卡', '资源'],
    related: ['start-first-week', 'start-mainline-roadmap', 'topic-new-player-checklist'],
    nextLink: '继续阅读：[主线 1-1 至 12-10 推进路线](./mainline-roadmap)。',
  },
  {
    sourceKey: 'beginner',
    partition: 1,
    file: 'docs/start/mainline-roadmap.md',
    route: '/start/mainline-roadmap',
    id: 'start-mainline-roadmap',
    title: '主线 1-1 至 12-10 推进路线',
    description: '按阶段整理主线推进、练级、养成、手操和困难关卡的原稿路线。',
    section: 'start',
    order: 150,
    audience: ['new-player', 'beginner'],
    status: 'draft',
    tags: ['主线', '推图', '练级', '养成'],
    related: ['start-new-account', 'start-daily-and-events', 'progression-leveling'],
    nextLink: '继续阅读：[日常、活动与后续系统](./daily-and-events)。',
  },
  {
    sourceKey: 'beginner',
    partition: 2,
    file: 'docs/start/daily-and-events.md',
    route: '/start/daily-and-events',
    id: 'start-daily-and-events',
    title: '日常、活动与后续系统',
    description: '整理咨询、技能、远征、演习、档案、主要活动、每日流程和资源使用建议。',
    section: 'start',
    order: 160,
    audience: ['new-player', 'beginner'],
    status: 'draft',
    tags: ['日常', '活动', '远征', '资源'],
    related: ['start-mainline-roadmap', 'combat-event-maps', 'progression-leveling'],
    nextLink: '下一站：[练级百科导航](../progression/leveling)。',
  },
  {
    sourceKey: 'leveling',
    partition: 0,
    file: 'docs/progression/leveling-ship-selection.md',
    route: '/progression/leveling-ship-selection',
    id: 'progression-leveling-ship-selection',
    title: '练级百科一：选船篇',
    description: '按玩法、获取难度和常用职责整理练级对象选择与劳模舰灵思路。',
    section: 'progression',
    order: 220,
    audience: ['beginner', 'regular'],
    status: 'draft',
    tags: ['练级', '选船', 'PVE'],
    related: ['progression-leveling', 'progression-leveling-strategy', 'combat-pve-team-building'],
    nextLink: '下一章：[练船策略总纲](./leveling-strategy)。',
  },
  {
    sourceKey: 'leveling',
    partition: 1,
    file: 'docs/progression/leveling-strategy.md',
    route: '/progression/leveling-strategy',
    id: 'progression-leveling-strategy',
    title: '练级百科二：练船策略总纲',
    description: '解释练级目标、老板与打手循环、经验与好感、开槽、站位和队伍衔接。',
    section: 'progression',
    order: 230,
    audience: ['beginner', 'regular'],
    status: 'draft',
    tags: ['练级', '经验', '站位', '开槽'],
    related: ['progression-leveling-ship-selection', 'progression-leveling-locations'],
    nextLink: '下一章：[练级点篇](./leveling-locations)。',
  },
  {
    sourceKey: 'leveling',
    partition: 2,
    file: 'docs/progression/leveling-locations.md',
    route: '/progression/leveling-locations',
    id: 'progression-leveling-locations',
    title: '练级百科三：练级点篇',
    description: '整理主线与活动练级点、甲弹克制、索敌、生存、开槽和后置练级技巧。',
    section: 'progression',
    order: 240,
    audience: ['beginner', 'regular'],
    status: 'draft',
    tags: ['练级点', '索敌', '甲弹克制', '生存'],
    related: ['progression-leveling-strategy', 'progression-leveling-efficiency'],
    nextLink: '下一章：[省油与效率篇](./leveling-efficiency)。',
  },
  {
    sourceKey: 'leveling',
    partition: 3,
    file: 'docs/progression/leveling-efficiency.md',
    route: '/progression/leveling-efficiency',
    id: 'progression-leveling-efficiency',
    title: '练级百科四：省油与效率篇',
    description: '整理降低消耗、油料来源与练级流程自动化的原稿方法和风险边界。',
    section: 'progression',
    order: 250,
    audience: ['regular', 'advanced'],
    status: 'draft',
    tags: ['省油', '效率', '油料'],
    related: ['progression-leveling-locations', 'combat-event-maps'],
    nextLink: '下一站：[活动推图方法](../combat/event-maps)。',
  },
  {
    sourceKey: 'eventPush',
    partition: 0,
    file: 'docs/combat/event-maps.md',
    route: '/combat/event-maps',
    id: 'combat-event-maps',
    title: '活动推图与阵容替换',
    description: '按带路条件、所需练度、BOX 筛选、实战验证和单变量微调复用活动攻略。',
    section: 'combat',
    order: 310,
    audience: ['beginner', 'regular'],
    status: 'draft',
    tags: ['活动', '推图', '阵容替换', '带路条件'],
    related: ['progression-leveling', 'combat-pve-team-building', 'start-daily-and-events'],
    nextLink: '下一站：[PVE 配队导航](./pve-team-building)。',
  },
  {
    sourceKey: 'pve',
    partition: 0,
    file: 'docs/combat/pve-enemy-analysis.md',
    route: '/combat/pve-enemy-analysis',
    id: 'combat-pve-enemy-analysis',
    title: 'PVE 配队一：观察敌方',
    description: '从关卡界面读取索敌、等级压制、甲种、敌方数量、特殊敌舰与活动带路条件。',
    section: 'combat',
    order: 330,
    audience: ['beginner', 'regular'],
    status: 'draft',
    tags: ['PVE', '敌方', '索敌', '等级压制'],
    related: ['combat-pve-team-building', 'combat-pve-ship-roles', 'topic-laguz'],
    nextLink: '下一章：[常用舰灵职责](./pve-ship-roles)。',
  },
  {
    sourceKey: 'pve',
    partition: 1,
    file: 'docs/combat/pve-ship-roles.md',
    route: '/combat/pve-ship-roles',
    id: 'combat-pve-ship-roles',
    title: 'PVE 配队二：常用舰灵职责',
    description: '按前排自奶、后排治疗、前排 AOE、后排辅助与输出理解常见 PVE 职责。',
    section: 'combat',
    order: 340,
    audience: ['beginner', 'regular'],
    status: 'draft',
    tags: ['PVE', '舰灵职责', '治疗', '输出'],
    related: ['combat-pve-enemy-analysis', 'combat-pve-team-practice', 'topic-pve-selection'],
    nextLink: '下一章：[初步配队与微调](./pve-team-practice)。',
  },
  {
    sourceKey: 'pve',
    partition: 2,
    file: 'docs/combat/pve-team-practice.md',
    route: '/combat/pve-team-practice',
    id: 'combat-pve-team-practice',
    title: 'PVE 配队三：构筑与微调',
    description: '按甲种、敌方数量和玩法先完成初配，再区分理论输出、实际输出与生存问题。',
    section: 'combat',
    order: 350,
    audience: ['beginner', 'regular'],
    status: 'draft',
    tags: ['PVE', '配队', '微调', '实战'],
    related: ['combat-pve-ship-roles', 'combat-event-maps', 'combat-encounter'],
  },
]

const overviewDefinitions = [
  {
    file: 'docs/start/first-week.md',
    route: '/start/first-week',
    id: 'start-first-week',
    title: '入坑第一周行动指南',
    description: '用三个可审核的子页面完成开局准备、主线推进、日常活动，并衔接练级路线。',
    section: 'start',
    order: 130,
    audience: ['new-player', 'beginner'],
    status: 'draft',
    asset: sourceBodies.beginner.asset,
    tags: ['第一周', '开荒', '主线', '日常'],
    related: ['start-new-account', 'start-mainline-roadmap', 'start-daily-and-events', 'progression-leveling'],
    editorialBody: `# 入坑第一周行动指南

这条路线按任务而不是自然日组织。先完成开局准备，再推进主线，最后建立日常与活动循环；每一页都保留授权原稿的完整可搜索正文。

## 阅读顺序

1. [新号准备：选区、设置与开局资源](./new-account)
2. [主线 1-1 至 12-10 推进路线](./mainline-roadmap)
3. [日常、活动与后续系统](./daily-and-events)
4. [练级百科导航](../progression/leveling)

## 使用规则

- 带有 \`draft\` 状态的数字、角色推荐和活动结论必须结合当前版本复核。
- 原稿依赖但尚未完成审核的图示不会被假装成文字结论。
- 原始 DOCX 不开放下载；网页正文、搜索与站点地图范围服从授权总账。
`,
  },
  {
    file: 'docs/progression/leveling.md',
    route: '/progression/leveling',
    id: 'progression-leveling',
    title: '练级百科导航',
    description: '把完整练级原稿拆为选船、总纲、练级点和省油四章，便于搜索、引用与版本审核。',
    section: 'progression',
    order: 210,
    audience: ['beginner', 'regular'],
    status: 'draft',
    asset: sourceBodies.leveling.asset,
    tags: ['练级', '经验', '省油', '养成'],
    related: ['progression-leveling-ship-selection', 'progression-leveling-strategy', 'progression-leveling-locations', 'progression-leveling-efficiency'],
    editorialBody: `# 练级百科导航

原始练级百科篇幅较长，本 Wiki 按原稿的四章结构拆分。拆页只改变阅读路径，不删除原稿段落。

1. [选船篇](./leveling-ship-selection)：先回答“练什么”。
2. [练船策略总纲](./leveling-strategy)：理解经验、站位、开槽与队伍衔接。
3. [练级点篇](./leveling-locations)：按关卡与活动选择练级位置。
4. [省油与效率篇](./leveling-efficiency)：控制油耗和重复劳动。

完成后继续阅读[活动推图与阵容替换](../combat/event-maps)。
`,
  },
  {
    file: 'docs/combat/pve-team-building.md',
    route: '/combat/pve-team-building',
    id: 'combat-pve-team-building',
    title: 'PVE 配队导航',
    description: '将完整 PVE 原稿拆为敌方分析、舰灵职责、构筑微调三章，并保留玩法间的交叉引用。',
    section: 'combat',
    order: 320,
    audience: ['beginner', 'regular'],
    status: 'draft',
    asset: sourceBodies.pve.asset,
    tags: ['PVE', '配队', '舰灵职责', '微调'],
    related: ['combat-pve-enemy-analysis', 'combat-pve-ship-roles', 'combat-pve-team-practice', 'combat-event-maps'],
    editorialBody: `# PVE 配队导航

PVE 配队先读敌人，再分配职责，最后用实战结果微调。完整授权原稿按这一决策顺序拆成三章：

1. [观察敌方](./pve-enemy-analysis)
2. [常用舰灵职责](./pve-ship-roles)
3. [初步配队与微调](./pve-team-practice)

如果当前任务是活动图，先看[活动推图与阵容替换](./event-maps)；如果是排名或高难玩法，再进入对应进阶章节。
`,
  },
]

const sourcePageEntries = []
for (const definition of sourcePageDefinitions) {
  const source = sourceBodies[definition.sourceKey]
  const slice = partitions[definition.sourceKey][definition.partition]
  sourcePageEntries.push(await writePage(definition, source.asset, slice))
}

const overviewEntries = []
for (const definition of overviewDefinitions) {
  overviewEntries.push(await writePage(definition, definition.asset))
}

const sourceEntries = Object.entries(sourceBodies).map(([key, source]) => {
  const pages = sourcePageEntries.filter((entry) =>
    sourcePageDefinitions.some(
      (definition) =>
        definition.sourceKey === key && definition.id === entry.pageId,
    ),
  )
  const coveredChars = pages.reduce(
    (total, page) => total + page.sourceChars,
    0,
  )
  return {
    sourceAssetId: source.asset.id,
    sourceBodySha256: sha256(source.body),
    sourceChars: source.body.length,
    coveredChars,
    pages,
  }
})

const migration = {
  schemaVersion: 1,
  generatedAt,
  sources: sourceEntries,
  editorialOverviews: overviewEntries,
  summary: {
    sourceAssets: sourceEntries.length,
    sourcePages: sourcePageEntries.length,
    editorialOverviews: overviewEntries.length,
    sourceChars: sourceEntries.reduce(
      (total, source) => total + source.sourceChars,
      0,
    ),
    coveredChars: sourceEntries.reduce(
      (total, source) => total + source.coveredChars,
      0,
    ),
  },
}

const migrationPath = path.join(
  root,
  'content',
  'migrations',
  'core-content-pages.json',
)
await writeFile(migrationPath, stableJson(migration), 'utf8')
console.log(
  `Core content pages generated: ${sourcePageEntries.length} source pages + ${overviewEntries.length} overviews, ${migration.summary.coveredChars}/${migration.summary.sourceChars} source characters covered.`,
)

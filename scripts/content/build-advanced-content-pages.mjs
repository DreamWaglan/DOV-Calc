import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { loadSourceLedger, stableJson } from './lib/migration-elements.mjs'

const root = process.cwd()
const generatedAt = '2026-07-30T00:00:00.000Z'

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

function normalizeSourceMarkdown(markdown) {
  return markdown
    .replace(/<(script|iframe|object|embed|style|link|meta)\b/gi, '&lt;$1')
    .replace(/^(#{1,6})(\s+)/gm, (_, hashes, spacing) => {
      return `${'#'.repeat(Math.min(6, hashes.length + 1))}${spacing}`
    })
    .trim()
}

function countMarkdownTables(markdown) {
  return [...markdown.matchAll(/^\|\s*:?-{3,}/gm)].length
}

function resolvePartitions(source, pageDefinitions) {
  const bodyIndexed = source.elements.filter((element) =>
    Number.isInteger(element.sourcePosition?.bodyIndex),
  )
  const firstBodyIndex = Math.min(
    ...bodyIndexed.map((element) => element.sourcePosition.bodyIndex),
  )
  const finalBodyIndexExclusive =
    Math.max(
      ...bodyIndexed.map((element) => element.sourcePosition.bodyIndex),
    ) + 1
  const starts = pageDefinitions.map((definition, index) => {
    if (index === 0 && definition.startHeading === null) {
      return { charIndex: 0, bodyIndex: firstBodyIndex }
    }
    const matches = source.elements.filter(
      (element) =>
        element.elementType === 'heading' &&
        element.title === definition.startHeading,
    )
    if (matches.length !== 1) {
      throw new Error(
        `${source.asset.id}: split heading must match once: ${definition.startHeading} (${matches.length})`,
      )
    }
    const element = matches[0]
    const marker = `${'#'.repeat(element.headingLevel)} ${element.title}`
    const charIndex = source.body.indexOf(marker)
    if (charIndex < 0) {
      throw new Error(`${source.asset.id}: split marker not found: ${marker}`)
    }
    return {
      charIndex,
      bodyIndex: element.sourcePosition.bodyIndex,
    }
  })
  for (let index = 1; index < starts.length; index += 1) {
    if (
      starts[index].charIndex <= starts[index - 1].charIndex ||
      starts[index].bodyIndex <= starts[index - 1].bodyIndex
    ) {
      throw new Error(`${source.asset.id}: split markers are out of order`)
    }
  }
  let tableCursor = 1
  return starts.map((start, index) => {
    const end = starts[index + 1] ?? {
      charIndex: source.body.length,
      bodyIndex: finalBodyIndexExclusive,
    }
    const markdown = source.body.slice(start.charIndex, end.charIndex)
    const tableCount = countMarkdownTables(markdown)
    const partition = {
      source: markdown,
      sourceRange: {
        start: start.charIndex,
        end: end.charIndex,
      },
      sourceElementRange: {
        bodyIndexStart: start.bodyIndex,
        bodyIndexEndExclusive: end.bodyIndex,
        tableIndexStart: tableCursor,
        tableIndexEndExclusive: tableCursor + tableCount,
      },
    }
    tableCursor += tableCount
    return partition
  })
}

function frontmatter(definition, asset) {
  return [
    '---',
    `id: ${definition.id}`,
    `title: ${JSON.stringify(definition.title)}`,
    `description: ${JSON.stringify(definition.description)}`,
    `section: ${definition.section}`,
    `order: ${definition.order}`,
    `audience: ${JSON.stringify(definition.audience)}`,
    'contentType: guide',
    'gameVersion: "2026-07"',
    `sourceUpdatedAt: ${JSON.stringify(asset.origin.updatedAt)}`,
    'verifiedAt: "2026-07-30"',
    `status: ${definition.status ?? 'draft'}`,
    'authors:',
    '  - name: DOV-Calc 内容维护组',
    '    role: 授权资料迁移编辑',
    'reviewers:',
    '  - name: DOV-Calc 事实审核组',
    '    role: 进阶内容事实审核',
    'sources:',
    `  - title: ${JSON.stringify(asset.title)}`,
    `    assetId: ${asset.id}`,
    '    sourceType: docx',
    `    permission: ${asset.permission}`,
    '    publicUse:',
    '      body: true',
    '      asset: false',
    '    notes: 已迁移授权正文；原始 DOCX 下载不公开，媒体派生在 Phase 5 单独审核。',
    `tags: ${JSON.stringify(definition.tags)}`,
    `related: ${JSON.stringify(definition.related)}`,
    '---',
    '',
  ].join('\n')
}

async function writeSourcePage(definition, asset, partition) {
  const body = [
    `# ${definition.title}`,
    '',
    '> [!WARNING] 审核状态',
    '> 本页已完成授权原稿的可搜索迁移与元素归属，但版本数值、公式复算和媒体说明仍在 Phase 7 事实审核队列。页面保持 `draft`，不作为当前版本的最终结论。',
    '',
    normalizeSourceMarkdown(partition.source),
    '',
    definition.nextLink ?? '',
  ]
    .filter(Boolean)
    .join('\n')
  const output = `${frontmatter(definition, asset)}${body.trim()}\n`
  const absolutePath = path.join(root, definition.file)
  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, output, 'utf8')
  return {
    pageId: definition.id,
    file: definition.file,
    route: definition.route,
    status: definition.status ?? 'draft',
    sourceRange: partition.sourceRange,
    sourceElementRange: partition.sourceElementRange,
    sourceSliceSha256: sha256(partition.source),
    sourceChars: partition.source.length,
    outputSha256: sha256(output),
  }
}

async function writeOverview(definition, asset) {
  const output = `${frontmatter(definition, asset)}${definition.editorialBody.trim()}\n`
  const absolutePath = path.join(root, definition.file)
  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, output, 'utf8')
  return {
    pageId: definition.id,
    file: definition.file,
    route: definition.route,
    status: definition.status ?? 'draft',
    editorialOverview: true,
    outputSha256: sha256(output),
  }
}

const migrations = [
  {
    key: 'arena',
    assetId: 'src-7d080e8d651b',
    importDir: 'content/imports/docx/arena',
    pages: [
      {
        startHeading: null,
        file: 'docs/combat/pvp-fundamentals.md',
        route: '/combat/pvp-fundamentals',
        id: 'combat-pvp-fundamentals',
        title: '争锋竞技场一：综合机制',
        description: '迁移竞技场综合篇，覆盖索敌、制空、增减伤、弹种、命中、站位、天赋、装备和通用法则。',
        section: 'combat',
        order: 360,
        audience: ['regular', 'advanced'],
        tags: ['PVP', '竞技场', '机制', '公式'],
        related: ['combat-pvp-arena', 'mechanics-damage-model'],
        nextLink: '下一章：[竞技场规则与编队](./pvp-rules-and-fleet)。',
      },
      {
        startHeading: '二、争锋竞技场简介',
        file: 'docs/combat/pvp-rules-and-fleet.md',
        route: '/combat/pvp-rules-and-fleet',
        id: 'combat-pvp-rules-and-fleet',
        title: '争锋竞技场二：规则与编队',
        description: '迁移竞技场机制、船场划分、编队构成与配装入口。',
        section: 'combat',
        order: 370,
        audience: ['regular', 'advanced'],
        tags: ['PVP', '竞技场', '编队', '配装'],
        related: ['combat-pvp-fundamentals', 'combat-pvp-reference-teams'],
        nextLink: '下一章：[参考阵容](./pvp-reference-teams)。',
      },
      {
        startHeading: '三、参考阵容推荐',
        file: 'docs/combat/pvp-reference-teams.md',
        route: '/combat/pvp-reference-teams',
        id: 'combat-pvp-reference-teams',
        title: '争锋竞技场三：参考阵容',
        description: '迁移金场等分区的参考阵容、替代关系和原稿结语。',
        section: 'combat',
        order: 380,
        audience: ['advanced'],
        tags: ['PVP', '竞技场', '阵容', '替代'],
        related: ['combat-pvp-rules-and-fleet', 'combat-pvp-arena'],
      },
    ],
    overview: {
      file: 'docs/combat/pvp-arena.md',
      route: '/combat/pvp-arena',
      id: 'combat-pvp-arena',
      title: '争锋竞技场导航',
      description: '按机制、规则与编队、参考阵容三条路径阅读完整竞技场授权资料。',
      section: 'combat',
      order: 350,
      audience: ['regular', 'advanced'],
      tags: ['PVP', '竞技场', '阵容'],
      related: ['combat-pvp-fundamentals', 'combat-pvp-rules-and-fleet', 'combat-pvp-reference-teams'],
      editorialBody: `# 争锋竞技场导航

完整竞技场原稿按决策顺序拆为三章：

1. [综合机制](./pvp-fundamentals)：先理解索敌、制空、伤害修正和站位。
2. [规则与编队](./pvp-rules-and-fleet)：再理解竞技场规则、船场和配装。
3. [参考阵容](./pvp-reference-teams)：最后按现有舰灵与装备选择可替代阵容。

拆页保留原稿全部正文和表格；媒体、公式复算与版本结论仍需在后续审核中关闭。`,
    },
  },
  {
    key: 'encounter',
    assetId: 'src-d35e870ffcd7',
    importDir: 'content/imports/docx/advanced/encounter',
    pages: [
      {
        startHeading: null,
        file: 'docs/combat/encounter-overview.md',
        route: '/combat/encounter-overview',
        id: 'combat-encounter-overview',
        title: '遭遇战一：玩法说明',
        description: '迁移遭遇战的玩法定义与阅读入口。',
        section: 'combat',
        order: 400,
        audience: ['regular', 'advanced'],
        tags: ['遭遇战', '玩法'],
        related: ['combat-encounter', 'combat-encounter-preparation'],
        nextLink: '下一章：[赛前备战](./encounter-preparation)。',
      },
      {
        startHeading: '遭遇战赛前备战',
        file: 'docs/combat/encounter-preparation.md',
        route: '/combat/encounter-preparation',
        id: 'combat-encounter-preparation',
        title: '遭遇战二：赛前备战',
        description: '迁移 BOSS 甲种、舰灵、装备、天赋、技能、操作和冲分轴准备。',
        section: 'combat',
        order: 410,
        audience: ['advanced'],
        tags: ['遭遇战', '备战', '装备', '轴'],
        related: ['combat-encounter-overview', 'combat-encounter-practice'],
        nextLink: '下一章：[冲分实操](./encounter-practice)。',
      },
      {
        startHeading: '遭遇战冲分实操',
        file: 'docs/combat/encounter-practice.md',
        route: '/combat/encounter-practice',
        id: 'combat-encounter-practice',
        title: '遭遇战三：冲分实操',
        description: '迁移遭遇战冲分实操、结语和操作复盘内容。',
        section: 'combat',
        order: 420,
        audience: ['advanced'],
        tags: ['遭遇战', '冲分', '实操'],
        related: ['combat-encounter-preparation', 'combat-encounter-appendix'],
        nextLink: '下一章：[现有实战轴与参考文献](./encounter-appendix)。',
      },
      {
        startHeading: '附录：现有实际轴',
        file: 'docs/combat/encounter-appendix.md',
        route: '/combat/encounter-appendix',
        id: 'combat-encounter-appendix',
        title: '遭遇战四：实战轴附录',
        description: '迁移现有实际轴与参考文献，保留版本复核入口。',
        section: 'combat',
        order: 430,
        audience: ['advanced'],
        tags: ['遭遇战', '实战轴', '参考文献'],
        related: ['combat-encounter-practice', 'combat-encounter'],
      },
    ],
    overview: {
      file: 'docs/combat/encounter.md',
      route: '/combat/encounter',
      id: 'combat-encounter',
      title: '遭遇战导航',
      description: '按玩法、备战、实操和实战轴附录阅读完整遭遇战授权资料。',
      section: 'combat',
      order: 390,
      audience: ['regular', 'advanced'],
      tags: ['遭遇战', '冲分', '阵容'],
      related: ['combat-encounter-overview', 'combat-encounter-preparation', 'combat-encounter-practice', 'combat-encounter-appendix'],
      editorialBody: `# 遭遇战导航

1. [玩法说明](./encounter-overview)
2. [赛前备战](./encounter-preparation)
3. [冲分实操](./encounter-practice)
4. [现有实战轴与参考文献](./encounter-appendix)

实战轴具有明显版本依赖，拆页正文保持草稿状态，使用前必须结合当前 BOSS、舰灵与装备版本复核。`,
    },
  },
  {
    key: 'endless',
    assetId: 'src-51475ba227c9',
    importDir: 'content/imports/docx/advanced/endless-sea',
    pages: [
      {
        startHeading: null,
        file: 'docs/combat/endless-sea-basics.md',
        route: '/combat/endless-sea-basics',
        id: 'combat-endless-sea-basics',
        title: '无尽海域一：入场须知',
        description: '迁移无尽海域玩法、奖励和入场技巧。',
        section: 'combat',
        order: 450,
        audience: ['regular', 'advanced'],
        tags: ['无尽海域', '入场', '奖励'],
        related: ['combat-endless-sea', 'combat-endless-sea-mechanics'],
        nextLink: '下一章：[机制知识储备](./endless-sea-mechanics)。',
      },
      {
        startHeading: '二、知识储备——拂晓PVE机制大学习',
        file: 'docs/combat/endless-sea-mechanics.md',
        route: '/combat/endless-sea-mechanics',
        id: 'combat-endless-sea-mechanics',
        title: '无尽海域二：机制知识储备',
        description: '迁移技能模块、甲弹克制、射程锁定、敌舰模块与伤害处理。',
        section: 'combat',
        order: 460,
        audience: ['advanced'],
        tags: ['无尽海域', 'PVE', '机制', '伤害'],
        related: ['combat-endless-sea-basics', 'combat-endless-sea-team-building'],
        nextLink: '下一章：[配队思路](./endless-sea-team-building)。',
      },
      {
        startHeading: '三、配队思路',
        file: 'docs/combat/endless-sea-team-building.md',
        route: '/combat/endless-sea-team-building',
        id: 'combat-endless-sea-team-building',
        title: '无尽海域三：配队思路',
        description: '迁移敌舰配置、难度评价、萌新与老登配队、典型阵容和高难总结。',
        section: 'combat',
        order: 470,
        audience: ['advanced'],
        tags: ['无尽海域', '配队', '高难'],
        related: ['combat-endless-sea-mechanics', 'combat-endless-sea'],
      },
    ],
    overview: {
      file: 'docs/combat/endless-sea.md',
      route: '/combat/endless-sea',
      id: 'combat-endless-sea',
      title: '无尽海域导航',
      description: '按入场须知、机制知识和配队思路阅读完整无尽海域授权资料。',
      section: 'combat',
      order: 440,
      audience: ['regular', 'advanced'],
      tags: ['无尽海域', 'PVE', '配队'],
      related: ['combat-endless-sea-basics', 'combat-endless-sea-mechanics', 'combat-endless-sea-team-building'],
      editorialBody: `# 无尽海域导航

1. [入场须知](./endless-sea-basics)
2. [机制知识储备](./endless-sea-mechanics)
3. [配队思路](./endless-sea-team-building)

完整原稿按“了解玩法—理解机制—构筑队伍”的顺序拆分，所有源段落和表格仍由迁移总账追踪。`,
    },
  },
  {
    key: 'damage',
    assetId: 'src-c8852cf69a7b',
    importDir: 'content/imports/docx/advanced/damage-calculation',
    pages: [
      {
        startHeading: null,
        file: 'docs/mechanics/damage-formula-overview.md',
        route: '/mechanics/damage-formula-overview',
        id: 'mechanics-damage-formula-overview',
        title: '伤害构成一：总公式',
        description: '迁移伤害公式与技能实数伤害总览。',
        section: 'mechanics',
        order: 310,
        audience: ['regular', 'advanced'],
        tags: ['伤害', '公式', '实数伤害'],
        related: ['mechanics-damage-model', 'mechanics-attack-power'],
        nextLink: '下一章：[攻击力](./attack-power)。',
      },
      {
        startHeading: '攻击力：',
        file: 'docs/mechanics/attack-power.md',
        route: '/mechanics/attack-power',
        id: 'mechanics-attack-power',
        title: '伤害构成二：攻击力',
        description: '迁移攻击力定义及舰种、等级、强化、天赋、羁绊、装备、技能和旗舰影响。',
        section: 'mechanics',
        order: 320,
        audience: ['advanced'],
        tags: ['伤害', '攻击力', '装备'],
        related: ['mechanics-damage-formula-overview', 'mechanics-defense-power'],
        nextLink: '下一章：[防御力](./defense-power)。',
      },
      {
        startHeading: '防御力：',
        file: 'docs/mechanics/defense-power.md',
        route: '/mechanics/defense-power',
        id: 'mechanics-defense-power',
        title: '伤害构成三：防御力',
        description: '迁移 PVE/PVP 防御力定义、影响因素与装备修正。',
        section: 'mechanics',
        order: 330,
        audience: ['advanced'],
        tags: ['伤害', '防御力', 'PVE', 'PVP'],
        related: ['mechanics-attack-power', 'mechanics-damage-multipliers'],
        nextLink: '下一章：[倍率、暴击与弹种](./damage-multipliers)。',
      },
      {
        startHeading: '倍率区：',
        file: 'docs/mechanics/damage-multipliers.md',
        route: '/mechanics/damage-multipliers',
        id: 'mechanics-damage-multipliers',
        title: '伤害构成四：倍率、暴击与弹种',
        description: '迁移倍率区、暴击伤害修正和弹种修正。',
        section: 'mechanics',
        order: 340,
        audience: ['advanced'],
        tags: ['伤害', '倍率', '暴击', '弹种'],
        related: ['mechanics-defense-power', 'mechanics-damage-bonuses'],
        nextLink: '下一章：[增伤、减伤与等级压制](./damage-bonuses)。',
      },
      {
        startHeading: '增伤修正',
        file: 'docs/mechanics/damage-bonuses.md',
        route: '/mechanics/damage-bonuses',
        id: 'mechanics-damage-bonuses',
        title: '伤害构成五：增伤、减伤与等级压制',
        description: '迁移好感、天赋、羁绊、索敌、阵型、旗舰、装备、拉古兹、减伤与等级压制。',
        section: 'mechanics',
        order: 350,
        audience: ['advanced'],
        tags: ['伤害', '增伤', '减伤', '等级压制'],
        related: ['mechanics-damage-multipliers', 'mechanics-hit-critical'],
        nextLink: '下一章：[暴击率、暴击伤害、命中与闪避](./hit-critical)。',
      },
      {
        startHeading: '暴击率与暴击伤害',
        file: 'docs/mechanics/hit-critical.md',
        route: '/mechanics/hit-critical',
        id: 'mechanics-hit-critical',
        title: '伤害构成六：暴击、命中与闪避',
        description: '迁移暴击率、暴击伤害、命中率和闪避率的核算。',
        section: 'mechanics',
        order: 360,
        audience: ['advanced'],
        tags: ['暴击', '命中', '闪避'],
        related: ['mechanics-damage-bonuses', 'mechanics-damage-examples'],
        nextLink: '下一章：[实际核算与参考文献](./damage-examples)。',
      },
      {
        startHeading: '实际核算',
        file: 'docs/mechanics/damage-examples.md',
        route: '/mechanics/damage-examples',
        id: 'mechanics-damage-examples',
        title: '伤害构成七：实际核算',
        description: '迁移实际核算、结语与参考文献，提供后续复算入口。',
        section: 'mechanics',
        order: 370,
        audience: ['advanced'],
        tags: ['伤害', '核算', '样例', '参考文献'],
        related: ['mechanics-hit-critical', 'tool-damage-calculator', 'mechanics-damage-model'],
      },
    ],
    overview: {
      file: 'docs/mechanics/damage-model.md',
      route: '/mechanics/damage-model',
      id: 'mechanics-damage-model',
      title: '伤害模型与计算边界',
      description: '从总公式、攻击、防御、倍率、增减伤、命中暴击到实际核算阅读完整授权资料。',
      section: 'mechanics',
      order: 300,
      audience: ['regular', 'advanced'],
      tags: ['伤害', '公式', '计算'],
      related: ['mechanics-damage-formula-overview', 'mechanics-attack-power', 'mechanics-defense-power', 'mechanics-damage-multipliers', 'mechanics-damage-bonuses', 'mechanics-hit-critical', 'mechanics-damage-examples', 'tool-damage-calculator'],
      editorialBody: `# 伤害模型与计算边界

1. [总公式](./damage-formula-overview)
2. [攻击力](./attack-power)
3. [防御力](./defense-power)
4. [倍率、暴击与弹种](./damage-multipliers)
5. [增伤、减伤与等级压制](./damage-bonuses)
6. [暴击、命中与闪避](./hit-critical)
7. [实际核算与参考文献](./damage-examples)

公式原稿中的 24 个 Office Math 对象已进入元素总账；本阶段保留等价文本并建立页面归属，最终复算和计算器一致性在事实审核门禁中完成。

本页面和配套工具是玩家维护的估算模型，不是官方结算器。“黄金样例”只用于锁定既有计算器行为，不能替代对每条原稿公式的独立事实审核。`,
    },
  },
  {
    key: 'laguz',
    assetId: 'src-e2d43eca15b2',
    importDir: 'content/imports/docx/advanced/laguz',
    pages: [
      {
        startHeading: null,
        file: 'docs/topics/laguz/guide.md',
        route: '/topics/laguz/guide',
        id: 'topic-laguz-guide',
        title: '拉古兹专题：完整资料',
        description: '完整迁移拉古兹专题授权原稿，保留可搜索正文与媒体归属。',
        section: 'topics',
        order: 520,
        audience: ['regular', 'advanced'],
        tags: ['拉古兹', '专题', '攻略'],
        related: ['topic-laguz', 'mechanics-damage-bonuses'],
      },
    ],
    overview: {
      file: 'docs/topics/laguz.md',
      route: '/topics/laguz',
      id: 'topic-laguz',
      title: '拉古兹专题',
      description: '拉古兹授权资料的专题入口，连接完整迁移正文与相关伤害机制。',
      section: 'topics',
      order: 510,
      audience: ['regular', 'advanced'],
      tags: ['拉古兹', '专题', '攻略'],
      related: ['topic-laguz-guide', 'mechanics-damage-bonuses'],
      editorialBody: `# 拉古兹专题

授权原稿没有可依赖的 Word 标题层级，因此本阶段保留为一个连续、可搜索的来源页，避免按猜测拆分语义边界。

- [阅读完整资料](./laguz/guide)
- [查看伤害构成中的拉古兹增伤位置](../mechanics/damage-bonuses)

完整资料页保持草稿状态，媒体说明和版本事实将在后续审核中关闭。`,
    },
  },
]

const ledger = await loadSourceLedger()
const assetsById = new Map(ledger.assets.map((asset) => [asset.id, asset]))
const sourceEntries = []
const overviewEntries = []

for (const migration of migrations) {
  const asset = assetsById.get(migration.assetId)
  if (!asset) throw new Error(`Advanced source is not registered: ${migration.assetId}`)
  if (asset.permission !== 'authorized' || asset.publicRelease.body !== true) {
    throw new Error(`Advanced source body is not authorized: ${migration.assetId}`)
  }
  const reviewPath = path.join(migration.importDir, 'review.md')
  const reportPath = path.join(migration.importDir, 'import-report.json')
  const body = extractImportedBody(
    await readFile(path.join(root, reviewPath), 'utf8'),
    reviewPath,
  )
  const report = JSON.parse(await readFile(path.join(root, reportPath), 'utf8'))
  const source = { asset, body, elements: report.elements }
  const partitions = resolvePartitions(source, migration.pages)
  const pages = []
  for (let index = 0; index < migration.pages.length; index += 1) {
    pages.push(
      await writeSourcePage(
        migration.pages[index],
        asset,
        partitions[index],
      ),
    )
  }
  if (migration.overview) {
    overviewEntries.push(await writeOverview(migration.overview, asset))
  }
  sourceEntries.push({
    sourceAssetId: asset.id,
    sourceBodySha256: sha256(body),
    sourceChars: body.length,
    coveredChars: pages.reduce((total, page) => total + page.sourceChars, 0),
    pages,
  })
}

const manifest = {
  schemaVersion: 1,
  generatedAt,
  sources: sourceEntries,
  editorialOverviews: overviewEntries,
  summary: {
    sourceAssets: sourceEntries.length,
    sourcePages: sourceEntries.reduce(
      (total, source) => total + source.pages.length,
      0,
    ),
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

const manifestPath = path.join(
  root,
  'content',
  'migrations',
  'advanced-content-pages.json',
)
await writeFile(manifestPath, stableJson(manifest), 'utf8')
console.log(
  `Advanced content pages generated: ${manifest.summary.sourcePages} source pages + ${manifest.summary.editorialOverviews} overviews, ${manifest.summary.coveredChars}/${manifest.summary.sourceChars} source characters covered.`,
)

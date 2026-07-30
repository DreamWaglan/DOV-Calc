---
id: about-architecture-decision-001
title: "ADR-001：Wiki 平台演进策略"
description: 依据当前内容规模、搜索质量、编辑频率和多版本需求，确定继续使用 VitePress 的范围，并规定升级 Pagefind、Algolia、MediaWiki 或 Headless CMS 的量化触发条件。
section: about
order: 850
audience: [maintainer, editor]
contentType: site
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-29"
verifiedAt: "2026-07-30"
status: current
authors:
  - name: DOV-Calc 维护组
    role: 架构决策
reviewers:
  - name: DOV-Calc 编辑审核组
    role: 架构复核
sources:
  - title: DOV-Calc 站点维护记录
    assetId: site-maintenance-record
    sourceType: internal
    permission: owned
    publicUse:
      body: true
      asset: false
  - title: VitePress - What is VitePress
    url: https://vitepress.dev/guide/what-is-vitepress
    sourceType: official
    permission: quoted
    publicUse:
      body: true
      asset: false
    licenseEvidence: 仅链接并概述官方公开文档，不复制页面正文。
  - title: Pagefind 官方文档
    url: https://pagefind.app/
    sourceType: official
    permission: quoted
    publicUse:
      body: true
      asset: false
    licenseEvidence: 仅链接并概述官方公开文档，不复制页面正文。
  - title: Algolia Crawler 官方文档
    url: https://www.algolia.com/doc/tools/crawler/getting-started/overview
    sourceType: official
    permission: quoted
    publicUse:
      body: true
      asset: false
    licenseEvidence: 仅链接并概述官方公开文档，不复制页面正文。
  - title: MediaWiki 安装要求
    url: https://www.mediawiki.org/wiki/Manual:Installation_requirements
    sourceType: official
    permission: quoted
    publicUse:
      body: true
      asset: false
    licenseEvidence: 仅链接并概述官方公开文档，不复制页面正文。
  - title: Strapi 5 官方文档
    url: https://docs.strapi.io/
    sourceType: official
    permission: quoted
    publicUse:
      body: true
      asset: false
    licenseEvidence: 仅链接并概述官方公开文档，不复制页面正文。
tags: [ADR, 架构, VitePress, 搜索, CMS]
related: [about-maintenance, about-release-checklist, about-version-log, site-build-record]
---

# ADR-001：Wiki 平台演进策略

## 决策状态

- 状态：已接受
- 决策日期：2026-07-29
- 复核周期：每季度一次；任一触发条件达到时立即复核
- 当前结论：继续使用 VitePress 1.6.x、Git 评审和本地搜索，不引入外部搜索服务、动态 Wiki 运行时或内容数据库

## 决策背景

VitePress 负责把 Markdown、Frontmatter 和 Vue 组件构建为静态 HTML。官方将其定位为面向内容型站点的静态站点生成器，并支持在 Markdown 中嵌入交互组件。[VitePress 官方说明](https://vitepress.dev/guide/what-is-vitepress)

当前站点已经具备内容 Schema、来源与许可门禁、自动导航、中文搜索样本、移动端验证、发布清单和回滚演练。架构决策应依据稳定的使用压力，而不是依据一次性迁移工作量。

## 决策基线

下表记录 2026-07-29 作出架构决策时的基线，用于说明当时为何继续采用静态 Wiki。它是历史决策证据，不代表当前发布状态。

| 指标 | 2026-07-29 实测值 | 判断 |
| --- | ---: | --- |
| 公开 Markdown 页面 | 33 | 规模较小 |
| 可索引页面 | 20 | 本地索引压力低 |
| 页面状态 | 19 current、13 draft、1 stale | 已有治理流程 |
| 冻结中文查询 | 60 | 样本已覆盖标题、别名、错别字、机制和版本词 |
| 成品搜索 Top 5 | 100% | 高于 90% 门槛 |
| 精确查询 Top 1 | 100% | 无排序缺口 |
| 无结果章节建议 | 4/4 | 回退路径完整 |
| 本地搜索索引 | 约 120 KB，gzip 约 35 KB | 浏览器负担低 |
| 公开装备实体 | 93 | 现有前端数据模块可承载 |
| 待授权数据记录 | 225 | 继续隔离，不计入公开检索规模 |
| 最近 90 天涉及 `docs/` 的提交 | 15 | 以集中建设为主 |
| Git 提交者 | 1 人 | 无并发网页编辑需求 |
| 并行维护的游戏版本 | 1 个（2026-07） | 无多版本路由压力 |
| Lighthouse 代表页 | Performance 最低 0.99，Accessibility 1.00，SEO 1.00 | 静态架构满足发布门槛 |

最近 90 天的提交集中在站点建设阶段，不能直接解释为长期编辑频率。后续复核应使用正式发布后的月度数据，分别统计内容提交次数、活跃编辑人数、搜索失败样本和并行版本数。

### Phase 7 发布复核

截至 2026-07-30，站点已扩展到 97 个公开 Markdown 页面，其中 96 个为 `current`、0 个为 `draft`、1 个为经批准保留的 `stale` 装备查询页；225 条授权装备记录已进入公开规范数据集。冻结中文查询增至 100 条，Top 5 命中率为 95%，精确查询 Top 1 命中率为 100%。页面数量、搜索质量和协作人数仍未触发平台升级条件，因此原决策继续有效。

## 决策

站点继续采用以下边界：

1. VitePress 负责页面构建、路由、主题、SEO 和交互工具承载。
2. Markdown Frontmatter 是页面、导航、状态、版本、来源和相关页面的唯一登记入口。
3. Git 提交与拉取请求负责版本历史和评审。站点不增加浏览器端编辑、账户系统和运行时数据库。
4. VitePress 本地搜索继续服务当前规模。搜索质量由冻结中文样本和成品索引黑盒测试约束。
5. 结构化数据继续采用受 Schema 与版本基线保护的 JSON。待授权数据不得因架构升级而绕过公开许可门禁。

该决策保留静态部署、可重复构建和低运维成本。新增平台必须先证明当前架构已经达到量化边界。

## 备选方案与触发条件

| 方案 | 适用能力 | 项目触发条件 | 当前结论 |
| --- | --- | --- | --- |
| Pagefind | 构建后生成静态、分块加载的搜索索引；无需搜索服务运行时。[Pagefind 官方说明](https://pagefind.app/) | 公开页面达到 1000；或搜索索引 gzip 达到 2 MB；或成品 Top 5 连续两次发布低于 90%，且补充别名后仍不能恢复 | 不触发 |
| Algolia / DocSearch | 定时抓取站点并把记录发送到托管索引，适合跨站点、非结构化页面和外部搜索运营。[Algolia Crawler 官方说明](https://www.algolia.com/doc/tools/crawler/getting-started/overview) | 可搜索记录达到 10000；或必须提供跨站点抓取、分面筛选、搜索分析、近实时索引中的任意两项；同时明确外部服务预算、密钥和数据边界 | 不触发 |
| MediaWiki | 提供浏览器编辑、修订历史和用户权限，但需要 Web 服务器、PHP、数据库和维护脚本环境。[MediaWiki 安装要求](https://www.mediawiki.org/wiki/Manual:Installation_requirements) | 连续两个月每月活跃非 Git 编辑不少于 5 人；且至少 30% 内容变更因 Git 工作流受阻；同时已指定数据库、备份、安全升级和反滥用责任人 | 不触发 |
| Headless CMS | 提供内容类型、管理后台、发布、国际化、历史和 API。[Strapi 官方说明](https://docs.strapi.io/) | 同一内容需要投放到不少于 3 个渠道；或需要同时维护不少于 2 个语言/游戏版本且差异页面超过 20%；或编辑审批必须脱离 Git；同时已确定托管、备份和权限模型 | 不触发 |

阈值属于本项目的治理条件，不是各产品官方给出的通用容量上限。复核人员不得仅因页面数量增长就跳过搜索质量、协作方式和运维能力评估。

## 升级评估流程

触发条件达到后，维护人员应建立独立验证分支并完成以下步骤：

1. 记录触发指标、统计周期和原始报告路径。
2. 只选择与触发问题对应的一个候选方案进行概念验证。
3. 复用现有冻结中文搜索样本、许可过滤、URL 规则和工具回归测试。
4. 比较构建时间、首屏负载、搜索质量、迁移工作量、运行成本和回滚方式。
5. 验证候选方案不会把 `pending` 或 `restricted` 内容发送到公开索引或外部服务。
6. 形成新的 ADR。新 ADR 必须说明迁移范围、数据出口、身份权限、备份、监控和退出策略。

若概念验证不能保持现有质量门槛，系统应继续使用当前架构。升级失败不得改变现有页面 ID、公开 URL 和来源台账。

## 后果

当前方案不提供多人网页协作、运行时查询 API、跨站点搜索分析或内容工作流后台。编辑人员必须使用 Git 和现有模板。维护人员需要持续保留搜索样本、内容状态报告和版本漂移报告。

该限制与当前单一维护者、单一发布渠道和单一游戏版本相匹配。它同时避免引入数据库备份、账户安全、外部搜索密钥和双写同步等新的运维责任。

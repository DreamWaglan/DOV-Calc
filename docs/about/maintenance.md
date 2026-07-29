---
id: about-maintenance
title: Wiki 维护手册
description: 规定内容、来源、构建、发布与故障处理的日常维护职责、周期和交接记录。
section: about
order: 850
audience: [editor, maintainer]
contentType: site
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-29"
verifiedAt: "2026-07-29"
status: current
authors:
  - name: DOV-Calc 维护组
    role: 站点维护流程
reviewers:
  - name: 待指派
    role: 发布审核
sources:
  - title: DOV-Calc 站点维护记录
    assetId: site-maintenance-record
    sourceType: internal
    permission: owned
    publicUse:
      body: true
      asset: false
tags: [维护, 内容治理, 发布, 交接]
related: [about-contributing, about-release-checklist, about-rollback, about-version-log]
---

# Wiki 维护手册

维护工作的目标是让页面结论、来源证据、公开许可和构建产物保持一致。维护人员不得仅修改正文而跳过 Frontmatter、状态报告和版本日志。

## 维护职责

| 职责 | 主要工作 | 完成标志 |
| --- | --- | --- |
| 内容编辑 | 更新正文、适用版本、来源和相关页面 | 页面通过内容 Schema 与链接检查 |
| 事实审核 | 核对数值、规则、版本和引用范围 | `verifiedAt`、状态和审核记录已更新 |
| 数据维护 | 重新导入数据并检查稳定 ID、记录数与漂移 | 数据报告无失败项，基线变化有说明 |
| 发布维护 | 构建站点、生成发布清单、执行上线后检查 | 标签、提交和产物哈希能够互相核对 |
| 故障处理 | 判断影响、停止错误发布、选择回滚目标 | 站点恢复，故障与处置过程已记录 |

同一人可以承担多个职责，但事实审核不应省略。涉及待授权资料时，审核人员还必须确认公开使用范围没有扩大。

## 维护周期

### 每次内容变更

1. 核对页面 `gameVersion`、`sourceUpdatedAt`、`verifiedAt` 和 `status`。
2. 核对新增来源的类型、许可和 `publicUse`。
3. 运行内容 Schema、来源、链接和漂移检查。
4. 对用户可感知的变化更新版本日志。

### 每周检查

- 检查外部链接、站内链接和 404 报告；
- 检查标记为 `stale` 的页面及其审核负责人；
- 检查官方版本、公告和活动规则是否发生变化；
- 检查待授权资产是否仍被隔离在公开构建之外。

### 每个游戏版本

- 重跑装备、伤害和数据表基线；
- 把漂移结果分为预期更新、待复核和异常；
- 重新评估攻略结论的适用条件；
- 对搜索样本、移动端、可访问性、性能和 SEO 执行完整发布门禁。

## 内容状态处理

- `current` 表示结论已按页面所示版本完成核验。
- `draft` 表示结构可读，但事实或适用范围尚未完成审核。
- `stale` 表示已有版本漂移或证据过期，页面不得作为当前结论引用。
- `archived` 表示页面仅保留历史用途，导航和相关页面应转向替代内容。

状态变化必须同时更新原因、核验日期和版本日志。维护人员不得通过删除状态提示来掩盖过期内容。

## 资料与许可边界

本地 DOCX、XLSX 和图片的导入产物只承担盘点、结构映射和内部复核职责。来源许可为 `pending` 或 `restricted` 时，正文与素材必须保持 `publicUse.body: false` 和 `publicUse.asset: false`。许可变化应先更新来源台账，再决定是否进入公开页面。

## 日常验证

```powershell
pnpm test
pnpm test:base
pnpm test:search-built
pnpm test:e2e
pnpm test:perf
pnpm validate:stage5
pnpm docs:build
node scripts/release/create-release-manifest.mjs
node scripts/release/validate-release-manifest.mjs
node scripts/release/verify-rollback.mjs
```

`test:base` 检查根路径与子路径构建，`test:search-built` 检查真实构建搜索索引，`test:e2e` 检查移动端、键盘和核心交互，`test:perf` 检查 Lighthouse 门槛。`validate:stage5` 汇总发布质量门禁。

发布清单生成脚本会记录当前提交、工作树状态、候选标签、内容状态报告以及 `docs/.vitepress/dist` 的完整 SHA256 清单。工作树未提交或候选标签未指向当前提交时，清单保持 `candidate`，不得解释为已经发布。

## 维护交接

交接记录至少包含当前游戏版本、最新发布标签、最后成功提交、未解决的 `draft` 与 `stale` 页面、待授权来源、构建失败、外部服务异常和下一次复核日期。口头说明不能替代仓库中的版本日志、报告和发布清单。

---
id: about-contributing
title: 编辑与贡献规范
description: 说明新增或更新 Wiki 页面时必须填写的元数据、来源证据、审核步骤和版本维护要求。
section: about
order: 830
audience: [editor, maintainer]
contentType: site
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-29"
verifiedAt: "2026-07-30"
status: current
authors:
  - name: DOV-Calc 维护组
    role: 编辑流程维护
reviewers:
  - name: DOV-Calc 编辑审核组
    role: 内容治理审核
sources:
  - title: DOV-Calc 站点维护记录
    assetId: site-maintenance-record
    sourceType: internal
    permission: owned
    publicUse:
      body: true
      asset: false
tags: [贡献, Frontmatter, 审核, 版本]
related: [about-sources, about-version-log, site-build-record]
---

# 编辑与贡献规范

新增页面时，不要先改导航。页面的 Frontmatter 是标题、导航、版本状态、来源和相关页面的唯一登记位置。

## 新页面必须说明

- 稳定且唯一的页面 `id`；
- 标题、摘要、栏目、顺序与读者类型；
- 适用游戏版本、来源更新时间和核验日期；
- `draft`、`current`、`stale` 或 `archived` 状态；
- 作者、审核人和职责；
- 每个来源的类型、链接或资产 ID、许可与公开使用范围；
- 标签与相关页面 ID。

## 内容更新流程

1. 找到官方或可追溯的原始来源；
2. 判断是事实更新、攻略观点还是素材迁移；
3. 先登记来源与许可；
4. 修改正文和结构化数据；
5. 更新适用版本、核验日期与状态；
6. 运行 Schema、来源、链接和漂移检查；
7. 由对应章节的事实审核人复核；
8. 在版本日志中记录用户能感知的变化。

## 写作要求

- 先回答读者正在做什么，再解释原因；
- 固定数值必须注明版本和来源；
- 攻略观点要写适用条件，不包装成唯一答案；
- 不用长图代替正文，移动端应能逐段阅读；
- 不复制待授权文档、截图和角色头像；
- 发现信息不确定时，明确写“待复核”，不要补猜。

## 提交前检查

```powershell
pnpm test
pnpm validate:stage3
pnpm docs:build
```

这三项分别检查仓库回归、内容质量门禁和最终静态构建。

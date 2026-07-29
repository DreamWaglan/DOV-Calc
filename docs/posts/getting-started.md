---
id: site-build-record
title: 工具站搭建记录
description: 记录 DOV-Calc 从 VuePress 迁移到 VitePress 后的目录结构与维护方式。
section: about
order: 810
audience: [editor, maintainer]
contentType: changelog
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-29"
verifiedAt: "2026-07-29"
status: current
authors:
  - name: DOV-Calc 维护组
    role: 发布维护
reviewers:
  - name: 待指派
    role: 项目审核
sources:
  - title: DOV-Calc 站点维护记录
    assetId: site-maintenance-record
    sourceType: internal
    permission: owned
    publicUse:
      body: true
      asset: false
tags: [VitePress, 维护, 架构]
related: [posts-index, tools-index]
---

# 工具站搭建记录

当前站点基于 VitePress 1.6，使用 GitHub Pages 官方工作流部署，并预留了计算器工具和攻略笔记两个主要栏目。

## 目录结构

- `docs/index.md`：站点首页。
- `docs/tools/`：计算器工具页。
- `docs/posts/`：攻略笔记和更新记录。
- `docs/.vitepress/config.mts`：站点标题、搜索、主题和部署路径。
- `docs/.vitepress/navigation.mts`：从单一页面注册表派生导航和侧边栏。
- `docs/.vitepress/components/`：后续计算器会复用的 Vue 组件。
- `docs/.vitepress/theme/`：站点主题扩展、状态/来源组件和自定义样式。

## 维护建议

新增计算器时，先在工具页写清楚输入、输出和公式来源，再接入交互逻辑。这样可以先确认规则是否正确，再处理页面细节。

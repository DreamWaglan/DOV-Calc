---
title: 工具站搭建记录
date: 2026-05-14
---

# 工具站搭建记录

当前站点基于 VuePress 2，已经部署到 GitHub Pages，并预留了计算器工具和攻略笔记两个主要栏目。

## 目录结构

- `docs/README.md`：站点首页。
- `docs/tools/`：计算器工具页。
- `docs/posts/`：攻略笔记和更新记录。
- `docs/.vuepress/config.js`：站点标题、导航、侧边栏和部署路径。
- `docs/.vuepress/components/`：后续计算器会复用的 Vue 组件。
- `docs/.vuepress/styles/`：站点自定义样式。

## 维护建议

新增计算器时，先在工具页写清楚输入、输出和公式来源，再接入交互逻辑。这样可以先确认规则是否正确，再处理页面细节。

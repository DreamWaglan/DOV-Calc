---
id: tools-index
title: 计算器工具
description: 汇总伤害计算器、装备速查及后续养成与资源换算工具。
section: tools
order: 100
audience: [beginner, regular, advanced]
contentType: site
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-29"
verifiedAt: "2026-07-30"
status: current
authors:
  - name: DOV-Calc 维护组
    role: 工具维护
reviewers:
  - name: DOV-Calc 编辑审核组
    role: 工具审核
sources:
  - title: DOV-Calc 现有工具目录
    assetId: site-tool-catalog
    sourceType: internal
    permission: owned
    publicUse:
      body: true
      asset: false
tags: [工具, 计算器]
related: [site-home, tool-damage-calculator, tool-equipment-lookup]
---

# 便捷工具

这里是 DOV 便捷工具入口，提供了伤害计算、装备速查等功能。

<div class="tool-grid">
  <a class="tool-card" href="./dov-basic">
    <h3>伤害计算器</h3>
    <p>根据基础伤害、暴击期望和命中期望公式，快速计算最终期望伤害。</p>
  </a>
  <a class="tool-card" href="./equipment-lookup">
    <h3>装备速查</h3>
    <p>按装备分类、获取方式和关键词快速查找常用装备、简称、备注与来源。</p>
  </a>
  <article class="tool-card">
    <h3>养成收益计算</h3>
    <p>待补充：等级、突破、技能、装备等收益对比。</p>
  </article>
  <article class="tool-card">
    <h3>资源换算</h3>
    <p>待补充：体力、材料、商店兑换与活动产出估算。</p>
  </article>
</div>

<!-- 
## 新增工具页约定

1. 在 `docs/tools/` 下新增一个 Markdown 文件。
2. 使用 `CalculatorShell` 组件包住输入区和结果区。
3. 在 `docs/.vitepress/navigation.mts` 的页面注册表中加入新页面。
4. 在本页增加一张工具卡片作为入口。
 -->

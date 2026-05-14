---
title: 计算器工具
---

# 计算器工具

这里是 DOV 计算器工具入口。后续每个计算器可以独立成页，包含适用场景、输入参数、结果解释和公式来源。

<div class="tool-grid">
  <a class="tool-card" href="/DOV-Calc/tools/dov-basic.html">
    <h3>基础计算器模板</h3>
    <p>用于承载第一批计算逻辑的页面模板，已经预留输入、结果和备注区域。</p>
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

## 新增工具页约定

1. 在 `docs/tools/` 下新增一个 Markdown 文件。
2. 使用 `CalculatorShell` 组件包住输入区和结果区。
3. 在 `docs/.vuepress/config.js` 的 `sidebar['/tools/']` 中加入新页面。
4. 在本页增加一张工具卡片作为入口。

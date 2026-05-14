---
home: false
title: 首页
---

<section class="home-hero">
  <div>
    <h1>DOV 计算器工具集</h1>
    <p>面向《拂晓：胜利之刻》的计算器工具博客，用来沉淀公式、表格、构筑思路和常用换算。当前站点已经预留好工具页、文章页和可复用计算器组件，后续可以逐步接入具体功能。</p>
    <div class="home-hero__actions">
      <a class="home-hero__button home-hero__button--primary" href="/DOV-Calc/tools/">查看计算器</a>
      <a class="home-hero__button" href="/DOV-Calc/posts/">阅读攻略笔记</a>
    </div>
  </div>

  <aside class="home-hero__panel">
    <strong>模板结构</strong>
    <ul>
      <li>计算器入口与分类索引</li>
      <li>可复用的计算器页面壳</li>
      <li>攻略、更新日志和公式说明文章</li>
      <li>适配 GitHub Pages 的 VuePress 配置</li>
    </ul>
  </aside>
</section>

## 最近工具

<div class="tool-grid">
  <a class="tool-card" href="/DOV-Calc/tools/dov-basic.html">
    <h3>基础计算器模板</h3>
    <p>预留输入区、结果区和公式说明，等待接入第一批实际计算逻辑。</p>
  </a>
  <a class="tool-card" href="/DOV-Calc/tools/">
    <h3>工具索引</h3>
    <p>后续可以按养成、战斗、资源、装备等方向扩展。</p>
  </a>
</div>

## 内容规划

- `docs/tools/`：存放计算器工具页，每个工具可以独立维护说明、公式和交互组件。
- `docs/posts/`：存放攻略笔记、版本更新记录、公式验证过程。
- `docs/.vuepress/components/`：存放可复用 Vue 组件，例如计算器面板、输入控件和结果卡片。

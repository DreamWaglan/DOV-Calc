---
title: 基础计算器模板
---

<script setup>
import CalculatorShell from '../.vuepress/components/CalculatorShell.vue'
</script>

# 基础计算器模板

这个页面是后续具体工具的起点。当前先保留页面结构，等确定第一个计算需求后再替换输入项、公式和结果展示。

<CalculatorShell title="基础计算器模板" category="工具模板" status="待接入逻辑">
  <template #inputs>
    <p class="calculator-shell__muted">示例输入项：</p>
    <ul>
      <li>角色或舰灵基础属性</li>
      <li>等级、突破、技能等级</li>
      <li>装备、阵营、Buff 或活动加成</li>
    </ul>
  </template>

  <template #results>
    <p class="calculator-shell__muted">示例结果项：</p>
    <ul>
      <li>最终数值</li>
      <li>提升比例</li>
      <li>推荐优先级</li>
    </ul>
  </template>

  <template #notes>
    备注区可以放公式来源、版本号、数据更新时间和误差说明。
  </template>
</CalculatorShell>

## 后续接入点

- 将输入控件抽成更小的 Vue 组件，便于多个计算器复用。
- 把公式逻辑放到独立模块，避免 Markdown 页面变得难维护。
- 为关键公式补充样例数据，方便每次改动后验证结果。

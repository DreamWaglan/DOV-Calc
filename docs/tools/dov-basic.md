---
id: tool-damage-calculator
title: 伤害计算器
description: 按现有公式计算基础伤害、暴击期望、命中期望与最终单次期望伤害。
section: tools
order: 110
audience: [regular, advanced]
contentType: tool
gameVersion: "2026-07"
sourceUpdatedAt: "2026-05-14"
verifiedAt: "2026-07-30"
status: current
authors:
  - name: DOV-Calc 维护组
    role: 工具实现
reviewers:
  - name: DOV-Calc 工具与数据审核组
    role: 机制审核
sources:
  - title: 伤害计算器既有实现与黄金基线
    assetId: tool-damage-calculator-source
    sourceType: internal
    permission: owned
    publicUse:
      body: true
      asset: false
tags: [伤害, 暴击, 命中, 计算器]
related: [tools-index, tool-equipment-lookup, mechanics-damage-model, data-basic-attack-cd]
---

<script setup>
import DamageCalculator from '../.vitepress/components/DamageCalculator.vue'
</script>

# 伤害计算器

这是玩家维护的估算模型，不是官方结算器。它适合在同一组假设下比较方案；遭遇战进阶版、特殊敌人和新机制如果没有证据，不会自动并入公式。

<DamageCalculator />

公式假设、黄金样例和待验证机制见[伤害模型与计算边界](../mechanics/damage-model)。

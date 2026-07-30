---
id: tool-basic-attack-lookup
title: "普攻倍率查询器"
description: "按舰灵名称、工作表和字段筛选、排序 225 条普攻倍率与冷却数据。"
section: tools
order: 125
audience: [beginner, regular, advanced, editor]
contentType: tool
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-21"
verifiedAt: "2026-07-30"
status: current
authors:
  - name: DOV-Calc 数据组
    role: 规范数据建模与页面生成
reviewers:
  - name: DOV-Calc 版权与来源维护组
    role: 版权/来源责任人
  - name: DOV-Calc 事实审核组
    role: 事实审核人
  - name: DOV-Calc 发布维护组
    role: 公开范围审核人
sources:
  - title: "8.2 拂晓舰灵普攻倍率cd.xlsx"
    assetId: src-0c5b7db892f6
    sourceType: xlsx
    permission: authorized
    publicUse:
      body: true
      asset: false
    licenseEvidence: auth-user-declaration-20260730
    notes: 仅发布经审查的结构化投影，不提供原始 XLSX 或批量下载。
tags: ["普攻查询","倍率","CD","筛选","排序"]
related: ["tools-index","data-basic-attack-cd","tool-damage-calculator"]
---

<script setup>
import { markRaw, ref, shallowRef } from 'vue'

const BasicAttackExplorer = shallowRef(null)
const loadingBasicAttackExplorer = ref(false)

async function loadBasicAttackExplorer() {
  loadingBasicAttackExplorer.value = true
  BasicAttackExplorer.value = markRaw(
    (await import('../.vitepress/components/BasicAttackExplorer.vue')).default,
  )
}
</script>

# 普攻倍率查询器

查询器与[普攻数据页](../data/basic-attack-cd)读取同一个规范数据集，共 225 条、7 个工作表，适用版本为 2026-07。可按名称、舰种、伤害类型或备注搜索，并对倍率、CD 与射程执行稳定排序。

<div v-if="!BasicAttackExplorer" class="tool-loading">
  <p>查询器包含 225 条结构化记录，按需加载可减少移动端首屏开销。</p>
  <button
    type="button"
    :disabled="loadingBasicAttackExplorer"
    @click="loadBasicAttackExplorer"
  >
    {{ loadingBasicAttackExplorer ? '正在加载……' : '加载普攻查询器' }}
  </button>
</div>
<BasicAttackExplorer v-else />

## 使用边界

- 空值表示来源工作表未提供该项，不等于数值为 0；
- 同名舰灵可能对应不同普攻载荷或来源行，查询器会分别保留；
- 页面不提供 JSON、CSV 或原始 XLSX 下载；
- 数据问题请同时提供舰灵名称、工作表与页面显示的来源行号。

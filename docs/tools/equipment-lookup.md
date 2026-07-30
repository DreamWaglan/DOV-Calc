---
id: tool-equipment-lookup
title: 装备速查
description: 按装备分类、获取方式、名称与简称筛选现有装备数据。
section: tools
order: 120
audience: [beginner, regular, advanced]
contentType: tool
gameVersion: "2026-05"
sourceUpdatedAt: "2026-05-11"
verifiedAt: "2026-07-30"
status: stale
authors:
  - name: DOV-Calc 维护组
    role: 工具实现
reviewers:
  - name: DOV-Calc 装备数据审核组
    role: 装备数据审核
sources:
  - title: 仓库既有装备速查数据集
    assetId: tool-equipment-lookup-source
    sourceType: dataset
    permission: authorized
    publicUse:
      body: true
      asset: true
    licenseEvidence: 由仓库所有者提供并限定为既有公开工具的迁移保留
    notes: 数据版本 20260511；20260712 装备一图流已获展示授权，但尚未完成 93 条结构化数据的逐项合并复核。
tags: [装备, 速查, 数据]
related: [tools-index, tool-damage-calculator, topic-beginner-equipment, data-index]
---

<script setup>
import EquipmentLookup from '../.vitepress/components/EquipmentLookup.vue'
</script>

# 装备速查

数据来自 `拂晓：胜利之刻-装备速查表`，由`叶秋今天下班没`制作提供。

当前结构化数据版本为 2026-05-11；[2026-07-12 装备一图流](../topics/visual-guides/src-8862e9c4e1c0)已经完成展示授权，但还没有与 93 条结构化记录逐项合并。两者按版本分层保留：查询器用于检索旧基线中的名称、分类和获取说明，视觉资料用于查看较新参考；在完成逐项事实复核前，本页继续标记为 `stale`，不能当作当前版本的最终结论。

<EquipmentLookup />

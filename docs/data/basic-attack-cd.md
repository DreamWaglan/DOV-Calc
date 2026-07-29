---
id: data-basic-attack-cd
title: 普攻倍率与 CD 数据状态
description: 展示普攻倍率与冷却数据集的字段、导入质量和许可状态；数值明细在授权完成前不进入公开构建。
section: data
order: 610
audience: [regular, advanced, editor]
contentType: data
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-21"
verifiedAt: "2026-07-29"
status: draft
authors:
  - name: DOV-Calc 数据组
    role: XLSX 导入与数据建模
reviewers:
  - name: 待指派
    role: 数据与许可审核
sources:
  - title: 8.2 拂晓舰灵普攻倍率 CD.xlsx
    assetId: src-0c5b7db892f6
    sourceType: xlsx
    permission: pending
    publicUse:
      body: false
      asset: false
    notes: 已完成 7 个工作表和 225 条记录的内部导入校验；数值行不进入公开构建。
  - title: 拂晓：胜利之刻俾斯麦角色页
    url: "https://www.gamekee.com/fxslzk/152032.html"
    sourceType: wiki
    permission: quoted
    publicUse:
      body: true
      asset: false
      quoteOnly: true
  - title: 拂晓：胜利之刻新泽西角色页
    url: "https://www.gamekee.com/fxslzk/610002.html"
    sourceType: wiki
    permission: quoted
    publicUse:
      body: true
      asset: false
      quoteOnly: true
tags: [普攻倍率, CD, XLSX, 数据许可]
related: [data-index, mechanics-damage-model, tool-damage-calculator]
---

# 普攻倍率与 CD 数据状态

本页的数据模型已经建立，数值明细仍处于隔离状态。

## 当前导入结果

- 7 个工作表均通过预期名称、表头和字段映射检查；
- 共生成 225 条稳定 ID 记录；
- 名称继承、空单元格、数值范围和未知字段已经校验；
- 每条记录保留工作表与行号，便于回到源文件复核；
- 导入结果标记为 `permission: pending`、`publishable: false`。

## 计划公开的字段

授权完成后，数据页将支持：

- 舰灵名称与舰种；
- 主炮倍率、冷却、射程与伤害类型；
- 鱼雷或航空相关倍率、冷却与范围；
- 每轮弹数等补充字段；
- 适用版本、核验日期和来源。

## 为什么现在看不到数值表

源 XLSX 的作者、转载范围和公开数据许可还没有签核。把文件交给导入程序，不等于允许把整张数表发布到网页。当前页面只公开导入质量与数据结构，不加载 `content/imports/xlsx/basic-attack/records.json`，构建产物中也不会包含这 225 条数值记录。

需要比较伤害模型时，可以使用[伤害计算器](../tools/dov-basic)的既有输入，但不要用缺少授权和版本审核的数据批量填充。

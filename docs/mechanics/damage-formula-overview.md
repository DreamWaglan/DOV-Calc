---
id: mechanics-damage-formula-overview
title: "伤害构成一：总公式"
description: "迁移伤害公式与技能实数伤害总览。"
section: mechanics
order: 310
audience: ["regular","advanced"]
contentType: guide
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-21"
verifiedAt: "2026-07-30"
status: draft
authors:
  - name: DOV-Calc 内容维护组
    role: 授权资料迁移编辑
reviewers:
  - name: DOV-Calc 事实审核组
    role: 进阶内容事实审核
sources:
  - title: "8.1 拂晓伤害计算构成.docx"
    assetId: src-c8852cf69a7b
    sourceType: docx
    permission: authorized
    publicUse:
      body: true
      asset: false
    notes: 已迁移授权正文；原始 DOCX 和媒体字节不公开，配套图片仅发布授权响应式派生图。
tags: ["伤害","公式","实数伤害"]
related: ["mechanics-damage-model","mechanics-attack-power","media-source-c8852cf69a7b"]
---
# 伤害构成一：总公式
> [!WARNING] 审核状态
> 本页已完成授权原稿的可搜索迁移与元素归属，但版本数值、公式复算和媒体说明仍在 Phase 7 事实审核队列。页面保持 `draft`，不作为当前版本的最终结论。
拂晓伤害构成解析

本文旨在系统解析拂晓的伤害构成机制，提供量化计算舰灵输出能力的标准化方法，辅助玩家评估阵容输出效能是否达到关卡阈值。

## 伤害公式

拂晓的伤害构成由以下公式得出：

最终伤害=攻击力×倍率区×修正区

+技能实数伤害hp damage

其中，

修正区=攻击力攻击力+1.3×防御力×暴击伤害修正×弹种修正×增伤修正×减伤修正 ×等级修正（仅pve）

（注：最终伤害存在±10%随机浮动，因波动范围可控，常规测算中可忽略不计。）

下面对公式中的各项参数逐一进行说明：

## 技能实数伤害（hp damage）：

技能实数伤害为技能造成伤害的固定值。每位舰灵的技能实数伤害不同，目前尚未找到标明其具体数值的资料，由于存在伤害浮动无法测量。计算过程中，可以将此处视为。
下一章：[攻击力](./attack-power)。

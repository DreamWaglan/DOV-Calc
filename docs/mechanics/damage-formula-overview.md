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
status: current
authors:
  - name: 拂晓凤栖攻略组
    role: 授权资料迁移编辑
reviewers:
  - name: 暂无
    role: 进阶内容事实审核
sources:
  - title: "8.1 拂晓伤害计算构成.docx"
    assetId: src-c8852cf69a7b
    sourceType: docx
    permission: authorized
    publicUse:
      body: true
      asset: false
    notes: 已迁移授权正文；原始 DOCX 文件不开放下载，已授权的 DOCX 内嵌原图可在正文显示并下载。
tags: ["伤害","公式","实数伤害"]
related: ["mechanics-damage-model","mechanics-attack-power","media-source-c8852cf69a7b"]
---
# 伤害构成一：总公式
拂晓伤害构成解析
<!-- source-body:1:src-c8852cf69a7b:paragraph:0f7cf37ba2245a20:paragraph -->

<!-- source-body:2:src-c8852cf69a7b:paragraph:f9ea719e5aae5e48:paragraph -->

本文旨在系统解析拂晓的伤害构成机制，提供量化计算舰灵输出能力的标准化方法，辅助玩家评估阵容输出效能是否达到关卡阈值。
<!-- source-body:3:src-c8852cf69a7b:paragraph:22a46f2b249cc0c4:paragraph -->

## 伤害公式
<!-- source-body:4:src-c8852cf69a7b:heading:3847b866f325123a:paragraph -->

拂晓的伤害构成由以下公式得出：
<!-- source-body:5:src-c8852cf69a7b:paragraph:66fc5aa6137f5897:paragraph -->

最终伤害=攻击力×倍率区×修正区
<!-- source-body:6:src-c8852cf69a7b:paragraph:72bb64bc0abb3c17:paragraph -->

+技能实数伤害hp damage
<!-- source-body:7:src-c8852cf69a7b:paragraph:c225b006b6c15d81:paragraph -->

其中，
<!-- source-body:8:src-c8852cf69a7b:paragraph:830e2cdbdad7875a:paragraph -->

修正区=攻击力攻击力+1.3×防御力×暴击伤害修正×弹种修正×增伤修正×减伤修正 ×等级修正（仅pve）
<!-- source-body:9:src-c8852cf69a7b:paragraph:460c35aa4789bbd1:paragraph -->

（注：最终伤害存在±10%随机浮动，因波动范围可控，常规测算中可忽略不计。）
<!-- source-body:10:src-c8852cf69a7b:paragraph:49766a86bbb5c3bd:paragraph -->

下面对公式中的各项参数逐一进行说明：
<!-- source-body:11:src-c8852cf69a7b:paragraph:da1c4fd047e375e1:paragraph -->

## 技能实数伤害（hp damage）：
<!-- source-body:12:src-c8852cf69a7b:heading:c7949832bfef0805:paragraph -->

技能实数伤害为技能造成伤害的固定值。每位舰灵的技能实数伤害不同，目前尚未找到标明其具体数值的资料，由于存在伤害浮动无法测量。计算过程中，可以将此处视为。
<!-- source-body:13:src-c8852cf69a7b:paragraph:0364f6f3e4c69b52:paragraph -->
下一章：[攻击力](./attack-power)。

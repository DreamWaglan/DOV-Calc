---
id: topic-beginner-equipment
title: 新手配装速查
description: 从舰种、装备位、主效果和获取成本选择毕业或过渡装备，并识别不能套模板的特殊角色。
section: topics
order: 430
audience: [new-player, beginner, regular]
contentType: topic
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-29"
verifiedAt: "2026-07-29"
status: draft
authors:
  - name: DOV-Calc 内容组
    role: 配装速查编辑
reviewers:
  - name: 待指派
    role: 装备数据审核
sources:
  - title: 拂晓基础向介绍
    url: "https://www.bilibili.com/opus/1040399803944534025"
    sourceType: author-post
    publishedAt: "2025-03-04"
    author: 拂晓-凤栖攻略组
    permission: quoted
    publicUse:
      body: true
      asset: false
      quoteOnly: true
  - title: 萌新入门配装推荐
    assetId: src-3f75f2339e43
    sourceType: image
    permission: pending
    publicUse:
      body: false
      asset: false
    notes: 原图和装备图标未获公开许可；本页为独立撰写的选择流程，不迁移装备名单。
tags: [装备, 配装, 过渡装备, 一图流正文版]
related: [topic-pve-selection, tool-equipment-lookup, combat-pve-team-building]
---

# 新手配装速查

配装先解决“这个位置要做什么”，再比较具体装备。把毕业推荐直接套给所有角色，常常会浪费强化材料。

## 配装顺序

1. 确认舰种和允许装备的类型；
2. 确认角色在当前队伍里的职责；
3. 选择能直接解决瓶颈的主装备；
4. 用设备补输出、生存或命中等短板；
5. 检查获取难度和强化成本；
6. 实战验证后再继续强化。

## 毕业与过渡

| 类型 | 判断方式 |
| --- | --- |
| 毕业装备 | 长期适配当前职责，投入后不容易被同类替换 |
| 过渡装备 | 当前可得、能解决问题，后续可以平滑替换 |
| 下位替代 | 功能方向相同，但数值、覆盖或触发条件较弱 |
| 专用方案 | 只适合特定角色、技能或关卡，不应推广为通用模板 |

对新人来说，一套已经强化、功能正确的过渡装，往往比一件暂时养不起的毕业装备更有用。

## 输出设备还是生存设备

- 前线很快减员：先让角色能完成整场战斗。
- 能稳定站住但超时：再提高输出覆盖和技能利用。
- 命中、触发或冷却出现问题：不要只堆面板攻击。
- 自动作战偶发翻车：留出容错，不追求纸面极限。

## 识别特殊角色

出现以下情况时，停止套通用模板，去查角色或技能页：

- 装备类型会随改造或状态变化；
- 技能明确依赖某类装备、弹种或属性；
- 角色的主要价值来自辅助而非直接输出；
- 队伍需要特定技能循环；
- 当前关卡有特殊目标或限制。

现有[装备速查工具](../tools/equipment-lookup)仍使用旧数据基线，页面会显示“待复核”。在版本漂移解决前，用它查名称和分类，不要把获取方式与数值当作最新结论。

## 装备数据版本说明

当前装备速查工具保留 `20260511` 的 93 条结构化数据，页面状态维持为 `stale`。`20260712` 装备一图流已经登记为较新的参考来源，但尚未完成逐项结构化比对和事实审核，因此不合并进现有 JSON，也不把旧工具标记为最新版。阅读本页时，可以把工具用于名称、分类和旧版获取说明检索；涉及最新毕业装备、获取方式或数值结论时，应等待后续复核页面或新版数据集。

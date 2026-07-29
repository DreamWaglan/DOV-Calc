---
id: combat-encounter
title: 遭遇战作战方法
description: 按多队连续作战、总伤害结算和当期规则分配舰队，避免把单队木桩结论直接套到活动中。
section: combat
order: 340
audience: [regular, advanced]
contentType: guide
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-09"
verifiedAt: "2026-07-29"
status: draft
authors:
  - name: DOV-Calc 内容组
    role: 遭遇战章节编辑
reviewers:
  - name: 待指派
    role: 遭遇战版本审核
sources:
  - title: 拂晓游戏介绍与 3.4 版本信息
    url: "https://www.taptap.cn/app/187170/all-info"
    sourceType: official
    updatedAt: "2026-07-09"
    permission: quoted
    publicUse:
      body: true
      asset: false
      quoteOnly: true
  - title: 更新公告丨遭遇战，防卫战活动开启
    url: "https://www.taptap.cn/moment/785198236783609748"
    sourceType: official
    permission: quoted
    publicUse:
      body: true
      asset: false
      quoteOnly: true
  - title: 7.2 遭遇战攻略.docx
    assetId: src-d35e870ffcd7
    sourceType: docx
    permission: pending
    publicUse:
      body: false
      asset: false
    notes: 仅完成内部结构导入，未复用阵容、数值、截图或表格。
tags: [遭遇战, 总伤害, 多队作战]
related: [combat-index, combat-pve-team-building, mechanics-damage-model, tool-damage-calculator]
---

# 遭遇战作战方法

2026 年 7 月公开版本说明提到，遭遇战进阶版会调整部分伤害计算机制，并采用多支舰队连续作战、按总伤害结算的结构。它不是“把单队最高伤害复制四次”这么简单。

## 先确认当期结算

- 是累计伤害、单场伤害，还是分阶段目标；
- 每支队伍是否连续出击；
- 角色、装备和支援能否跨队重复；
- 敌方状态是否在队伍之间继承；
- 当期是否有专门的增益、减益或排名规则。

这些规则发生变化时，旧攻略的阵容顺序和伤害目标会一起失效。

## 分配队伍的原则

1. 把最依赖特定支援或装备的核心队先确定；
2. 避免多队争用同一个无法重复的关键资源；
3. 给每队保留足够命中、生存和技能覆盖；
4. 根据敌方阶段决定爆发队与稳定队的顺序；
5. 先完成可复现的总伤害，再追求极限单场。

## 复盘总伤害

按队伍分别记录战斗时间、技能空转、命中、生存和实际伤害。某一队偏低时，先找它自己的问题，不要立即拆掉其他三队。

[伤害计算器](../tools/dov-basic)可以比较输入条件下的模型结果，但它不是官方结算器。遭遇战规则如果增加独立修正，必须先补充机制证据和黄金样例，不能直接把倍率塞进现有公式。

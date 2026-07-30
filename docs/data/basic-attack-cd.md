---
id: data-basic-attack-cd
title: "舰灵普攻倍率与 CD 数据库"
description: "查询 7 个工作表、225 条舰灵普攻倍率、冷却、射程、伤害类型与每轮弹数记录。"
section: data
order: 610
audience: [beginner, regular, advanced, editor]
contentType: data
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
tags: ["普攻倍率","CD","射程","舰灵数据","2026-07"]
related: ["data-index","tool-basic-attack-lookup","mechanics-damage-model","tool-damage-calculator"]
---

<script setup>
import BasicAttackExplorer from '../.vitepress/components/BasicAttackExplorer.vue'
</script>

# 舰灵普攻倍率与 CD 数据库

本页公开的是授权工作簿的结构化投影，适用版本为 **2026-07**。数据经过 7/7 工作表、225/225 记录、字段类型、稳定 ID、来源哈希和公开边界校验；原始 XLSX 与批量下载保持关闭。

> [!IMPORTANT]
> “已审查”表示网页数值与所列来源版本一致，不代表游戏后续版本不会调整。用于计算或攻略判断前，请先核对页面顶部版本。

## 在线筛选

<BasicAttackExplorer />

## 分工作表浏览

- [驱逐（50 条）](./basic-attacks/destroyer)
- [轻巡雷巡（38 条）](./basic-attacks/light-cruiser-torpedo-cruiser)
- [重巡（26 条）](./basic-attacks/heavy-cruiser)
- [战列战巡重炮（43 条）](./basic-attacks/battleship-battlecruiser)
- [轻母（18 条）](./basic-attacks/light-carrier)
- [航母装母（44 条）](./basic-attacks/carrier-armored-carrier)
- [航战水母（6 条）](./basic-attacks/aviation-battleship-seaplane)

## 字段字典

| 字段 | 中文含义 | 类型 | 空值 | 单位 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `worksheet` | 来源工作表 | string | 必填 | — | 记录在授权工作簿中的来源工作表。 |
| `worksheetRow` | 来源工作表行号 | number | 必填 | 行 | 记录在来源工作表中的原始行号，用于追溯与复核。 |
| `rowNote` | 来源行备注 | string | 可空 | — | 来源行备注；空值表示来源工作表未提供该项。 |
| `gunMultiplier` | 炮击伤害倍率 | number | 可空 | 倍率 | 炮击伤害倍率；空值表示来源工作表未提供该项。 |
| `gunCdSeconds` | 炮击冷却秒数 | number | 可空 | 秒 | 炮击冷却秒数；空值表示来源工作表未提供该项。 |
| `gunRangeUnits` | 炮击有效射程 | number | 可空 | 游戏内射程单位 | 炮击有效射程；空值表示来源工作表未提供该项。 |
| `gunDamageType` | 炮击伤害类型 | string | 可空 | — | 炮击伤害类型；空值表示来源工作表未提供该项。 |
| `torpedoMultiplier` | 雷击伤害倍率 | number | 可空 | 倍率 | 雷击伤害倍率；空值表示来源工作表未提供该项。 |
| `torpedoNote` | 雷击备注 | string | 可空 | — | 雷击备注；空值表示来源工作表未提供该项。 |
| `torpedoCdSeconds` | 雷击冷却秒数 | number | 可空 | 秒 | 雷击冷却秒数；空值表示来源工作表未提供该项。 |
| `torpedoRangeUnits` | 雷击有效射程 | number | 可空 | 游戏内射程单位 | 雷击有效射程；空值表示来源工作表未提供该项。 |
| `projectilesPerRound` | 每轮弹数或架数 | string | 可空 | 发或架/轮 | 每轮弹数或架数；空值表示来源工作表未提供该项。 |
| `mainGunMultiplier` | 主炮伤害倍率 | number | 可空 | 倍率 | 主炮伤害倍率；空值表示来源工作表未提供该项。 |
| `mainGunCdSeconds` | 主炮冷却秒数 | number | 可空 | 秒 | 主炮冷却秒数；空值表示来源工作表未提供该项。 |
| `mainGunRangeUnits` | 主炮有效射程 | number | 可空 | 游戏内射程单位 | 主炮有效射程；空值表示来源工作表未提供该项。 |
| `mainGunDamageType` | 主炮伤害类型 | string | 可空 | — | 主炮伤害类型；空值表示来源工作表未提供该项。 |
| `mainGunProjectilesPerRound` | 主炮每轮弹数 | string | 可空 | 发或架/轮 | 主炮每轮弹数；空值表示来源工作表未提供该项。 |
| `secondaryGunMultiplier` | 副炮伤害倍率 | number | 可空 | 倍率 | 副炮伤害倍率；空值表示来源工作表未提供该项。 |
| `secondaryGunCdSeconds` | 副炮冷却秒数 | number | 可空 | 秒 | 副炮冷却秒数；空值表示来源工作表未提供该项。 |
| `secondaryGunRangeUnits` | 副炮有效射程 | number | 可空 | 游戏内射程单位 | 副炮有效射程；空值表示来源工作表未提供该项。 |
| `secondaryGunDamageType` | 副炮伤害类型 | string | 可空 | — | 副炮伤害类型；空值表示来源工作表未提供该项。 |
| `secondaryGunProjectilesPerRound` | 副炮每轮弹数 | string | 可空 | 发或架/轮 | 副炮每轮弹数；空值表示来源工作表未提供该项。 |
| `aircraftMultiplier` | 舰载机伤害倍率 | number | 可空 | 倍率 | 舰载机伤害倍率；空值表示来源工作表未提供该项。 |
| `aircraftCdSeconds` | 舰载机冷却秒数 | number | 可空 | 秒 | 舰载机冷却秒数；空值表示来源工作表未提供该项。 |
| `aircraftRangeUnits` | 舰载机有效射程 | number | 可空 | 游戏内射程单位 | 舰载机有效射程；空值表示来源工作表未提供该项。 |
| `aircraftDamageType` | 舰载机伤害类型 | string | 可空 | — | 舰载机伤害类型；空值表示来源工作表未提供该项。 |
| `fighterMultiplier` | 战斗机巡航倍率 | number | 可空 | 倍率 | 战斗机巡航倍率；空值表示来源工作表未提供该项。 |
| `fighterCdSeconds` | 战斗机巡航冷却秒数 | number | 可空 | 秒 | 战斗机巡航冷却秒数；空值表示来源工作表未提供该项。 |
| `fighterRangeUnits` | 战斗机巡航有效射程 | number | 可空 | 游戏内射程单位 | 战斗机巡航有效射程；空值表示来源工作表未提供该项。 |
| `attackMultiplier` | 通用普攻伤害倍率 | number | 可空 | 倍率 | 通用普攻伤害倍率；空值表示来源工作表未提供该项。 |
| `attackCdSeconds` | 通用普攻冷却秒数 | number | 可空 | 秒 | 通用普攻冷却秒数；空值表示来源工作表未提供该项。 |
| `attackRangeUnits` | 通用普攻有效射程 | number | 可空 | 游戏内射程单位 | 通用普攻有效射程；空值表示来源工作表未提供该项。 |
| `attackDamageType` | 通用普攻伤害类型 | string | 可空 | — | 通用普攻伤害类型；空值表示来源工作表未提供该项。 |

## 数据完整性

- 规范记录：225 条；
- 工作表：7 个；
- 来源资产：`src-0c5b7db892f6`；
- 来源 SHA-256：`0f1e9968adbcd3dcdc669168af97f0f40d5de55f928d645e99a9e30d95bf0379`；
- 记录集 SHA-256：`d3c3eb10c53dc2923b3fad4648173f08f8f172ce09e7a9cb75af7ee76daf0d4d`；
- 审查日期：2026-07-30；
- 公开范围：正文、站内搜索、结构化交互；不提供源文件或下载接口。

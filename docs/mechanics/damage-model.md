---
id: mechanics-damage-model
title: 伤害模型与计算边界
description: 解释现有伤害计算器的输入、乘区、暴击与命中期望，并区分已锁定行为、待验证机制和官方规则。
section: mechanics
order: 510
audience: [regular, advanced, editor]
contentType: mechanic
gameVersion: "2026-07"
sourceUpdatedAt: "2026-05-14"
verifiedAt: "2026-07-29"
status: draft
authors:
  - name: DOV-Calc 维护组
    role: 机制模型维护
reviewers:
  - name: 待指派
    role: 伤害机制审核
sources:
  - title: 伤害计算器既有实现与黄金基线
    assetId: tool-damage-calculator-source
    sourceType: internal
    permission: owned
    publicUse:
      body: true
      asset: false
  - title: 拂晓游戏介绍与 3.4 版本信息
    url: "https://www.taptap.cn/app/187170/all-info"
    sourceType: official
    updatedAt: "2026-07-09"
    permission: quoted
    publicUse:
      body: true
      asset: false
      quoteOnly: true
  - title: 8.1 拂晓伤害计算构成.docx
    assetId: src-c8852cf69a7b
    sourceType: docx
    permission: pending
    publicUse:
      body: false
      asset: false
    notes: 只登记内部导入和待核验机制，不公开文档公式、表格或截图。
tags: [伤害模型, 乘区, 暴击, 命中, 假设]
related: [mechanics-index, tool-damage-calculator, combat-encounter, data-basic-attack-cd]
---

# 伤害模型与计算边界

本站现有计算器是一套玩家模型，不是官方结算器。它能稳定复算自己的黄金样例，但没有证据证明它等同于游戏服务器的完整结算公式。

## 当前模型计算什么

计算过程大致分为：

1. 按伤害类型选择基础攻击与对应防御；
2. 合并固定攻击与攻击加成；
3. 应用技能倍率、防御衰减和等级修正；
4. 合并阵型、索敌或制空等状态修正；
5. 计算暴击率、暴击期望和命中率；
6. 得到单次期望伤害。

这套顺序描述的是仓库当前实现，不代表官方公开顺序。

## 已锁定的行为

黄金样例覆盖默认鱼雷机、炮击零防御边界、暴击率下限、制空优势、同航单纵阵、梯形阵暴击、等级修正上限和固定伤害等场景。重构工具时，所有样例必须在数值容差内保持一致。

## 仍待验证的机制

- 遭遇战进阶版的独立伤害计算变化；
- 新版本角色、装备和敌方机制增加的乘区；
- 社区资料中的甲弹修正、技能特例和特殊伤害；
- 服务端四舍五入、取整与结算顺序；
- 待授权《拂晓伤害计算构成》中的完整推导。

## 使用计算器时

把结果用于比较同一模型下的两个方案，不要把它当作保证实际伤害的承诺。输入来源、版本或机制不确定时，结果也应标为待验证。

打开[伤害计算器](../tools/dov-basic)。

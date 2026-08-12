---
id: mechanics-damage-multipliers
title: "伤害构成四：倍率、暴击与弹种"
description: "迁移倍率区、暴击伤害修正和弹种修正。"
section: mechanics
order: 340
audience: ["advanced"]
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
tags: ["伤害","倍率","暴击","弹种"]
related: ["mechanics-defense-power","mechanics-damage-bonuses","media-source-c8852cf69a7b"]
---
# 伤害构成四：倍率、暴击与弹种
## 倍率区：
<!-- source-body:375:src-c8852cf69a7b:heading:09063c8535900d43:paragraph -->

### 3.1 什么是倍率
<!-- source-body:376:src-c8852cf69a7b:heading:5a3f823933d40638:paragraph -->

指技能倍率与普攻倍率。技能倍率可在面板中点击技能查看，普攻倍率请查看附表（拂晓舰灵普攻倍率）。
<!-- source-body:377:src-c8852cf69a7b:paragraph:02f0266b30d81ab0:paragraph -->

<!-- source-body:378:src-c8852cf69a7b:paragraph:5c367ff77187b924:paragraph -->

<!-- source-body:379:src-c8852cf69a7b:paragraph:73ee6891d4f2f900:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-cf1372a45e616b03-6b0d2d142332857c"
  alt="《8.1 拂晓伤害计算构成.docx》“3.1 什么是倍率”章节的相关插图；DOCX occurrence 6b0d2d142332857c"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/a3fecf46de0b1792/original.png"
  :width="1036"
  :height="348"
/>

倍率示意图
<!-- source-body:380:src-c8852cf69a7b:paragraph:8988ed9fda6255f1:paragraph -->

如图中倍率为2900%炮击，1914%鱼雷。
<!-- source-body:381:src-c8852cf69a7b:paragraph:ee32d6d80f8fd3fe:paragraph -->

普攻CD受装填值影响，具体公式如下：
<!-- source-body:382:src-c8852cf69a7b:paragraph:f6943b17ac4053d0:paragraph -->

普攻CD缩减=面板装填值×普攻理论CD ×100%
<!-- source-body:383:src-c8852cf69a7b:paragraph:bd1858a73d0eab1b:paragraph -->

实际CD=1-普攻CD缩减×理论CD
<!-- source-body:384:src-c8852cf69a7b:paragraph:4c21c2a3a46338cf:paragraph -->

注：普攻CD缩减最高不超过%，超过部分依旧按%计算。
<!-- source-body:385:src-c8852cf69a7b:paragraph:adeb45d01f6e8ec6:paragraph -->

普攻理论CD请查看附表（拂晓舰灵普攻倍率CD）。目前可通过装填改变主副循环为主炮炮弹战列战巡（可查看《舰灵主副炮装填循环数值表》）与雷巡（装填值需≥）。
<!-- source-body:386:src-c8852cf69a7b:paragraph:f154bbee123fbcfc:paragraph -->

### 3.2 影响因素
<!-- source-body:387:src-c8852cf69a7b:heading:5a1f96ce45224545:paragraph -->

倍率区数值仅受技能等级影响。舰灵通过技能学院学习技能等级提升倍率。实际计算时直接查看技能面板中倍率即可。
<!-- source-body:388:src-c8852cf69a7b:paragraph:4ebdc77d080bbc99:paragraph -->

羁绊技能倍率与其等级有关，而其等级按舰灵必杀技与旗舰技等级换算而成，为该舰灵的必杀技与旗舰技等级之和除以后向下取整。例如级必杀级旗舰，羁绊技等级为；级必杀级旗舰，羁绊技等级为。
<!-- source-body:389:src-c8852cf69a7b:paragraph:d0139890596f80db:paragraph -->

## 暴击伤害修正
<!-- source-body:390:src-c8852cf69a7b:heading:4d38914c2ee7b133:paragraph -->

### 什么是暴击伤害修正
<!-- source-body:391:src-c8852cf69a7b:heading:7e2b6c175dadcffe:paragraph -->

暴击伤害为暴击触发时产生的额外倍率伤害，属于独立乘区。默认值为140%。无暴击时该乘区默认100%。
<!-- source-body:392:src-c8852cf69a7b:paragraph:f7bfb879da033ada:paragraph -->

### 4.2 影响因素
<!-- source-body:393:src-c8852cf69a7b:heading:6f0a6cbbe9eb6b17:paragraph -->

可调控范围内，仅有三件装备与一种阵型影响，分别为：
<!-- source-body:394:src-c8852cf69a7b:paragraph:bbdaa533c2ae31ee:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:9be7840a47446f90"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:9be7840a47446f90:1:1"><ResponsiveMedia media-id="wiki-media-111618186805bc21-508917be4527740a" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 508917be4527740a" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/ef853479b298db78/original.png" :width="158" :height="272" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:9be7840a47446f90:1:2"><ResponsiveMedia media-id="wiki-media-7f12cb710fa1fadc-b6ba39689fd156b1" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence b6ba39689fd156b1" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/f9ffbceb4279fb41/original.png" :width="215" :height="370" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:9be7840a47446f90:1:3"><ResponsiveMedia media-id="wiki-media-0a56965a7ca3c74d-f486e3918c57fd6e" alt="《8.1 拂晓伤害计算构成.docx》“4.2 影响因素”章节的相关插图；DOCX occurrence f486e3918c57fd6e" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/b5573739d3aae93a/original.png" :width="160" :height="276" /></th></tr></thead></table></div>
<!-- source-body:395:src-c8852cf69a7b:table:9be7840a47446f90:table -->

<!-- source-body:396:src-c8852cf69a7b:paragraph:423bbbc0baa4abc8:paragraph -->

图-1 暴击伤害装备
<!-- source-body:397:src-c8852cf69a7b:paragraph:64ea8d3de7e28081:paragraph -->

<!-- source-body:398:src-c8852cf69a7b:paragraph:6612f6ad2f2d6647:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-54fc69946e42d316-c457c0daeac6e3d7"
  alt="《8.1 拂晓伤害计算构成.docx》“4.2 影响因素”章节的相关插图；DOCX occurrence c457c0daeac6e3d7"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/42ae5a4d39e226a1/original.jpg"
  :width="576"
  :height="688"
/>

图-2 梯形阵
<!-- source-body:399:src-c8852cf69a7b:paragraph:79df63da8f41831f:paragraph -->

按照攻击，700%倍率，敌方防御力，增伤区135%，无减伤修正计算，梯形阵比无暴击伤害加成下提升约3.57%；满级高脚杯提升约60.82%（计算装备增加数值），满级BTD-1毁灭者提升约39.91%（计算装备增加数值），满级B-25提升约73.36%（计算装备增加数值）。
<!-- source-body:400:src-c8852cf69a7b:paragraph:e1afbe99f3c38ccb:paragraph -->

部分舰灵独有属性（旗舰技，天赋，技能）也会增加暴击伤害，案例如下：
<!-- source-body:401:src-c8852cf69a7b:paragraph:07b0f623a54baaa0:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:83271d1b2981dd78"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:83271d1b2981dd78:1:1"><ResponsiveMedia media-id="wiki-media-c72c4d2cda2256d8-63e60a87f05dde04" alt="《8.1 拂晓伤害计算构成.docx》“4.2 影响因素”章节的相关插图；DOCX occurrence 63e60a87f05dde04" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/81745de73a13b760/original.png" :width="432" :height="157" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:83271d1b2981dd78:1:2"><ResponsiveMedia media-id="wiki-media-3ac780659071a76a-366748e337e3b016" alt="《8.1 拂晓伤害计算构成.docx》“4.2 影响因素”章节的相关插图；DOCX occurrence 366748e337e3b016" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/691df946dbec06b3/original.png" :width="433" :height="156" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:83271d1b2981dd78:2:1"><ResponsiveMedia media-id="wiki-media-898fae0326030e1d-97e42b591a00ca34" alt="《8.1 拂晓伤害计算构成.docx》“4.2 影响因素”章节的相关插图；DOCX occurrence 97e42b591a00ca34" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/9e419738e9a9cd87/original.png" :width="432" :height="163" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:83271d1b2981dd78:2:2"><ResponsiveMedia media-id="wiki-media-a62034dedefea5d9-8d3ca025588dcd90" alt="《8.1 拂晓伤害计算构成.docx》“4.2 影响因素”章节的相关插图；DOCX occurrence 8d3ca025588dcd90" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/bf8b05e9f01729c5/original.png" :width="351" :height="135" /></td></tr></tbody></table></div>
<!-- source-body:402:src-c8852cf69a7b:table:83271d1b2981dd78:table -->

暴击伤害技能示意图
<!-- source-body:403:src-c8852cf69a7b:paragraph:4b9cf6767f6d46a3:paragraph -->

由于此处并非每位舰灵都能调整，且为独立乘区，暂不给出提升率计算。
<!-- source-body:404:src-c8852cf69a7b:paragraph:fba26f7f1a12dfc7:paragraph -->

<!-- source-body:405:src-c8852cf69a7b:paragraph:4c8fb7c8f4d1065d:paragraph -->

## 弹种修正
<!-- source-body:406:src-c8852cf69a7b:heading:04975a6d1fa0bcd6:paragraph -->

弹种修正为每位舰灵的独有属性，具体请看下图：
<!-- source-body:407:src-c8852cf69a7b:paragraph:043ce6a368ed868b:paragraph -->

<!-- source-body:408:src-c8852cf69a7b:paragraph:0723bbc48d4317d4:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-353c5d4b781ab968-fe1d4f1bdc1dc152"
  alt="《8.1 拂晓伤害计算构成.docx》“弹种修正”章节的相关插图；DOCX occurrence fe1d4f1bdc1dc152"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/6b54779f1a3d5557/original.jpg"
  :width="310"
  :height="938"
/>

图-1 弹种修正
<!-- source-body:409:src-c8852cf69a7b:paragraph:bba6c81379a3abea:paragraph -->

可通过舰灵面板查看该舰灵的弹种。技能造成的实际伤害类型（即用于结算弹种修正的类型），需依据技能描述具体判定，规则如下：
<!-- source-body:410:src-c8852cf69a7b:paragraph:ed9ebf7c693d1c18:paragraph -->

炮击伤害：技能描述中明确标注“炮击伤害”，伤害类型与舰灵面板弹种一致。
<!-- source-body:411:src-c8852cf69a7b:paragraph:ec1565eaf29b9034:paragraph -->

雷击伤害：技能描述中明确标注“雷击伤害”。
<!-- source-body:412:src-c8852cf69a7b:paragraph:cf10269e4a4e8bcc:paragraph -->

航空伤害分为两类：
<!-- source-body:413:src-c8852cf69a7b:paragraph:c20f60c3047ebed8:paragraph -->

轰炸机：技能描述带有“（轰炸+航空）”字段。
<!-- source-body:414:src-c8852cf69a7b:paragraph:8b68427e79884d39:paragraph -->

鱼雷机：技能描述带有“（鱼雷+航空）”字段。
<!-- source-body:415:src-c8852cf69a7b:paragraph:c232428d7bf38c59:paragraph -->

特殊弹种：若技能开头标注“高平两用炮”或“三式弹”，则按对应特殊弹种修正。
<!-- source-body:416:src-c8852cf69a7b:paragraph:660396624be2c22f:paragraph -->

冲撞伤害：技能描述中明确标注“冲撞伤害”。
<!-- source-body:417:src-c8852cf69a7b:paragraph:e66fe3308009d11a:paragraph -->

舰灵普攻伤害类型请查看《拂晓舰灵普攻倍率CD》。
<!-- source-body:418:src-c8852cf69a7b:paragraph:55b159a206e883b4:paragraph -->

需注意弹种修正系数为独立乘区，在出战时，尽可能选择弹种修正系数较高的舰种出战（注：大船面板攻击力远比中小船高，在面对中甲敌舰时，尽管穿甲战列的弹种修正系数低于穿甲重巡，实际伤害依旧更高）。
<!-- source-body:419:src-c8852cf69a7b:paragraph:a7d35c3b5b8ae883:paragraph -->

### 5.1 高爆弹点燃
<!-- source-body:420:src-c8852cf69a7b:heading:c7f2c53bf2308239:paragraph -->

高爆点燃：高爆弹舰灵每发炮弹（不论普攻还是技能，只要被判定为炮击伤害）击中敌方时都有概率点燃敌舰、造成伤害。高爆点燃的伤害为炮弹发射时实际炮击值的10%，固定伤害，可叠加，每次点燃持续10s，每秒跳次。高爆点燃的伤害与增伤区减伤区无关，相当于每次点燃都施加一次等同于自身当前面板炮击值的附加伤害。
<!-- source-body:421:src-c8852cf69a7b:paragraph:0904a6298ece1f7d:paragraph -->

固伤点燃/技能点燃：舰灵技能造成的点燃，其持续时间和伤害以技能面板描述为准。固伤点燃与高爆点燃可共存，即，高爆舰灵使用固伤点燃类炮击技能造成伤害时，可以同时触发固伤点燃和高爆点燃。
<!-- source-body:422:src-c8852cf69a7b:paragraph:1cc07d1e5be36042:paragraph -->

目前拥有固伤点燃的舰灵技能有（未写概率的即为必定点燃）：伊势·改必杀技弹飞机；绫波·改必杀技雷；盐湖城必杀技弹（每次命中15%概率触发）；爱宕通常技弹（每次命中60%概率触发）；青叶通常技雷；夕立原舰通常技雷（每次命中20%概率触发）；雾岛&amp;比叡必杀技弹；雾岛通常技弹；雾岛支援技弹；贝尔法斯特通常技弹；蒙彼利埃必杀技弹、支援技弹；重庆必杀技次、支援技次。
<!-- source-body:423:src-c8852cf69a7b:paragraph:eb8f1b6c105373e7:paragraph -->

蒙彼利埃旗舰的点燃抵抗-X%的效果为在点燃概率上直接+X%；夕立·改的通常技效果为无视对方30%的燃烧抗性，即在点燃概率上+30%进行计算（对轻甲45%，对中、重甲35%）。
<!-- source-body:424:src-c8852cf69a7b:paragraph:92a5d42cc9fa6fdc:paragraph -->

敌方单位（拉古兹）对己方舰灵造成的点燃伤害分为三类：固伤点燃、固有点燃、高爆点燃。
<!-- source-body:425:src-c8852cf69a7b:paragraph:a86d8eff1d9ed7c3:paragraph -->

“固伤点燃”类似于舰灵技能，对我方造成固定数值点燃伤害（如导驱二技能×10s、乙级以上航母三技能）。但不同的是，同舰种、同名技能多次命中只会重置燃烧时间而不会叠加。
<!-- source-body:426:src-c8852cf69a7b:paragraph:58fe30ef0ca7b20d:paragraph -->

“固有点燃”为每秒造成伤害来源10%的点燃伤害（例如各种大爆炸和火坑、丁级丙级雷巡二技能、重炮二技能），持续10s，与“高爆点燃”类似，可理解为该次技能对我方造成了倍技能伤害。
<!-- source-body:427:src-c8852cf69a7b:paragraph:4e3be3089311c596:paragraph -->

以上两种伤害来源均为拉古兹的技能，具体可见拂晓wiki。
<!-- source-body:428:src-c8852cf69a7b:paragraph:b984422ad99721bf:paragraph -->

“高爆点燃”类似于我方舰灵的高爆点燃。弹种为高爆弹的拉古兹在击中我方舰灵时有概率触发点燃，每秒伤害为拉古兹面板炮击的10%，持续10s。
<!-- source-body:429:src-c8852cf69a7b:paragraph:e95266ab3b2a6acf:paragraph -->

值得注意的是，高爆点燃与固有点燃冲突。若单次攻击同时可以触发固有点燃和高爆点燃（例如甲级战巡激光炮技能的红色流弹为固有点燃，但大部分捞船活动的甲级战巡均为高爆弹），则优先判定固有点燃，固有点燃成功生效则高爆点燃必定不生效，反之固有点燃判定失败时，才会继续判定高爆点燃。已触发的高爆点燃无法被后续固有点燃覆盖。
<!-- source-body:430:src-c8852cf69a7b:paragraph:90bdbc647b827162:paragraph -->

所有燃烧伤害均每秒结算一次，结算值为该秒内各点燃效果造成的伤害总和。
<!-- source-body:431:src-c8852cf69a7b:paragraph:5325d038fa01f087:paragraph -->

由于固有点燃伤害与造成点燃的直接伤害数值挂钩，因此拉古兹固有点燃伤害均受我方受击时装甲值与减伤率影响，若受击后提升我方装甲值/减伤率，则对该次点燃伤害无影响；受击前提升则可降低此次点燃伤害。
<!-- source-body:432:src-c8852cf69a7b:paragraph:13096f517ca63baa:paragraph -->

表3-1点燃机制小结
<!-- source-body:433:src-c8852cf69a7b:paragraph:208f34a4169c2846:paragraph -->

| 点燃来源 | 伤害判定 | 特性 | 备注 |
| --- | --- | --- | --- |
| 我方高爆弹点燃 | 实际炮击值10% | 无视增伤减伤，持续10S，可叠加，触发后伤害恒定 | 与我方固伤点燃同时生效 |
| 我方固伤点燃/技能点燃 | 技能面板实际值 | 无视增伤减伤，持续10S，可叠加，触发后伤害恒定 | 与我方高爆弹点燃同时生效 |
| 拉古兹固伤点燃 | 技能面板实际值（数值较低） | 无视增伤减伤，持续10S，可叠加，触发后伤害恒定 | 同舰种、同名技能多次命中仅刷新燃烧持续时间不叠加 |
| 拉古兹固有点燃 | 伤害来源10%伤害 | 受我方受击前装甲值与减伤率影响，持续10S，可叠加，触发后伤害恒定 | 与拉古兹高爆弹同时命中优先判定，判定成功则高爆弹点燃不生效 |
| 拉古兹高爆弹点燃 | 拉古兹面板炮击10%伤害 | 无视增伤减伤，可叠加，触发后伤害恒定且不被固有点燃覆盖 | 与固有点燃同时命中，固有点燃未触发才可触发 |
<!-- source-body:434:src-c8852cf69a7b:table:b6defe41c9c4bdd2:table -->

<!-- source-body:435:src-c8852cf69a7b:paragraph:f8d18c2de3069b7c:paragraph -->

普攻点燃概率请看下表。
<!-- source-body:436:src-c8852cf69a7b:paragraph:bcdf231f5d71108c:paragraph -->

表3- 高爆弹概率
<!-- source-body:437:src-c8852cf69a7b:paragraph:aec6903ca1772110:paragraph -->

| 弹种 | 轻甲点燃概率/% | 中甲点燃概率/% | 重甲点燃概率/% |
| --- | --- | --- | --- |
| 驱逐高爆 | 15% | 5% | 5% |
| 轻巡高爆 | 20% | 10% | 5% |
| 重巡高爆 | 25% | 15% | 10% |
| 战列高爆 | 40% | 20% | 10% |
<!-- source-body:438:src-c8852cf69a7b:table:cb74b9956a37e571:table -->

### 5.2 穿甲弹击穿判定
<!-- source-body:439:src-c8852cf69a7b:heading:7183a91901ff6733:paragraph -->

穿甲弹舰灵每次攻击命中后，对每发炮弹进行穿透判定，分为三种情况：未击穿、击穿与过穿。判定结果为“未击穿”时，本次攻击无法暴击；判定为“击穿”时，本次攻击必定暴击；判定为“过穿”时，按第十章所述公式计算暴击率。具体击穿表如下。
<!-- source-body:440:src-c8852cf69a7b:paragraph:8bdfde2b7ee65e25:paragraph -->

表3- 穿甲弹击中轻甲时概率
<!-- source-body:441:src-c8852cf69a7b:paragraph:ad32ba929eb86969:paragraph -->

| 弹种（对轻甲） | 未击穿概率/% | 击穿概率/% | 过穿概率/% |
| --- | --- | --- | --- |
| 驱逐穿甲 | 30% | 70% | 0% |
| 轻巡穿甲 | 20% | 80% | 0% |
| 重巡穿甲 | 0% | 40% | 60% |
| 战列穿甲 | 0% | 30% | 70% |
<!-- source-body:442:src-c8852cf69a7b:table:26d698b0326f9256:table -->

<!-- source-body:443:src-c8852cf69a7b:paragraph:ba501c7b22b17477:paragraph -->

表3- 穿甲弹击中中甲时概率
<!-- source-body:444:src-c8852cf69a7b:paragraph:f1e6edf8abff3d06:paragraph -->

| 弹种（对中甲） | 未击穿概率/% | 击穿概率/% | 过穿概率/% |
| --- | --- | --- | --- |
| 驱逐穿甲 | 35% | 65% | 0% |
| 轻巡穿甲 | 30% | 70% | 0% |
| 重巡穿甲 | 10% | 80% | 10% |
| 战列穿甲 | 0% | 60% | 40% |
<!-- source-body:445:src-c8852cf69a7b:table:7c70a95a6bf8d00d:table -->

<!-- source-body:446:src-c8852cf69a7b:paragraph:253873ba6b02b31f:paragraph -->

表3- 穿甲弹击中重甲时概率
<!-- source-body:447:src-c8852cf69a7b:paragraph:08eb78832d0bbc4a:paragraph -->

| 弹种（对重甲） | 未击穿概率/% | 击穿概率/% | 过穿概率/% |
| --- | --- | --- | --- |
| 驱逐穿甲 | 90% | 10% | 0% |
| 轻巡穿甲 | 80% | 20% | 0% |
| 重巡穿甲 | 60% | 40% | 0% |
| 战列穿甲 | 20% | 80% | 0% |
<!-- source-body:448:src-c8852cf69a7b:table:10c0c2548a94972e:table -->

<!-- source-body:449:src-c8852cf69a7b:paragraph:c687deb18d462d85:paragraph -->
下一章：[增伤、减伤与等级压制](./damage-bonuses)。

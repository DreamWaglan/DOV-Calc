---
id: mechanics-damage-bonuses
title: "伤害构成五：增伤、减伤与等级压制"
description: "迁移好感、天赋、羁绊、索敌、阵型、旗舰、装备、拉古兹、减伤与等级压制。"
section: mechanics
order: 350
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
tags: ["伤害","增伤","减伤","等级压制"]
related: ["mechanics-damage-multipliers","mechanics-hit-critical","media-source-c8852cf69a7b"]
---
# 伤害构成五：增伤、减伤与等级压制
## 增伤修正
<!-- source-body:450:src-c8852cf69a7b:heading:77e7ec0d31a9c6dd:paragraph -->

<!-- article-paragraph:prose -->
增伤修正为拂晓目前的增伤区集合，受以下因素影响。（注：本节内所述因素均以加算方式叠加）
<!-- source-body:451:src-c8852cf69a7b:paragraph:086f15b0e86fe62a:paragraph -->

### 6.1 好感增伤
<!-- source-body:452:src-c8852cf69a7b:heading:e97993b58cd4c5c6:paragraph -->

<!-- article-paragraph:prose -->
好感度与增伤相关，具体数值如下：
<!-- source-body:453:src-c8852cf69a7b:paragraph:dbe4c7ea62d5cff0:paragraph -->

<!-- source-body:454:src-c8852cf69a7b:paragraph:4d22cd69eab8e3ea:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-b7fa149acbb45a2b-21a294c42b4641af"
  alt="《8.1 拂晓伤害计算构成.docx》“.1 好感增伤”章节的相关插图；DOCX occurrence 21a294c42b4641af"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/7220024d6b231db0/original.png"
  :width="523"
  :height="394"
/>

<!-- article-paragraph:non-prose -->
图5.1 好感增伤数值
<!-- source-body:455:src-c8852cf69a7b:paragraph:b76db30c451e2dcc:paragraph -->

<!-- article-paragraph:prose -->
经测算，在其他条件恒定前提下，好感度由“爱”提升至“誓约”，最终伤害增幅约为4.84%；由“誓约”到“永恒”，最终伤害提升约3.84%；由“爱”到“永恒”，最终伤害提升约8.87%。鉴于收益显著，建议优先将有出战需求舰灵好感度培养至“誓约”及以上等级。好感度还决定装备槽数量："誓约"开第 5 槽、"依偎"第 6、"守护"第 7、"至爱"第 8，规则同前四槽。考虑到 6.4 节提到的索敌机制，实战中建议队伍内至少存在1位好感达到“至爱”的舰灵。
<!-- source-body:456:src-c8852cf69a7b:paragraph:ffa126ffafcbe115:paragraph -->

### 6.2 天赋增伤
<!-- source-body:457:src-c8852cf69a7b:heading:edcb6967c7afad06:paragraph -->

<!-- article-paragraph:prose -->
天赋列表中常见的增伤词条包括对特定舰种增伤，以及攻击、炮击或雷击伤害加成等。此类增伤均在本处计算。
<!-- source-body:458:src-c8852cf69a7b:paragraph:742349e2d2fa7760:paragraph -->

<!-- article-paragraph:prose -->
例如以下天赋面板（来自神通改）：
<!-- source-body:459:src-c8852cf69a7b:paragraph:73bfeb37eaebb8c1:paragraph -->

<!-- source-body:460:src-c8852cf69a7b:paragraph:b949267c5b57030a:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-832e0861394ee429-149f09b2580c6b39"
  alt="《8.1 拂晓伤害计算构成.docx》“.2 天赋增伤”章节的相关插图；DOCX occurrence 149f09b2580c6b39"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/ff71d4ab4a5eb152/original.png"
  :width="770"
  :height="574"
/>

<!-- article-paragraph:non-prose -->
天赋面板示意图
<!-- source-body:461:src-c8852cf69a7b:paragraph:383b08a04222ef21:paragraph -->

<!-- article-paragraph:prose -->
此处对理想中型敌方（中甲单位），防御值200，我方轻巡穿甲弹（125%），攻击500，倍率700%，增伤区取默认145%（未包含该天赋增伤）进行计算（取该值为100%），可得：
<!-- source-body:462:src-c8852cf69a7b:paragraph:b5b911b9f64c8389:paragraph -->

<!-- article-paragraph:prose -->
在单独点亮对中型舰伤害提升天赋后，最终伤害提升约17.24%；在单独点亮了攻击伤害加成后，最终伤害提升约13.79%；在单独点亮炮击伤害加成后，最终伤害提升约6.89%；在同时点亮对中增以及攻击伤害加成后，最终伤害提升约31.03%。
<!-- source-body:463:src-c8852cf69a7b:paragraph:fe0281617460f0b8:paragraph -->

<!-- article-paragraph:prose -->
需注意天赋1需要舰灵好感达到相识解锁，天赋2需要舰灵星级达到3星解锁，天赋3需要舰灵好感达到喜欢解锁，天赋4需要舰灵星级达到5星解锁。实际计算时请自行查看面板。
<!-- source-body:464:src-c8852cf69a7b:paragraph:4eac761b45c68db8:paragraph -->

### 6.3 羁绊增伤
<!-- source-body:465:src-c8852cf69a7b:heading:3a69b439f13a1600:paragraph -->

<!-- article-paragraph:prose -->
羁绊系统中有两项可在战斗中为全队提供炮击或雷击伤害加成的效果，如下图所示：
<!-- source-body:466:src-c8852cf69a7b:paragraph:4204c83bec717e05:paragraph -->

<!-- source-body:467:src-c8852cf69a7b:paragraph:c2948c67f5381338:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-05ffaebaa030913b-9e9cc330d4a00fa7"
  alt="《8.1 拂晓伤害计算构成.docx》“.3 羁绊增伤”章节的相关插图；DOCX occurrence 9e9cc330d4a00fa7"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/d135a5486600cddc/original.png"
  :width="1384"
  :height="746"
/>

<!-- article-paragraph:non-prose -->
图5.2 羁绊增伤
<!-- source-body:468:src-c8852cf69a7b:paragraph:a64ebb0d93fba6cb:paragraph -->

<!-- article-paragraph:prose -->
例如，此处对理想中型敌方（中甲单位），防御值200，我方轻巡穿甲弹（125%），攻击500，倍率700%，增伤区取默认135%，进行计算。长门级羁绊1星相较于无星级提升约1.48%，满星级相较于无星级提升约7.40%。
<!-- source-body:469:src-c8852cf69a7b:paragraph:fc417127f5134a67:paragraph -->

### 6.4 索敌/制空增伤
<!-- source-body:470:src-c8852cf69a7b:heading:ca6789243c24ca37:paragraph -->

<!-- article-paragraph:prose -->
索敌与制空影响增伤区，其中索敌可带来“索敌成功”buff、航向状态buff，主要影响炮击、雷击伤害；制空只能带来制空状态buff，主要影响航空伤害。具体如下：
<!-- source-body:471:src-c8852cf69a7b:paragraph:e06cd384d284e113:paragraph -->

<!-- article-paragraph:prose -->
当进攻方舰队索敌值高于防守方时，进攻方获得“索敌成功”buff（进攻方命中率+10%，防守方命中率-10%），判定为同航战或T优势（进攻方大于防守方的1.25倍时）；
<!-- source-body:472:src-c8852cf69a7b:paragraph:2f4d817cc32f5053:paragraph -->

<!-- article-paragraph:prose -->
当进攻方索敌值低于防守方时，进攻方获得“索敌失败”buff，同时判定为反航战或T劣势（当进攻方小于防守方的0.75倍时）；
<!-- source-body:473:src-c8852cf69a7b:paragraph:89cbbde1f642e585:paragraph -->

<!-- article-paragraph:prose -->
各航向状态buff见下表：
<!-- source-body:474:src-c8852cf69a7b:paragraph:8d335a5ac5360cd4:paragraph -->

<!-- article-paragraph:non-prose -->
表4-1 航向buff
<!-- source-body:475:src-c8852cf69a7b:paragraph:fa639d9d3dd18192:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:5d11d2bcb92d0ee2" tabindex="0" role="region" aria-label="DOCX 原稿表格，可横向滚动"><table class="docx-table" aria-label="DOCX 原稿表格" data-source-table="src-c8852cf69a7b:table:5d11d2bcb92d0ee2" data-grid-columns="3"><tbody><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:1:1">航向判定</th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:1:2">进攻方</th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:1:3">防守方</th></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:2:1">T优势</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:2:2">雷击/炮击伤害+15%，命中值+20%</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:2:3">雷击/炮击伤害-15%，命中值-10%</td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:3:1">同航战</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:3:2">炮击/雷击伤害+8%，命中值+10%</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:3:3">炮击/雷击伤害+8%，命中值+10%</td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:4:1">反航战</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:4:2">炮击/雷击伤害-8%，命中值-10%</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:4:3">炮击/雷击伤害-8%，命中值-10%</td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:5:1">T劣势</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:5:2">雷击/炮击伤害-15%，命中值-10%</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5d11d2bcb92d0ee2:5:3">雷击/炮击伤害+15%，命中值+20%</td></tr></tbody></table></div>
<!-- source-body:476:src-c8852cf69a7b:table:5d11d2bcb92d0ee2:table -->

<!-- article-paragraph:prose -->
制空状态的判定规则同上，注意没有“制空成功”buff，各制空状态buff如下图所示：
<!-- source-body:477:src-c8852cf69a7b:paragraph:131fc082c1388704:paragraph -->

<!-- source-body:478:src-c8852cf69a7b:paragraph:55cc433b2ceea01a:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-fdae0805fd370572-001b6fc241c6599e"
  alt="《8.1 拂晓伤害计算构成.docx》“.4 索敌/制空增伤”章节的相关插图；DOCX occurrence 001b6fc241c6599e"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/51e79b996440ff5d/original.jpg"
  :width="523"
  :height="660"
/>

<!-- article-paragraph:non-prose -->
图5.3 制空状态buff
<!-- source-body:479:src-c8852cf69a7b:paragraph:a2f379b4a517b367:paragraph -->

<!-- article-paragraph:non-prose -->
关于制空值的计算：
<!-- source-body:480:src-c8852cf69a7b:paragraph:bffb16bd1fb48d1d:paragraph -->

<!-- article-paragraph:prose -->
制空值仅与队伍中的航母、轻母、装母、水母有关，如果队伍中不存在上述舰灵，则制空值默认为0。
<!-- source-body:481:src-c8852cf69a7b:paragraph:a2de417845a04731:paragraph -->

<!-- article-paragraph:prose -->
全队的制空值按单船的制空值相加获得。
<!-- source-body:482:src-c8852cf69a7b:paragraph:df43391a4ebbd8fe:paragraph -->

<!-- article-paragraph:prose -->
单船制空值公式如下：
<!-- source-body:483:src-c8852cf69a7b:paragraph:ae8ab580b18cb180:paragraph -->

<!-- article-paragraph:prose -->
单船制空值=船只面板航空值3.33+战斗机实际装备位置载机量总和×0.75+轰炸机与鱼雷机实际装备位置载机量总和×0.25
<!-- source-body:484:src-c8852cf69a7b:paragraph:2f90cf6eb7ad8a8f:paragraph -->

<!-- article-paragraph:prose -->
注：部分轻巡、重巡、战巡，设备位的机库值为4，在携带侦察机的情况下会产生1点制空值。
<!-- source-body:485:src-c8852cf69a7b:paragraph:4bc9d54e57e786e6:paragraph -->

<!-- article-paragraph:prose -->
例如，船只航空值1000，在战斗机位置（18机库）装备战斗机，在轰炸机（18机库）装备轰炸机，在鱼雷机（27机库）位置装备鱼雷机。在设备位（10机库）装备战斗机，则其制空值=1000/3.33+（18+10）*0.75+（18+27）*0.25=332点制空值（向下取整）
<!-- source-body:486:src-c8852cf69a7b:paragraph:c9d848e71bb1226f:paragraph -->

<!-- article-paragraph:prose -->
载机量相关请看1.2.6。
<!-- source-body:487:src-c8852cf69a7b:paragraph:bab8463795861c49:paragraph -->

<!-- article-paragraph:prose -->
对理想中型敌方（中甲单位），防御值200，我方轻巡穿甲弹（125%），攻击500，倍率700%，增伤区取默认145%（未计算本处增伤），以本处增伤0%为基准（100%），同航战伤害约为105.51%，T优势下的伤害约为110.34%，反航伤害约为94.48%，T劣势下的伤害约为89.65%。对于航空伤害，取敌方轻甲防御200，我方轰炸200，航空值500，倍率700%，增伤区默认取135%（未计算本处增伤），以本处增伤0%为基准（100%），制空优势伤害约为105.93%，制空确保伤害约为111.11%，制空劣势伤害约为94.07%，制空丧失伤害约为88.89%。
<!-- source-body:488:src-c8852cf69a7b:paragraph:86d83c7f55fb4919:paragraph -->

<!-- article-paragraph:prose -->
PVE作战中，主要伤害为炮击/雷击队伍应争取获得T优buff，航空伤害队伍需确保同航战时取得制空确保。PVP中，同航与反航的差距通常不大，只要不陷入T劣势都能打。
<!-- source-body:489:src-c8852cf69a7b:paragraph:ea251307c692e421:paragraph -->

### 6.5 阵型增伤
<!-- source-body:490:src-c8852cf69a7b:heading:04d882bb77276a8e:paragraph -->

<!-- article-paragraph:prose -->
阵型增伤为拂晓战备中重要一环，虽然数值并不多，但依旧对通关有影响。具体阵型如下：
<!-- source-body:491:src-c8852cf69a7b:paragraph:9fee99d20bf678f4:paragraph -->

<!-- source-body:492:src-c8852cf69a7b:paragraph:b9c02d3320933819:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-246fbcbff983abff-6980a42247db537c"
  alt="《8.1 拂晓伤害计算构成.docx》“.5 阵型增伤”章节的相关插图；DOCX occurrence 6980a42247db537c"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/505ecf777b25a222/original.png"
  :width="507"
  :height="605"
/>

<!-- article-paragraph:non-prose -->
图5-4 阵型
<!-- source-body:493:src-c8852cf69a7b:paragraph:0997d88ca7bad79a:paragraph -->

#### 6.5.1 单纵阵
<!-- source-body:494:src-c8852cf69a7b:heading:f60f173f032ed97f:paragraph -->

<!-- article-paragraph:prose -->
效果：我方炮击、雷击伤害+12%
<!-- source-body:495:src-c8852cf69a7b:paragraph:ec18bff4a655aa0b:paragraph -->

<!-- article-paragraph:prose -->
以PVE标准战备计算所得（以下涉及计算过程省略），单独计算增伤，对于炮击/雷击提升约为11%；在以19-10为基准计算后，对比无增伤阵型，提升约9%。（对比同一区间增伤，天赋增伤20%，T优BUFF增伤15%）由于其同时提升炮击与雷击伤害，更适用于驱逐，巡洋这类同时具有炮击和鱼雷的舰型。
<!-- source-body:496:src-c8852cf69a7b:paragraph:bf295d9b2058f2ec:paragraph -->

<!-- article-paragraph:prose -->
以通用小船场PVP计算，对于炮击/雷击伤害最终伤害提升大约8%；以减伤旗舰大船场PVP计算，对于炮击/雷击伤害最终伤害提升大约6.5%。
<!-- source-body:497:src-c8852cf69a7b:paragraph:1d76cbcda5f437e3:paragraph -->

#### 6.5.2 轮型阵
<!-- source-body:498:src-c8852cf69a7b:heading:a43e770a0ae38fb6:paragraph -->

<!-- article-paragraph:prose -->
效果：我方航空、对空伤害+15%，炮击、雷击伤害-5%
<!-- source-body:499:src-c8852cf69a7b:paragraph:2dfb1356a4a2cbb1:paragraph -->

<!-- article-paragraph:prose -->
轮型阵为增伤类阵型，与单纵阵相同。实际增伤相比单纵阵，用对空，航空的3%增伤换炮击，雷击-5%，故仅推荐在航系输出占比较高的队伍中使用。
<!-- source-body:500:src-c8852cf69a7b:paragraph:18a86f8836ddca1f:paragraph -->

<!-- article-paragraph:prose -->
对PVE标准战备计算，单独计算航空增伤，提升约为12%；在以19-10为基准计算后，对比无增伤阵型，提升约10%。
<!-- source-body:501:src-c8852cf69a7b:paragraph:50a93642a3343a75:paragraph -->

<!-- article-paragraph:prose -->
对PVP标准进行计算，大型船航母对重甲伤害提升10%，但战列对同甲伤害-5%。
<!-- source-body:502:src-c8852cf69a7b:paragraph:5e4bdd1d90c75257:paragraph -->

<!-- article-paragraph:prose -->
主要适用于由轻母、装母和航母组成的航系队伍。
<!-- source-body:503:src-c8852cf69a7b:paragraph:743c80085d1cfd65:paragraph -->

#### 6.5.3 梯形阵
<!-- source-body:504:src-c8852cf69a7b:heading:55b7a58983d5c707:paragraph -->

<!-- article-paragraph:prose -->
效果：我方暴击率+15%，暴击伤害+5%，被暴击率+5%
<!-- source-body:505:src-c8852cf69a7b:paragraph:574196a5c14bb1e7:paragraph -->

<!-- article-paragraph:prose -->
梯形阵为增伤类阵型，通过提升暴击率达到增伤目的，但需要注意被暴击率增加造成的生存压力增大。主要用于以较低练度尝试通关。
<!-- source-body:506:src-c8852cf69a7b:paragraph:d547a671d39333a3:paragraph -->

<!-- article-paragraph:prose -->
以面板500攻，700%倍率，200防，暴击伤害140%默认值，弹种增伤125%（航队取130%），增伤区145%（航队取135%），减伤区无修正，双方幸运值相同，且不计额外暴击率加成或防暴击率修正进行计算。无必定暴击情况下，炮系舰灵梯形阵最终伤害仅为同条件单纵阵伤害的98.91%；计算穿甲弹必定暴击情况下，梯形阵最终伤害比单纵阵低大约32.76%。按航系计算，梯形阵约为轮型阵的96.40%。（本处计算期望，且默认必中）
<!-- source-body:507:src-c8852cf69a7b:paragraph:d38d3341878e4404:paragraph -->

<!-- article-paragraph:prose -->
关于暴击率问题，请看后文。
<!-- source-body:508:src-c8852cf69a7b:paragraph:4108e1a2788e5516:paragraph -->

### 6.6 旗舰增伤
<!-- source-body:509:src-c8852cf69a7b:heading:0f92ab74442105f9:paragraph -->

<!-- article-paragraph:prose -->
旗舰中描写有炮击/雷击/航空/轰炸/鱼雷伤害增加属于本处。以下为例子：
<!-- source-body:510:src-c8852cf69a7b:paragraph:169f35807c16b6b3:paragraph -->

<!-- source-body:511:src-c8852cf69a7b:paragraph:6ac16366e974572b:paragraph -->

<!-- source-body:512:src-c8852cf69a7b:paragraph:dd2aa90b8328f37e:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:af80d022570b9a52" tabindex="0" role="region" aria-label="DOCX 原稿表格，可横向滚动"><table class="docx-table" aria-label="DOCX 原稿表格" data-source-table="src-c8852cf69a7b:table:af80d022570b9a52" data-grid-columns="5"><tbody><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:1"><ResponsiveMedia media-id="wiki-media-fc5a6ba191ecaf61-803eea6bac09785a" alt="《8.1 拂晓伤害计算构成.docx》“.6 旗舰增伤”章节的相关插图；DOCX occurrence 803eea6bac09785a" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/a0da645bba9f4af4/original.png" :width="684" :height="250" /><br />维内托旗舰</th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:2"><ResponsiveMedia media-id="wiki-media-ea55e679a5dac8f6-399c845a0c9aa77b" alt="《8.1 拂晓伤害计算构成.docx》“.6 旗舰增伤”章节的相关插图；DOCX occurrence 399c845a0c9aa77b" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/bd893fcb9fff07f4/original.png" :width="679" :height="250" /><br />加贺旗舰</th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:3"><ResponsiveMedia media-id="wiki-media-bf951625afc625de-ca16040bae44632c" alt="《8.1 拂晓伤害计算构成.docx》“.6 旗舰增伤”章节的相关插图；DOCX occurrence ca16040bae44632c" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/6d5f25c0cf26fcff/original.png" :width="678" :height="249" /><br />大井改旗舰</th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:4"><ResponsiveMedia media-id="wiki-media-2d0eba40b2d82a4a-52f50b1f9b62ca9d" alt="《8.1 拂晓伤害计算构成.docx》“.6 旗舰增伤”章节的相关插图；DOCX occurrence 52f50b1f9b62ca9d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/75a60003c82f961e/original.png" :width="678" :height="246" /><br />列克星敦旗舰</th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:5"><ResponsiveMedia media-id="wiki-media-9c69f61300b8c1fd-ebd5fdca100fcb7f" alt="《8.1 拂晓伤害计算构成.docx》“.6 旗舰增伤”章节的相关插图；DOCX occurrence ebd5fdca100fcb7f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/cab132c8aace343d/original.png" :width="683" :height="249" /><br />新奥尔良旗舰</th></tr></tbody></table></div>
<!-- source-body:513:src-c8852cf69a7b:table:af80d022570b9a52:table -->

<!-- article-paragraph:prose -->
以标准敌方为目标，设防御力为200，弹种增伤为100%，我方攻击力为500，倍率为700%，暴击伤害为140%，增伤修正为135%（未计算本处增伤），该情况作为基准（100%），计算得从左到右分别比基准值高27.40%，20.00%，11.11%，16.30%，7.41%。由于旗舰增伤仅与舰灵旗舰技以及旗舰等级有关，因此，在多数情况下，该项在本乘区中按0计算，除非旗舰技明确写明有本乘区数值。
<!-- source-body:514:src-c8852cf69a7b:paragraph:fc4f37b1b970c6a5:paragraph -->

### 6.7 装备增伤
<!-- source-body:515:src-c8852cf69a7b:heading:d7136fc09c875d26:paragraph -->

<!-- article-paragraph:prose -->
目前（2026.7.12）拂晓内明确写在该乘区内增伤只有超重弹一件装备。具体数值如下：
<!-- source-body:516:src-c8852cf69a7b:paragraph:9c6320554154008d:paragraph -->

<!-- source-body:517:src-c8852cf69a7b:paragraph:1b5b621f7a43c696:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-c507889bd6d715af-9dcf0cd5ce2dfb67"
  alt="《8.1 拂晓伤害计算构成.docx》“.7 装备增伤”章节的相关插图；DOCX occurrence 9dcf0cd5ce2dfb67"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/97af03eb8d6d9f17/original.png"
  :width="161"
  :height="276"
/>

<!-- article-paragraph:non-prose -->
图5-5 超重弹
<!-- source-body:518:src-c8852cf69a7b:paragraph:57533b6f8bb369c6:paragraph -->

<!-- article-paragraph:prose -->
对其进行标准计算，取攻击力500，倍率700%，弹种增伤125%，防御力200，暴击伤害140%，未计入该装备加成时，增伤修正取155%，以此为基准，携带+10超重弹1个后最终伤害提升约24.05%。（计算炮击增加数值）
<!-- source-body:519:src-c8852cf69a7b:paragraph:2e312bb5f5b2c982:paragraph -->

<!-- source-body:520:src-c8852cf69a7b:paragraph:b870367445efbc3a:paragraph -->

### 6.8 拉古兹增伤
<!-- source-body:521:src-c8852cf69a7b:heading:df60b4510f1f9feb:paragraph -->

<!-- article-paragraph:prose -->
拉古兹增伤目前仅在部分舰灵技能描述中出现，且仅在PVE战斗中生效。
<!-- source-body:522:src-c8852cf69a7b:paragraph:3483870a24258651:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:fc777e13ab89a69d" tabindex="0" role="region" aria-label="DOCX 原稿表格，可横向滚动"><table class="docx-table" aria-label="DOCX 原稿表格" data-source-table="src-c8852cf69a7b:table:fc777e13ab89a69d" data-grid-columns="2"><tbody><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:fc777e13ab89a69d:1:1"><ResponsiveMedia media-id="wiki-media-112e12d01d6e1a9b-bc384a86e060de73" alt="《8.1 拂晓伤害计算构成.docx》“.8 拉古兹增伤”章节的相关插图；DOCX occurrence bc384a86e060de73" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/a4d0c3ca70e9af4e/original.png" :width="678" :height="237" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:fc777e13ab89a69d:1:2"><ResponsiveMedia media-id="wiki-media-156e24fafd1e39ea-3b40c95985a2e594" alt="《8.1 拂晓伤害计算构成.docx》“.8 拉古兹增伤”章节的相关插图；DOCX occurrence 3b40c95985a2e594" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/aaf7de1653af7486/original.png" :width="679" :height="251" /></th></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:fc777e13ab89a69d:2:1"><ResponsiveMedia media-id="wiki-media-861a59947ee76b57-3e552d5b272d08dd" alt="《8.1 拂晓伤害计算构成.docx》“.8 拉古兹增伤”章节的相关插图；DOCX occurrence 3e552d5b272d08dd" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/6b82fd01e8c67a43/original.png" :width="682" :height="248" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:fc777e13ab89a69d:2:2"><ResponsiveMedia media-id="wiki-media-d204122ac971ffcb-446fe8d9fed27d7d" alt="《8.1 拂晓伤害计算构成.docx》“.8 拉古兹增伤”章节的相关插图；DOCX occurrence 446fe8d9fed27d7d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/5371da84f563be2f/original.png" :width="682" :height="245" /></td></tr></tbody></table></div>
<!-- source-body:523:src-c8852cf69a7b:table:fc777e13ab89a69d:table -->

<!-- article-paragraph:non-prose -->
拉古兹增伤图示
<!-- source-body:524:src-c8852cf69a7b:paragraph:de40fe506a72e7e3:paragraph -->

## 减伤修正
<!-- source-body:525:src-c8852cf69a7b:heading:8606bce44ea0ebf0:paragraph -->

<!-- article-paragraph:prose -->
减伤为独立乘区，且为加算。通常本处在PVE中可直接按无减伤修正（100%）计算，PVP才有增加减伤手段。由于其为独立乘区，可认为减伤堆叠直接使伤害降低对应数值百分比。
<!-- source-body:526:src-c8852cf69a7b:paragraph:8b83f92f54953fac:paragraph -->

<!-- article-paragraph:prose -->
目前PVP增加减伤手段有：好感（数值请看5.1）、天赋、旗舰与技能效果、普列塞水下防护装置（仅大船装备且仅能减免雷击与鱼雷伤害）、防空炮自带减伤词条（仅针对航空伤害）。由于不具有普遍性，且为直接影响伤害，本处不给出计算。
<!-- source-body:527:src-c8852cf69a7b:paragraph:267d8cba11c7ff12:paragraph -->

<!-- source-body:528:src-c8852cf69a7b:paragraph:0826582d8a903115:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-3a4e67aaac7baf71-cab6a79659004077"
  alt="《8.1 拂晓伤害计算构成.docx》“减伤修正”章节的相关插图；DOCX occurrence cab6a79659004077"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/2556e876e4648bd5/original.png"
  :width="1212"
  :height="590"
/>

<!-- article-paragraph:non-prose -->
减伤图示
<!-- source-body:529:src-c8852cf69a7b:paragraph:f08ea5c445394e76:paragraph -->

## 等级压制
<!-- source-body:530:src-c8852cf69a7b:heading:0793e137b0b3f9a7:paragraph -->

<!-- article-paragraph:prose -->
仅PVE存在。规律为双方等级每差距1级，等级高的一方获得攻击伤害加成+2%，攻击伤害减免+2%。该加成以加算方式累计，最高获得加成不超过50%。例如敌方80级，我方60级，则我方对敌方造成伤害计算时需×60%，敌方对我方造成伤害计算时需×140%。减伤为加算，可在减伤乘区加算叠加，但注意仅PVE生效。
<!-- source-body:531:src-c8852cf69a7b:paragraph:3ade0c426ca9ee3a:paragraph -->

<!-- article-paragraph:prose -->
注：19-5等级为76,19-10等级为79，20-5等级为81。
<!-- source-body:532:src-c8852cf69a7b:paragraph:56df19bba43a0316:paragraph -->

<!-- source-body:533:src-c8852cf69a7b:paragraph:0a77edc26940ca52:paragraph -->
下一章：[暴击率、暴击伤害、命中与闪避](./hit-critical)。

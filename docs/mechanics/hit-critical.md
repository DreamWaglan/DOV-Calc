---
id: mechanics-hit-critical
title: "伤害构成六：暴击、命中与闪避"
description: "迁移暴击率、暴击伤害、命中率和闪避率的核算。"
section: mechanics
order: 360
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
tags: ["暴击","命中","闪避"]
related: ["mechanics-damage-bonuses","mechanics-damage-examples","media-source-c8852cf69a7b"]
---
# 伤害构成六：暴击、命中与闪避
## 暴击率与暴击伤害
<!-- source-body:534:src-c8852cf69a7b:heading:c519da952669d768:paragraph -->

实战中暴击率并非恒定为100%。前述测算数据均基于暴击触发假设，实际输出需引入暴击率进行期望值折算。
<!-- source-body:535:src-c8852cf69a7b:paragraph:6aa67ec919daee95:paragraph -->

本文以期望伤害作为实际平均伤害，即：暴击率×暴击伤害＋（－暴击率）×未暴击伤害。暴击率计算公式如下：
<!-- source-body:536:src-c8852cf69a7b:paragraph:a4435c7f5f222950:paragraph -->

基础暴击率=1-守方幸运守方幸运+攻方幸运×80%
<!-- source-body:537:src-c8852cf69a7b:paragraph:792b5757c0f05004:paragraph -->

最终暴击率=基础暴击率+加成暴击率-守方防暴击率
<!-- source-body:538:src-c8852cf69a7b:paragraph:6680da18644533d3:paragraph -->

注：基础暴击率不会超过70%，若攻方幸运足够高，计算数值超过70%，则此时基础暴击率按70%计算。
<!-- source-body:539:src-c8852cf69a7b:paragraph:209567ecddd69c88:paragraph -->

### .1 攻方幸运，守方幸运
<!-- source-body:540:src-c8852cf69a7b:heading:916bb9ee95ec4ba8:paragraph -->

攻方通常指我方舰灵，守方通常指敌方舰灵。在PVE计算中，主线通常取幸运值为，打捞活动幸运值在到不等。在PVP计算中，通常舰灵幸运是一致的，此时基础暴击率为16.5%。
<!-- source-body:541:src-c8852cf69a7b:paragraph:3c578e3f4ae9c606:paragraph -->

幸运值计算公式如下：
<!-- source-body:542:src-c8852cf69a7b:paragraph:f1d91af91a8ad621:paragraph -->

面板幸运(向下取整)= （舰灵自身幸运+装备提供幸运）*（1+羁绊加成）+誓约加成（誓约提供5点，非誓约不提供）
<!-- source-body:543:src-c8852cf69a7b:paragraph:92e317f4f6f9788e:paragraph -->

若提供幸运的装备为舰载机，则
<!-- source-body:544:src-c8852cf69a7b:paragraph:892b8dacdd467ab6:paragraph -->

装备提供幸运向下取整=飞机幸运*1+舰载机加成
<!-- source-body:545:src-c8852cf69a7b:paragraph:5a152162d83acb92:paragraph -->

注：计算结果会直接显示在面板中，所以请直接读取面板幸运值作为计算。
<!-- source-body:546:src-c8852cf69a7b:paragraph:5cddd380d30a81ed:paragraph -->

影响因素包括：
<!-- source-body:547:src-c8852cf69a7b:paragraph:e24ed23f00c16368:paragraph -->

#### .1.1 等级与星级
<!-- source-body:548:src-c8852cf69a7b:heading:48ae7dac91120a34:paragraph -->

提升等级与提升星级时偶尔会提升到点幸运。由于并非每次都会提升，故无法总结规律，建议以面板上显示幸运为准。
<!-- source-body:549:src-c8852cf69a7b:paragraph:1c3ffd346b6f8a83:paragraph -->

#### .1.2 羁绊
<!-- source-body:550:src-c8852cf69a7b:heading:30522e641634753b:paragraph -->

<!-- source-body:551:src-c8852cf69a7b:paragraph:73ff48366aa439ff:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-ace8b3419394ed04-619ea34c3cc97c2d"
  alt="《8.1 拂晓伤害计算构成.docx》“.1.2 羁绊”章节的相关插图；DOCX occurrence 619ea34c3cc97c2d"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/47b4e83e53a460e4/original.png"
  :width="1384"
  :height="442"
/>

图6.1 幸运羁绊
<!-- source-body:552:src-c8852cf69a7b:paragraph:76d6e10865a2d543:paragraph -->

主要受该羁绊影响，但其影响已经加到面板中，故一般取面板值即可。
<!-- source-body:553:src-c8852cf69a7b:paragraph:4bed361af3156187:paragraph -->

#### .1.3 装备
<!-- source-body:554:src-c8852cf69a7b:heading:36e24e135d4d885b:paragraph -->

部分装备会影响幸运，具体如下所示：
<!-- source-body:555:src-c8852cf69a7b:paragraph:650fa15bab3582c6:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:b6af1f6d9baba62d"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:1:1"><ResponsiveMedia media-id="wiki-media-61816202329f4daa-4447e01dd262e78f" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 4447e01dd262e78f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/754b59e7d6e2f9b7/original.png" :width="213" :height="364" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:1:2"><ResponsiveMedia media-id="wiki-media-d97a637a7318f4b9-a73328d86faae7dc" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence a73328d86faae7dc" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/effd1445d653eb47/original.png" :width="218" :height="370" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:2:1"><ResponsiveMedia media-id="wiki-media-befcd10903d49b59-3fcc01e88a030241" alt="《8.1 拂晓伤害计算构成.docx》“.1.3 装备”章节的相关插图；DOCX occurrence 3fcc01e88a030241" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/8dcd40b7a50ee99b/original.png" :width="185" :height="317" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:2:2"><ResponsiveMedia media-id="wiki-media-dffbf1f155b15be8-a8623cf7a0e0bb7d" alt="《8.1 拂晓伤害计算构成.docx》“.1.3 装备”章节的相关插图；DOCX occurrence a8623cf7a0e0bb7d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/a008860028ab9521/original.png" :width="185" :height="317" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:3:1"><ResponsiveMedia media-id="wiki-media-6d1ba83231f29c0a-87ba02140c79b300" alt="《8.1 拂晓伤害计算构成.docx》“.1.3 装备”章节的相关插图；DOCX occurrence 87ba02140c79b300" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/6cf465e2faefe198/original.png" :width="185" :height="317" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:3:2"><ResponsiveMedia media-id="wiki-media-6d0f2eb887f8d176-6aec82144648a432" alt="《8.1 拂晓伤害计算构成.docx》“.1.3 装备”章节的相关插图；DOCX occurrence 6aec82144648a432" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/bfad20f1790b7536/original.png" :width="185" :height="317" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:4:1"><ResponsiveMedia media-id="wiki-media-3bd885b6a6251039-cd42dc0f05c2e533" alt="《8.1 拂晓伤害计算构成.docx》“.1.3 装备”章节的相关插图；DOCX occurrence cd42dc0f05c2e533" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/fe6d195300a43187/original.png" :width="164" :height="274" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:4:2"><ResponsiveMedia media-id="wiki-media-c7f1b9542c1d7e34-a338bcf23cf67e97" alt="《8.1 拂晓伤害计算构成.docx》“.1.3 装备”章节的相关插图；DOCX occurrence a338bcf23cf67e97" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/d59e76f7d5ef565f/original.png" :width="161" :height="276" /></td></tr></tbody></table></div>
<!-- source-body:556:src-c8852cf69a7b:table:b6af1f6d9baba62d:table -->

图-2 幸运装备
<!-- source-body:557:src-c8852cf69a7b:paragraph:fb47badb2fd7f1d0:paragraph -->

取双方幸运均为进行计算，架满级SBD-3无畏提升暴击率约13.2%，架提升暴击率约22.88%；架满级金剑鱼提升暴击率约6.72%，架提升暴击率约13.88%；个蛋糕提升暴击率约4.07%，个蛋糕提升暴击率约7.64%；个勋章提升暴击率约.14%；个满级柴油机提升暴击率约6.17%，个满级柴油机提升暴击率约13.14%；个满级雷达告警装置提升暴击率约4.07%，个满级雷达告警装置提升暴击率约9.47%。（注：上述双装备方案均已计入誓约提供的点幸运）
<!-- source-body:558:src-c8852cf69a7b:paragraph:9f5aeaf6b9ec3634:paragraph -->

<!-- source-body:559:src-c8852cf69a7b:paragraph:d0efa4e9b3a09a12:paragraph -->

#### .1.4 誓约
<!-- source-body:560:src-c8852cf69a7b:heading:da1e6349951c8309:paragraph -->

舰灵缔结誓约后，基础幸运值永久增加点。
<!-- source-body:561:src-c8852cf69a7b:paragraph:53f36dcf90a1e272:paragraph -->

<!-- source-body:562:src-c8852cf69a7b:paragraph:47f7c71aab5b0588:paragraph -->

### 加成暴击率
<!-- source-body:563:src-c8852cf69a7b:heading:f81f5160a0632d04:paragraph -->

当前加成暴击率主要来自以下途径：装备词条加成，旗舰加成，技能加成，梯形阵。
<!-- source-body:564:src-c8852cf69a7b:paragraph:067190d73a1c9b5b:paragraph -->

#### .2.1 装备加成
<!-- source-body:565:src-c8852cf69a7b:heading:3975142c1f86ef89:paragraph -->

目前仅发现 九七式舰攻（番）飞机与九一式穿甲弹携带该词条。
<!-- source-body:566:src-c8852cf69a7b:paragraph:b8a94c253710324a:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:d951b749dc521c7a"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:d951b749dc521c7a:1:1"><ResponsiveMedia media-id="wiki-media-16ffdd78d9ba3713-2b3cbed63ca5c9c2" alt="《8.1 拂晓伤害计算构成.docx》“.2.1 装备加成”章节的相关插图；DOCX occurrence 2b3cbed63ca5c9c2" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/b7712fa5dc1f6c9a/original.png" :width="160" :height="278" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:d951b749dc521c7a:1:2"><ResponsiveMedia media-id="wiki-media-dd42c5eff7b85847-02ffe9a72499658d" alt="《8.1 拂晓伤害计算构成.docx》“.2.1 装备加成”章节的相关插图；DOCX occurrence 02ffe9a72499658d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/b0c2398383b652f3/original.png" :width="159" :height="273" /></th></tr></thead></table></div>
<!-- source-body:567:src-c8852cf69a7b:table:d951b749dc521c7a:table -->

图-3 加成暴击率装备
<!-- source-body:568:src-c8852cf69a7b:paragraph:aa5140f15db101a4:paragraph -->

<!-- source-body:569:src-c8852cf69a7b:paragraph:dc768bd7b4ee03ed:paragraph -->

#### .2.2 旗舰加成
<!-- source-body:570:src-c8852cf69a7b:heading:d50368a49255fde0:paragraph -->

仅部分旗舰技有该词条，例如：
<!-- source-body:571:src-c8852cf69a7b:paragraph:87f2e34d9edb89cc:paragraph -->

<!-- source-body:572:src-c8852cf69a7b:paragraph:264e56f118db99f2:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-4737394ec6520591-2b01c0ab8c38630a"
  alt="《8.1 拂晓伤害计算构成.docx》“.2.2 旗舰加成”章节的相关插图；DOCX occurrence 2b01c0ab8c38630a"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/ade460666e68ae63/original.png"
  :width="679"
  :height="249"
/>

旗舰图示
<!-- source-body:573:src-c8852cf69a7b:paragraph:0b767b5be84af6f2:paragraph -->

#### .2.3 天赋加成
<!-- source-body:574:src-c8852cf69a7b:heading:11bf35ce70331ec5:paragraph -->

仅部分舰灵能够获得该加成，例如：
<!-- source-body:575:src-c8852cf69a7b:paragraph:7397e9d102a5496b:paragraph -->

<!-- source-body:576:src-c8852cf69a7b:paragraph:a732ee79a49524fc:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-a62034dedefea5d9-e15a4a42f44757c1"
  alt="《8.1 拂晓伤害计算构成.docx》“4.2 影响因素”章节的相关插图；DOCX occurrence e15a4a42f44757c1"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/bf8b05e9f01729c5/original.png"
  :width="351"
  :height="135"
/>

天赋图示
<!-- source-body:577:src-c8852cf69a7b:paragraph:747a1bf689741e83:paragraph -->

#### .2.4 技能加成
<!-- source-body:578:src-c8852cf69a7b:heading:9b2a939bc49665c7:paragraph -->

仅部分舰灵拥有，例如：
<!-- source-body:579:src-c8852cf69a7b:paragraph:62a51e25dca94d31:paragraph -->

<!-- source-body:580:src-c8852cf69a7b:paragraph:77f4abd3eaa93746:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-a4669039a48b7b86-aed12af1e7bd5a4f"
  alt="《8.1 拂晓伤害计算构成.docx》“.2.4 技能加成”章节的相关插图；DOCX occurrence aed12af1e7bd5a4f"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/f7456ef699ff0326/original.png"
  :width="774"
  :height="145"
/>

技能图示
<!-- source-body:581:src-c8852cf69a7b:paragraph:d630a565926de829:paragraph -->

#### .2.5 阵型
<!-- source-body:582:src-c8852cf69a7b:heading:a0b7720156a38b48:paragraph -->

目前仅梯形阵能增加，具体如下：
<!-- source-body:583:src-c8852cf69a7b:paragraph:a7e17b6a9c254488:paragraph -->

效果：我方暴击率+15%，暴击伤害+5%，被暴击率+5%
<!-- source-body:584:src-c8852cf69a7b:paragraph:9e645a4904290e6b:paragraph -->

以攻，700%倍率，防，增伤区145%（航队取135%），减防区无修正，暴击伤害140%默认值，弹种增伤125%（航队取130%），双方幸运值同样，无额外加减暴击率计算。无必定暴击情况下，炮系舰灵梯形阵最终伤害仅为同条件单纵阵伤害的98.91%；计算穿甲弹必定暴击情况下，梯形阵最终伤害比单纵阵低大约32.76%。按航系计算，梯形阵约为轮型阵的96.40%。（本处计算期望，且默认必中）
<!-- source-body:585:src-c8852cf69a7b:paragraph:7888caf9bb8a49f7:paragraph -->

<!-- source-body:586:src-c8852cf69a7b:paragraph:5cc9eba90d67e43b:paragraph -->

### .3 防暴击率
<!-- source-body:587:src-c8852cf69a7b:heading:371170aded7b381d:paragraph -->

防暴击率目前只有两个轰炸机能增加，我方天赋中均为降低我方防暴击率。具体如下图所示：
<!-- source-body:588:src-c8852cf69a7b:paragraph:064dcd04c0bc8702:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:cc5109e2fc71837a"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:cc5109e2fc71837a:1:1"><ResponsiveMedia media-id="wiki-media-9bd9ee3ba3edb128-6d3e0523c6d5adb7" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 6d3e0523c6d5adb7" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/216567c86e4dbe15/original.png" :width="213" :height="369" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:cc5109e2fc71837a:1:2"><ResponsiveMedia media-id="wiki-media-a6eff63a97a25f57-efab820e399d6199" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence efab820e399d6199" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/3694a92a4bbebe84/original.png" :width="217" :height="368" /></th></tr></thead></table></div>
<!-- source-body:589:src-c8852cf69a7b:table:cc5109e2fc71837a:table -->

图-4 防暴击率装备
<!-- source-body:590:src-c8852cf69a7b:paragraph:2b0b3c7a3e66cc0b:paragraph -->

以防暴击率12%核算，对同幸运单位，受到伤害约为未装备的%。需要注意在PVP中经常因被暴击而被击沉，所以堆防暴击率依然是有必要的。
<!-- source-body:591:src-c8852cf69a7b:paragraph:8ce1aef1eaa947e9:paragraph -->

对梯形阵而言，在其他条件相同的情况下计算，相比于单纵阵与轮型阵，梯形阵提高了约19%等效血量需求。
<!-- source-body:592:src-c8852cf69a7b:paragraph:b87262550fff6e7c:paragraph -->

<!-- source-body:593:src-c8852cf69a7b:paragraph:1b7dbe8edee2a102:paragraph -->

## 命中率与闪避率
<!-- source-body:594:src-c8852cf69a7b:heading:99a99822ac4148e7:paragraph -->

受战斗AI锁定逻辑干扰，理论命中并不等同于实际有效命中。
<!-- source-body:595:src-c8852cf69a7b:paragraph:9ec92ec214621a78:paragraph -->

本节讨论的是攻击动画与目标发生碰撞后，系统进行二次命中判定的概率（由于拂晓判定是体积碰撞，炮弹、飞机未碰撞到敌方视为未命中，与本处命中率无关）。通常取命中率×前述章节期望伤害作为实际伤害估算值。
<!-- source-body:596:src-c8852cf69a7b:paragraph:64ad932f864f996c:paragraph -->

命中率计算公式如下：
<!-- source-body:597:src-c8852cf69a7b:paragraph:705e41bece17e1d4:paragraph -->

基础命中率=攻方命中攻方命中+守方机动×100%
<!-- source-body:598:src-c8852cf69a7b:paragraph:559ec0ab78ca048e:paragraph -->

<!-- source-body:599:src-c8852cf69a7b:paragraph:0b5016906f99a7ce:paragraph -->

最终命中率=基础命中率+加成命中率-守方回避率
<!-- source-body:600:src-c8852cf69a7b:paragraph:52a6f2913bab44a6:paragraph -->

计算闪避率时，通常取1-命中率。
<!-- source-body:601:src-c8852cf69a7b:paragraph:d6c0045cfcef709a:paragraph -->

### .1 攻方命中
<!-- source-body:602:src-c8852cf69a7b:heading:bf12d684c6ad3cea:paragraph -->

指舰灵面板中命中。其影响因素与前文所述攻击力、防御力相同，均受舰灵舰种、舰灵等级与星级、舰灵天赋、舰灵羁绊、舰灵装备（大部分装备都会带有命中词条）、技能效果等影响。除技能效果外其余计算过程结果已经显示在舰灵面板上。由于前文已写出详细内容，故本处不再赘述。实战中仅需注意是否有技能效果影响命中与是否取得航向/制空buff，否则通常取舰灵面板值即可。
<!-- source-body:603:src-c8852cf69a7b:paragraph:ace1d76f789873fe:paragraph -->

<!-- source-body:604:src-c8852cf69a7b:paragraph:d6407c96051cf76d:paragraph -->

### .2 守方机动
<!-- source-body:605:src-c8852cf69a7b:heading:80ddaa09ea25f7d9:paragraph -->

守方机动在PVE中通常为固定值（对面什么船都是一样的），PVP请按预计敌方舰灵可能存在的值（用自身同一舰灵面板值代入）进行计算。本处仅给出一个单独例子，实际核算请读者自行计算。
<!-- source-body:606:src-c8852cf69a7b:paragraph:e73db0ef201f2b3a:paragraph -->

#### .2.1 PVE数值
<!-- source-body:607:src-c8852cf69a7b:heading:03c38b506e720c18:paragraph -->

19-5机动值为125,19-10机动值为，20-5机动值为，其余并未找到。
<!-- source-body:608:src-c8852cf69a7b:paragraph:0489ad0ac2512ddf:paragraph -->

#### .2.2 PVP数值
<!-- source-body:609:src-c8852cf69a7b:heading:4c35c0eb174e98e4:paragraph -->

通常也取面板数值，主要调控手段为先进型动力系统以及复纵阵，下面介绍：
<!-- source-body:610:src-c8852cf69a7b:paragraph:71c34361b1b68047:paragraph -->

##### 8.2.2.1 先进型动力系统
<!-- source-body:611:src-c8852cf69a7b:heading:fef87958e404296b:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:9ad85ec54e6046b9"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:9ad85ec54e6046b9:1:1"><ResponsiveMedia media-id="wiki-media-741e553fc669e581-d7f3174f82f0f844" alt="《8.1 拂晓伤害计算构成.docx》“8.2.2.1 先进型动力系统”章节的相关插图；DOCX occurrence d7f3174f82f0f844" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/59551efc6882c79f/original.png" :width="204" :height="371" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:9ad85ec54e6046b9:1:2"><ResponsiveMedia media-id="wiki-media-77c7ca04740a85a9-a0842e39c8ea1c12" alt="《8.1 拂晓伤害计算构成.docx》“8.2.2.1 先进型动力系统”章节的相关插图；DOCX occurrence a0842e39c8ea1c12" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/c6f7ef58cfb887f1/original.png" :width="218" :height="371" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:9ad85ec54e6046b9:1:3"><ResponsiveMedia media-id="wiki-media-df65b23ccbd7f4db-163822fa226430d8" alt="《8.1 拂晓伤害计算构成.docx》“8.2.2.1 先进型动力系统”章节的相关插图；DOCX occurrence 163822fa226430d8" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/bc70939ff6c069e3/original.png" :width="216" :height="370" /></th></tr></thead></table></div>
<!-- source-body:612:src-c8852cf69a7b:table:9ad85ec54e6046b9:table -->

图-1 先进型动力系统
<!-- source-body:613:src-c8852cf69a7b:paragraph:16ca5053ce1120a9:paragraph -->

分别以原始机动为，，进行计算，攻方命中固定进行计算。
<!-- source-body:614:src-c8852cf69a7b:paragraph:c6b4ed2bf0accb2e:paragraph -->

对原始机动为的单位，增加个机动装置，闪避率提升约11.69%；增加个机动装置，闪避率提升约13.66%；增加个机动装置，闪避率提升约17.50%；增加个机动装置，闪避率提升约31.23%。
<!-- source-body:615:src-c8852cf69a7b:paragraph:474783fe2c94ee4c:paragraph -->

对原始机动为的单位，增加个机动装置，闪避率提升约%；增加个机动装置，闪避率提升约%；增加个机动装置，闪避率提升约%；增加个机动装置，闪避率提升约%。
<!-- source-body:616:src-c8852cf69a7b:paragraph:74972c217a44fe85:paragraph -->

对原始机动为的单位，增加个机动装置，闪避率提升5.56%；增加个机动装置，闪避率提升7.04%；增加个机动装置，闪避率提升9.20%；增加个机动装置，闪避率提升17.42%。
<!-- source-body:617:src-c8852cf69a7b:paragraph:c1f0a13ec9464947:paragraph -->

##### 8.2.2.2 复纵阵：
<!-- source-body:618:src-c8852cf69a7b:heading:5ef63257ab5d818f:paragraph -->

效果：我方机动+25%
<!-- source-body:619:src-c8852cf69a7b:paragraph:65f5d2f3fbdbff49:paragraph -->

分别对原始机动为，，进行衡算，攻方命中固定进行计算。
<!-- source-body:620:src-c8852cf69a7b:paragraph:0c363bd977d6e89e:paragraph -->

可得对机动单位，复纵阵闪避提升约3.33%；对机动单位，复纵阵闪避提升约4.76%；对机动单位，复纵阵闪避提升约5.56%。由此可得，复纵阵对原始机动越高的单位，提升幅度越大，通常推荐小中船携带。
<!-- source-body:621:src-c8852cf69a7b:paragraph:9408dfd35ee66170:paragraph -->

当我方机动与敌方命中相等时，复纵阵提升回避率5.6%；我方机动等于倍敌方命中时，提升回避率5.2%；我方机动等于倍敌方命中时提升5.1%。
<!-- source-body:622:src-c8852cf69a7b:paragraph:18dbf5ae71e3e4a8:paragraph -->

### .3 加成命中率
<!-- source-body:623:src-c8852cf69a7b:heading:b6bd6c154d1541df:paragraph -->

命中率加成来源主要包括火控雷达类装备、航向buff、特定天赋、旗舰技及角色技能。
<!-- source-body:624:src-c8852cf69a7b:paragraph:14ee86a4e0b6008a:paragraph -->

以下是可增加加成命中率的装备：
<!-- source-body:625:src-c8852cf69a7b:paragraph:788796a94a869a7a:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:4526e9b80fc647a8"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:4526e9b80fc647a8:1:1"><ResponsiveMedia media-id="wiki-media-f0abaf03da4b839d-a805d0a1382dd989" alt="《8.1 拂晓伤害计算构成.docx》“.3 加成命中率”章节的相关插图；DOCX occurrence a805d0a1382dd989" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/6a9df351cac6e766/original.png" :width="185" :height="318" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:4526e9b80fc647a8:1:2"><ResponsiveMedia media-id="wiki-media-96c2448cca9d6cc7-d602c682e7d98530" alt="《8.1 拂晓伤害计算构成.docx》“.3 加成命中率”章节的相关插图；DOCX occurrence d602c682e7d98530" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/969bb769bccab2ac/original.png" :width="184" :height="316" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:4526e9b80fc647a8:1:3"><ResponsiveMedia media-id="wiki-media-13278b02b36c5a76-e62f7dc197873de7" alt="《8.1 拂晓伤害计算构成.docx》“.3 加成命中率”章节的相关插图；DOCX occurrence e62f7dc197873de7" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/6809e21e256da288/original.png" :width="203" :height="346" /></th></tr></thead></table></div>
<!-- source-body:626:src-c8852cf69a7b:table:4526e9b80fc647a8:table -->

图-2 加成命中率装备
<!-- source-body:627:src-c8852cf69a7b:paragraph:ef90607de730d777:paragraph -->

对加成命中率影响最大的为航向buff，详情可看。
<!-- source-body:628:src-c8852cf69a7b:paragraph:0fd81ee3daae2bad:paragraph -->

当进攻方索敌值大于防守方时，进攻方命中率+10%；进攻方索敌值小于防守方时，进攻方命中率-10%。该数值对实际命中影响较大，可认为在满足索敌后命中概率极高。
<!-- source-body:629:src-c8852cf69a7b:paragraph:8180bad130ade034:paragraph -->

PVP中，通常是通过控制索敌值取得反航状态，同时增加机动以及回避率将敌方对我方命中率降低，如最经典的机动航。但当进攻方同航战时，防守方堆叠机动属性造成的回避率优势会被“索敌成功”BUFF天然抵消，导致其被命中率显著上升。由于航母生存能力通常弱于战列，故防守时容易失败。
<!-- source-body:630:src-c8852cf69a7b:paragraph:696a6e1b71f6c717:paragraph -->

<!-- source-body:631:src-c8852cf69a7b:paragraph:5c41143c00f23457:paragraph -->

### .4 守方回避率
<!-- source-body:632:src-c8852cf69a7b:heading:12b4008448f81f9f:paragraph -->

通常PVE守方回避率为5%，PVP中，提高回避率的手段主要包括技能、旗舰技、天赋和先进型动力系统（详情看守方机动）。高练度玩家展现出的极高闪避率，主要归因于高阶机动装置的列装与卡索敌拿到的“反航”buff。
<!-- source-body:633:src-c8852cf69a7b:paragraph:7ecdf81ed89563bb:paragraph -->

<!-- source-body:634:src-c8852cf69a7b:paragraph:fba904b712346e82:paragraph -->
下一章：[实际核算与参考文献](./damage-examples)。

---
id: mechanics-attack-power
title: "伤害构成二：攻击力"
description: "迁移攻击力定义及舰种、等级、强化、天赋、羁绊、装备、技能和旗舰影响。"
section: mechanics
order: 320
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
tags: ["伤害","攻击力","装备"]
related: ["mechanics-damage-formula-overview","mechanics-defense-power","media-source-c8852cf69a7b"]
---
# 伤害构成二：攻击力
## 攻击力：
<!-- source-body:14:src-c8852cf69a7b:heading:e63b221ad7246f47:paragraph -->

### 1.1 攻击力是什么
<!-- source-body:15:src-c8852cf69a7b:heading:5945ef72a9fa3599:paragraph -->

攻击力，是由攻击值和攻击类型所组成的统一概念，攻击类型即攻击值的数值类型（或者说攻击值的单位），攻击值即这一单位下攻击力的大小。
<!-- source-body:16:src-c8852cf69a7b:paragraph:862e425fc5946de8:paragraph -->

因此，攻击类型并不仅有炮击、雷击等在文本意义上容易联想到攻击的数值类型。准确来说，攻击类型是技能描述中所使用的数值类型，包括炮击、雷击、航空、轰炸、鱼雷、对空、机动、装甲等。它们最终通过计算，得到的是单位统一的攻击伤害（单位为生命值点数，Life Point）。
<!-- source-body:17:src-c8852cf69a7b:paragraph:fea7578870a626a8:paragraph -->

例如：
<!-- source-body:18:src-c8852cf69a7b:paragraph:9338fa1cff2015e1:paragraph -->

<!-- source-body:19:src-c8852cf69a7b:paragraph:b9a8a2b0baf61ba0:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-40e8b6eef3be0e4b-24799fa9fa30de3d"
  alt="《8.1 拂晓伤害计算构成.docx》“1.1 攻击力是什么”章节的相关插图；DOCX occurrence 24799fa9fa30de3d"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/6f031b045bc2da5d/original.png"
  :width="493"
  :height="386"
/>

炮击雷击示意图
<!-- source-body:20:src-c8852cf69a7b:paragraph:465fa5945ce66cf1:paragraph -->

计算通常技时，攻击力取面板炮击值（）；计算必杀技时，取面板雷击值（）。
<!-- source-body:21:src-c8852cf69a7b:paragraph:9eeb555ce79ee239:paragraph -->

再例如：
<!-- source-body:22:src-c8852cf69a7b:paragraph:a5902043c5d14a25:paragraph -->

<!-- source-body:23:src-c8852cf69a7b:paragraph:814079b95ccfd8ad:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-7a99f8b5d0a79cab-4879cc3ed944e5d2"
  alt="《8.1 拂晓伤害计算构成.docx》“1.1 攻击力是什么”章节的相关插图；DOCX occurrence 4879cc3ed944e5d2"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/12fe925e7c988c17/original.png"
  :width="403"
  :height="307"
/>

轰炸与鱼雷示意图
<!-- source-body:24:src-c8852cf69a7b:paragraph:8b87d5bdff129b28:paragraph -->

此处必杀技需要分项计算，轰炸机攻击力为面板中航空+实际携带轰炸机数值（1130+154），鱼雷机攻击力为面板中航空+实际携带鱼雷机数值（1130+140）。
<!-- source-body:25:src-c8852cf69a7b:paragraph:251472669f7fee7c:paragraph -->

注：鱼雷伤害为鱼雷机造成伤害，属于航空伤害的一种，雷击伤害为鱼雷造成伤害，两者并不属于同一词条。战斗机造成的航空伤害仅对敌方空中单位生效，不会影响敌方血条所显示生命值。
<!-- source-body:26:src-c8852cf69a7b:paragraph:28d9951abaffcfe8:paragraph -->

### 1.2 影响因素
<!-- source-body:27:src-c8852cf69a7b:heading:b978deeb0fae4368:paragraph -->

由于计算时进攻方默认我方，故暂不区分PVE与PVP环境差异。
<!-- source-body:28:src-c8852cf69a7b:paragraph:ade06b94dc8f1edd:paragraph -->

#### 1.2.1 舰种
<!-- source-body:29:src-c8852cf69a7b:heading:515645f1636352fb:paragraph -->

不同舰种的舰灵，其基础面板存在差异，案例如下：
<!-- source-body:30:src-c8852cf69a7b:paragraph:09ec1ff15d78db70:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:7231f15b444b0462"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:1:1"><ResponsiveMedia media-id="wiki-media-3a52c59b6647427b-fc8dc761c4e6aeac" alt="《8.1 拂晓伤害计算构成.docx》“1.2.1 舰种”章节的相关插图；DOCX occurrence fc8dc761c4e6aeac" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/2977896d5af988aa/original.png" :width="383" :height="139" /><br />胡德面板</th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:1:2"><ResponsiveMedia media-id="wiki-media-9f56a4c443100885-295ddff969f67ada" alt="《8.1 拂晓伤害计算构成.docx》“1.2.1 舰种”章节的相关插图；DOCX occurrence 295ddff969f67ada" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/7156606ce759723b/original.png" :width="678" :height="245" /><br />明尼面板</th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:1:3"><ResponsiveMedia media-id="wiki-media-ac690ec9360b42ff-228018f571782e48" alt="《8.1 拂晓伤害计算构成.docx》“1.2.1 舰种”章节的相关插图；DOCX occurrence 228018f571782e48" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/0f45ce3b1b5f60d0/original.png" :width="673" :height="244" /><br />空想面板</th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:2:1"><ResponsiveMedia media-id="wiki-media-4673c695764f0b00-b0b126c2582f69e1" alt="《8.1 拂晓伤害计算构成.docx》“1.2.1 舰种”章节的相关插图；DOCX occurrence b0b126c2582f69e1" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/39195b4100fe7456/original.png" :width="671" :height="238" /><br />逸仙面板</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:2:2"><ResponsiveMedia media-id="wiki-media-c8fe2a9f0a996acd-0a62ee8efef68a4f" alt="《8.1 拂晓伤害计算构成.docx》“1.2.1 舰种”章节的相关插图；DOCX occurrence 0a62ee8efef68a4f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/da6fcc9963755bf6/original.png" :width="670" :height="238" /><br />龙骧面板</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:2:3"><ResponsiveMedia media-id="wiki-media-975f13bb253b465e-db308c5252294c4e" alt="《8.1 拂晓伤害计算构成.docx》“1.2.1 舰种”章节的相关插图；DOCX occurrence db308c5252294c4e" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/bfc263bf4493764f/original.png" :width="670" :height="242" /><br />大黄蜂面板</td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:3:1"><ResponsiveMedia media-id="wiki-media-bb8daca71437d56b-c0ccc504a4a08d57" alt="《8.1 拂晓伤害计算构成.docx》“1.2.1 舰种”章节的相关插图；DOCX occurrence c0ccc504a4a08d57" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/67484a78ee910a69/original.png" :width="671" :height="244" /><br />黑暗界面板</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:3:3">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:31:src-c8852cf69a7b:table:7231f15b444b0462:table -->

图示均为级无加成面板
<!-- source-body:32:src-c8852cf69a7b:paragraph:15c7fe7506ff42f7:paragraph -->

<!-- source-body:33:src-c8852cf69a7b:paragraph:e8c83e4a7c7b63dd:paragraph -->

用该面板作为实际攻击力面板进行计算。在攻击倍率相同（780%），受击目标防御力相同（），增伤条件默认相同（不计算阵型、天赋、旗舰、弹种等）的情况下，以胡德面板对该目标造成伤害作为基准（100%），明尼对该目标造成伤害约为%，空想对该目标造成伤害约为%，逸仙对该目标造成伤害约为32.62%，龙骧对该目标造成伤害约为78.58%，大黄蜂对该目标造成伤害约为105.74%，黑暗界对该目标造成伤害约为66.80%。数据显示，航系攻击力普遍高于炮系，但受击目标对空值通常高于其装甲值，实战表现差距较小。
<!-- source-body:34:src-c8852cf69a7b:paragraph:2c3f0a47cd431268:paragraph -->

同级环境下，舰种基础攻击力呈阶梯分布：大船（战列、战巡、航母、装母）＞中船（轻巡、重巡、重炮、轻母）＞小船（驱逐、水母），技能倍率亦遵循此梯度。可认为大船的输出在同条件下最高。同等级下，航系与炮系的攻击属性通常仅相差百余点，对基础面板的影响相对有限。
<!-- source-body:35:src-c8852cf69a7b:paragraph:9203a637a6e613c1:paragraph -->

#### 1.2.2 等级与星级
<!-- source-body:36:src-c8852cf69a7b:heading:bf17b702ce3d35c6:paragraph -->

等级与星级会直接影响面板，案例如下：
<!-- source-body:37:src-c8852cf69a7b:paragraph:b0bc37bbe1efd2cf:paragraph -->

<!-- source-body:38:src-c8852cf69a7b:paragraph:1df984ebb32ffc36:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-89990628bd96d096-b2fabc0c2d0f3102"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.2 等级与星级”章节的相关插图；DOCX occurrence b2fabc0c2d0f3102"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/d10ce687614729ae/original.png"
  :width="1669"
  :height="764"
/>

级鹰面板
<!-- source-body:39:src-c8852cf69a7b:paragraph:b7048fe758a59892:paragraph -->

<!-- source-body:40:src-c8852cf69a7b:paragraph:12bfd20443333f7a:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-58cb66ad921cd409-200dd55a36c56ee0"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.2 等级与星级”章节的相关插图；DOCX occurrence 200dd55a36c56ee0"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/8816a052172524d6/original.png"
  :width="1709"
  :height="789"
/>

级鹰面板
<!-- source-body:41:src-c8852cf69a7b:paragraph:6bd4a73a2004efee:paragraph -->

<!-- source-body:42:src-c8852cf69a7b:paragraph:0dcf7f40afe69733:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-fc668260b3f006dc-da0a20c25bdcc775"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.2 等级与星级”章节的相关插图；DOCX occurrence da0a20c25bdcc775"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/87b0186e40a390f2/original.png"
  :width="1716"
  :height="830"
/>

星唐斯面板
<!-- source-body:43:src-c8852cf69a7b:paragraph:82644de16dda6231:paragraph -->

<!-- source-body:44:src-c8852cf69a7b:paragraph:39798500a25e1e98:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-bec0ee7a3d6a1fe6-39bc779390f3e5c0"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.2 等级与星级”章节的相关插图；DOCX occurrence 39bc779390f3e5c0"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/5483c11571918cff/original.png"
  :width="1708"
  :height="771"
/>

星唐斯面板
<!-- source-body:45:src-c8852cf69a7b:paragraph:cc8c36c70aeeb7c7:paragraph -->

<!-- source-body:46:src-c8852cf69a7b:paragraph:84b55041a33d002a:paragraph -->

可见，升级与升星均能够提升舰灵面板。但由于每个舰灵的基础面板不同，升星与升级带来的数值增益缺乏统一的线性计算公式，推测其成长系数存在舰灵个体差异。实际计算时请取面板左边白字。
<!-- source-body:47:src-c8852cf69a7b:paragraph:0d150d62e7de3fe2:paragraph -->

需注意，升星要花费晶币。星升至星需晶币，星升至星需晶币，星升至星需晶币，星升至星需晶币，星升至星需晶币。
<!-- source-body:48:src-c8852cf69a7b:paragraph:b8f56958907cfdb5:paragraph -->

#### 1.2.3 强化等级
<!-- source-body:49:src-c8852cf69a7b:heading:2af13ee8493c9d83:paragraph -->

每位舰灵都有不同的强化等级，强化等级会直接带来面板数值提升，案例如下：
<!-- source-body:50:src-c8852cf69a7b:paragraph:0353796f21f6364f:paragraph -->

<!-- source-body:51:src-c8852cf69a7b:paragraph:60a13d3909bb356a:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-61044a3adcf2867d-55cf7306c6710b64"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.3 强化等级”章节的相关插图；DOCX occurrence 55cf7306c6710b64"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/0a3abe92064677f9/original.png"
  :width="1721"
  :height="878"
/>

青叶未强化
<!-- source-body:52:src-c8852cf69a7b:paragraph:79f1f9412ad403a1:paragraph -->

<!-- source-body:53:src-c8852cf69a7b:paragraph:8dbf4cba88fb7889:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-1ab242f9618d23c9-e8d509fd2f8c5d58"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.3 强化等级”章节的相关插图；DOCX occurrence e8d509fd2f8c5d58"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/33f141fd583b6c98/original.png"
  :width="1675"
  :height="750"
/>

青叶全强化
<!-- source-body:54:src-c8852cf69a7b:paragraph:53151d94bb58d9d0:paragraph -->

上图为同等级同星级下不同强化等级的青叶，可看到未强化青叶比强化满级青叶面板数值少了装甲，炮击，雷击，对空。经测试，强化等级带来的数值增益缺乏统一的线性计算公式，推测其成长系数存在舰灵个体差异。但该强化等级带来的数值会直接显示在面板上，计算时直接使用面板数据即可。
<!-- source-body:55:src-c8852cf69a7b:paragraph:4dfa95402cdd5e8f:paragraph -->

#### 1.2. 天赋
<!-- source-body:56:src-c8852cf69a7b:heading:68aaace62f875f49:paragraph -->

天赋加成在舰灵面板白值上计算，公式如下：
<!-- source-body:57:src-c8852cf69a7b:paragraph:6965ae1184eb6043:paragraph -->

舰灵基础数值=（舰灵面板白值+天赋加成）
<!-- source-body:58:src-c8852cf69a7b:paragraph:e8938aba826d8173:paragraph -->

×（1+天赋百分比加成）
<!-- source-body:59:src-c8852cf69a7b:paragraph:966f2acfe9559c44:paragraph -->

天赋加成属于直接数值加成部分，一般写为炮击/雷击/航空/轰炸/鱼雷+X；天赋百分比加成属于百分比加成部分，一般写为炮击/雷击/航空/轰炸/鱼雷+X%。
<!-- source-body:60:src-c8852cf69a7b:paragraph:27bef50dfab908c1:paragraph -->

注：目前游戏内没有实装百分比加成攻击力的天赋，但存在其他非攻击力属性的天赋也采用这一表述形式。例子如下：
<!-- source-body:61:src-c8852cf69a7b:paragraph:ac6aa73e7a40c2f6:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:a07813d05a5dce48"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:a07813d05a5dce48:1:1"><ResponsiveMedia media-id="wiki-media-35f0c15af6ef1c64-ff809cc9186fbd48" alt="《8.1 拂晓伤害计算构成.docx》“1.2. 天赋”章节的相关插图；DOCX occurrence ff809cc9186fbd48" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/fcf6a02bee7a9f3d/original.png" :width="353" :height="131" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:a07813d05a5dce48:1:2"><ResponsiveMedia media-id="wiki-media-054e13b92b8f07fa-b3abc537020cbf21" alt="《8.1 拂晓伤害计算构成.docx》“1.2. 天赋”章节的相关插图；DOCX occurrence b3abc537020cbf21" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/dc8f6f84a2a68513/original.png" :width="349" :height="129" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:a07813d05a5dce48:1:3"><ResponsiveMedia media-id="wiki-media-5bba80711e3d72ca-9c602dd181bbbccb" alt="《8.1 拂晓伤害计算构成.docx》“1.2. 天赋”章节的相关插图；DOCX occurrence 9c602dd181bbbccb" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/8ea92816bf22b8dc/original.png" :width="350" :height="133" /></th></tr></thead></table></div>
<!-- source-body:62:src-c8852cf69a7b:table:a07813d05a5dce48:table -->

天赋示意图
<!-- source-body:63:src-c8852cf69a7b:paragraph:986c47f1448f8375:paragraph -->

例如以攻击力计算，天赋加成20%，对同一防御力目标（）进行倍率为780%的攻击，修正区除攻击力外其余条件不变，则最终伤害提升约32.4%。
<!-- source-body:64:src-c8852cf69a7b:paragraph:55793c0dd04dc295:paragraph -->

天赋为每位舰灵独有，舰灵面板中白字已默认计算此处加成，计算时请直接使用面板数据即可。
<!-- source-body:65:src-c8852cf69a7b:paragraph:c675d5f85a7731a1:paragraph -->

需特别区分，天赋中标注为“炮击/雷击/航空/轰炸/鱼雷+X”的词条，为直接在攻击力上进行计算。而标注为攻击伤害加成、炮击伤害加成、航空伤害加成等名称中含有“伤害”二字的词条，则计入后文所述增伤修正区。
<!-- source-body:66:src-c8852cf69a7b:paragraph:2b0dbd26fb702b21:paragraph -->

#### 1.2. 羁绊
<!-- source-body:67:src-c8852cf69a7b:heading:c39e593d0eb1532b:paragraph -->

每个账号的羁绊等级与加成情况均不相同，可在头像处点击羁绊查看。
<!-- source-body:68:src-c8852cf69a7b:paragraph:0374d44ebfa47d7c:paragraph -->

<!-- source-body:69:src-c8852cf69a7b:paragraph:78ed61243680f0fd:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-62fd880e5db0f6e2-322af82d496a266f"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2. 羁绊”章节的相关插图；DOCX occurrence 322af82d496a266f"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/3dc486a4f8aec1d0/original.png"
  :width="1658"
  :height="804"
/>

羁绊示意图
<!-- source-body:70:src-c8852cf69a7b:paragraph:1aa44a2258c24a6d:paragraph -->

对同一舰灵进行计算，羁绊加成每提升1%，最终伤害提升约1.6%。
<!-- source-body:71:src-c8852cf69a7b:paragraph:61f6202b19c5cfea:paragraph -->

羁绊加成在舰灵面板上已自动计算，无需进行额外计算。
<!-- source-body:72:src-c8852cf69a7b:paragraph:48bfe0d29707b385:paragraph -->

#### 1.2. 装备
<!-- source-body:73:src-c8852cf69a7b:heading:69afcc4a63e19f92:paragraph -->

装备是除等级、星级外提升舰灵面板数值的核心途径，可提供高额属性增益。请看以下案例：
<!-- source-body:74:src-c8852cf69a7b:paragraph:b70873fea030c2f6:paragraph -->

以下计算均采用面板攻击力，敌方防御、倍率700%、增伤区145%(航队135%)、暴击伤害140%、减伤区100%、无等级压制；航空伤害计算时，弹种克制取中甲即轰炸伤害100%、鱼雷伤害90%；炮击值计算统一取125%弹种增伤；雷击值计算时，为保持与实际一致，取弹种增伤140%、敌方装甲值计算。
<!-- source-body:75:src-c8852cf69a7b:paragraph:4b173e520265bcf7:paragraph -->

<!-- source-body:76:src-c8852cf69a7b:paragraph:be6346a33cabe046:paragraph -->

##### 1.2.6.1 驱逐主炮
<!-- source-body:77:src-c8852cf69a7b:heading:b7d44adf8dd551cf:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:1"><ResponsiveMedia media-id="wiki-media-5bdb35c0bef68bc2-52739e62d44924e8" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence 52739e62d44924e8" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/1cedd87b42588f3b/original.png" :width="216" :height="371" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:2"><ResponsiveMedia media-id="wiki-media-2be9764e73ef407b-6c262e1383f85891" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence 6c262e1383f85891" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/3b4f6f950ecf04ad/original.png" :width="216" :height="368" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:3"><ResponsiveMedia media-id="wiki-media-4e7548c5481fd6d1-4856717d48bf778c" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence 4856717d48bf778c" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/b7127af4b20cbe86/original.png" :width="215" :height="370" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:4"><ResponsiveMedia media-id="wiki-media-afa110652e16d750-22d986cc3601e996" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence 22d986cc3601e996" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/b555d82050249f03/original.png" :width="216" :height="374" /></th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:5"><ResponsiveMedia media-id="wiki-media-b7b618c7ea2e547a-d46b8b9eb069301f" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence d46b8b9eb069301f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/c8293acd52f5b6cc/original.png" :width="216" :height="372" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:1"><ResponsiveMedia media-id="wiki-media-9b56d3d6a07c81ba-9f834a9f29cd661b" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence 9f834a9f29cd661b" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/c445319df336a1b1/original.png" :width="219" :height="376" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:2"><ResponsiveMedia media-id="wiki-media-ca25ac7e3cf8c073-562543c79029ef57" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence 562543c79029ef57" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/fec3415404b37c53/original.png" :width="218" :height="366" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:3"><ResponsiveMedia media-id="wiki-media-702395be4e7cce62-f1c64d7404bad155" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence f1c64d7404bad155" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/a37276c52a267818/original.png" :width="216" :height="371" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:4"><ResponsiveMedia media-id="wiki-media-dc30c2cb72f3baaa-a712cc3a774d13b3" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence a712cc3a774d13b3" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/b2920cbc5fb0b2fb/original.png" :width="213" :height="373" /></td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:5"><ResponsiveMedia media-id="wiki-media-507b59a35387b293-5cb42e8b9c1a5155" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence 5cb42e8b9c1a5155" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/bba28a820b048eeb/original.png" :width="213" :height="375" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:1">&nbsp;</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:3"><ResponsiveMedia media-id="wiki-media-19650883ee4facb8-c64eb5bc4aff0eeb" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence c64eb5bc4aff0eeb" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/958eb1707e4cf356/original.png" :width="216" :height="374" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:4">&nbsp;</td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:5">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:78:src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:table -->

图-1 驱逐炮属性
<!-- source-body:79:src-c8852cf69a7b:paragraph:ba91783b25064c61:paragraph -->

<!-- source-body:80:src-c8852cf69a7b:paragraph:23e84ced1f5a90e9:paragraph -->

<!-- source-body:81:src-c8852cf69a7b:paragraph:b490da310b26decc:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-84dd5f8d33bd11bf-cea859025751b995"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence cea859025751b995"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/9dd59d679c984027/original.png"
  :width="1666"
  :height="744"
/>

吹雪无装备
<!-- source-body:82:src-c8852cf69a7b:paragraph:71629b0479b88aa2:paragraph -->

<!-- source-body:83:src-c8852cf69a7b:paragraph:63380d51d5aa4af0:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-54a09ccb55b1c55c-2b61e386cf398967"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.1 驱逐主炮”章节的相关插图；DOCX occurrence 2b61e386cf398967"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/275281b02d75bb47/original.png"
  :width="1664"
  :height="754"
/>

吹雪装备门+10 30.5cm无后座力炮
<!-- source-body:84:src-c8852cf69a7b:paragraph:b4d2322b633768f5:paragraph -->

<!-- source-body:85:src-c8852cf69a7b:paragraph:c8054f3d211b8723:paragraph -->

表1-1 驱逐装备主炮计算
<!-- source-body:86:src-c8852cf69a7b:paragraph:ac4fb2e675c55bcc:paragraph -->

| 装备选装 | 炮击值 | 伤害值 | 对无装备提升率 | 对紫装提升率 | 对单门提升率 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  | \ | \ | \ |
| +6 双联装TbtsKC/36T型150mm炮 |  |  | 16.99% | \ | \ |
| 单装三年式155mm高角炮 |  |  | 14.89% | -1.80% | \ |
| +10 单装三年式155mm高角炮 |  |  | 22.62% | 4.81% | \ |
| +10 30.5cm无后座力炮 |  |  | 44.74% | 23.73% | \ |
| 门+6 双联装TbtsKC/36T型150mm炮 |  |  | 34.34% | \ | 14.83% |
| 门+10 单装三年式155mm高角炮 |  |  | 45.83% | 8.55% | 18.93% |
| 门+10 30.5cm无后座力炮 |  |  | 69.13% | 25.90% | 16.85% |
<!-- source-body:87:src-c8852cf69a7b:table:c3e22fe6f73c0af3:table -->

<!-- source-body:88:src-c8852cf69a7b:paragraph:6e74a4bdb578b840:paragraph -->

在驱逐主炮中，的单装三年式155mm高角炮伤害值比的双联装TbtsKC/36T型150mm炮显著降低，可认为在无法做到情况下，选择双联装TbtsKC/36T型150mm炮为更优解（紫炮强化材料需求少）。
<!-- source-body:89:src-c8852cf69a7b:paragraph:b005a61068f3d1ef:paragraph -->

对比30.5cm无后座力炮与双联装TbtsKC/36T型150mm炮的伤害，若拥有30.5cm无后座力炮，可以认为其为双联装TbtsKC/36T型150mm炮的上位，更建议使用30.5cm无后座力炮。而炮所降低的命中值对驱逐的影响相对较小（驱逐的基础命中值机动值高），故推荐驱逐在能装备的情况下尽量使用炮作为主炮。
<!-- source-body:90:src-c8852cf69a7b:paragraph:445f43c23565741f:paragraph -->

##### 1.2.6.2 轻巡副炮
<!-- source-body:91:src-c8852cf69a7b:heading:94dca1ce5911b09a:paragraph -->

<!-- source-body:92:src-c8852cf69a7b:paragraph:480f97fd29f32d5e:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-d869b55e8a2f1dd0-c5b5635d49c921e5"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.2 轻巡副炮”章节的相关插图；DOCX occurrence c5b5635d49c921e5"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/597cd58e50c3ee0c/original.png"
  :width="1671"
  :height="741"
/>

逸仙未装备
<!-- source-body:93:src-c8852cf69a7b:paragraph:8233912532374887:paragraph -->

<!-- source-body:94:src-c8852cf69a7b:paragraph:cce8755b43823435:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-f68be9178f70cb92-ca3847e5cee59d9b"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.2 轻巡副炮”章节的相关插图；DOCX occurrence ca3847e5cee59d9b"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/2619e82a9c69ab3b/original.png"
  :width="1668"
  :height="745"
/>

逸仙装备门 30.5cm无后座力炮
<!-- source-body:95:src-c8852cf69a7b:paragraph:6d558c12ded6feb8:paragraph -->

<!-- source-body:96:src-c8852cf69a7b:paragraph:46cf0e2079498a6e:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-5ec2b9458953f2da-508b9405ea21ef60"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.2 轻巡副炮”章节的相关插图；DOCX occurrence 508b9405ea21ef60"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/2e8fb919c26f1a66/original.png"
  :width="1669"
  :height="743"
/>

逸仙装备+10 30.5cm无后座力炮补正命中
<!-- source-body:97:src-c8852cf69a7b:paragraph:985c8f50f1ab144f:paragraph -->

表1-2 轻巡装备副炮计算
<!-- source-body:98:src-c8852cf69a7b:paragraph:ee80563224af57c3:paragraph -->

| 装备选装 | 炮击值 | 伤害值 | 对无装备提升率 | 对+6 紫装提升率 | 装备主炮后提升率 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  | \ | \ | \ |
| +6 双联装TbtsKC/36T型150mm炮 |  |  | 8.15% | \ | \ |
| +10 单装三年式155mm高角炮 |  |  | 10.83% | 2.47% | \ |
| +10 30.5cm无后座力炮 |  |  | 21.23% | 12.09% | \ |
| 门三联装B-1-P.Pattern1932型180mm炮 |  |  | 42.04% | \ | \ |
| 门+6 双联装TbtsKC/36T型150mm炮 |  |  | 58.75% | \ | 11.77% |
| 门+10 单装三年式155mm高角炮 |  |  | 64.23% | 3.45% | 15.62% |
| 门+10 30.5cm无后座力炮 |  |  | 85.54% | 16.87% | 30.62% |
| 对命中进行修正后 |  |  | 74.87% | 10.15% | 23.11% |
<!-- source-body:99:src-c8852cf69a7b:table:9c82173472574711:table -->

<!-- source-body:100:src-c8852cf69a7b:paragraph:8f1fef16f9c33ef3:paragraph -->

轻巡本身能装备轻巡主炮，故通常认为优先升级主炮装备提供的攻击力加成更多。
<!-- source-body:101:src-c8852cf69a7b:paragraph:b82b96500061f742:paragraph -->

在使用30.5cm无后座力炮作为轻巡的副炮时，其提供的攻击力对轻巡输出提升较为显著，可视为轻巡副炮中提升攻击力的最优选择。
<!-- source-body:102:src-c8852cf69a7b:paragraph:3d33076dbd306b37:paragraph -->

由于装备门炮对当前面板降低命中率约3.40%，而实战中低等级低星级舰灵往往表现为50%以上的MISS，故推荐尽量避免使用门，如需使用，请补足命中。
<!-- source-body:103:src-c8852cf69a7b:paragraph:dd094cfe051f9caf:paragraph -->

<!-- source-body:104:src-c8852cf69a7b:paragraph:eb79b0ea45a3f9ad:paragraph -->

##### 1.2.6.3 重巡副炮
<!-- source-body:105:src-c8852cf69a7b:heading:95b8bd76c9edbd53:paragraph -->

<!-- source-body:106:src-c8852cf69a7b:paragraph:b3bd099776121bcf:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-a57a5174775f5144-9200500479f8c29f"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.3 重巡副炮”章节的相关插图；DOCX occurrence 9200500479f8c29f"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/bc983f232cad331d/original.png"
  :width="1670"
  :height="767"
/>

波拉装备门+10 305炮
<!-- source-body:107:src-c8852cf69a7b:paragraph:e977a360d86890c5:paragraph -->

<!-- source-body:108:src-c8852cf69a7b:paragraph:82c00fa0944dc428:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-d0ee0b2aa17c1540-2bf7f543adf60e86"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.3 重巡副炮”章节的相关插图；DOCX occurrence 2bf7f543adf60e86"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/d45be4fafea8a43c/original.png"
  :width="1668"
  :height="749"
/>

波拉装备炮后补正命中
<!-- source-body:109:src-c8852cf69a7b:paragraph:060bd2b46e6dd865:paragraph -->

<!-- source-body:110:src-c8852cf69a7b:paragraph:03bb6dd77a640b90:paragraph -->

表1-3 重巡装备副炮计算
<!-- source-body:111:src-c8852cf69a7b:paragraph:be0c352572af9cff:paragraph -->

| 装备选装 | 炮击值 | 伤害值 | 对无装备提升率 | 对+6 紫装提升率 | 装备主炮后提升率 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  | \ | \ | \ |
| +6 双联装TbtsKC/36T型150mm炮 |  |  | 13.18% | \ | \ |
| +10 单装三年式155mm高角炮 |  |  | 17.76% | 4.04% | \ |
| +10 30.5cm无后座力炮 |  |  | 34.99% | 19.27% | \ |
| 门三联装Mk15型203mm炮 |  |  | 73.83% | \ | \ |
| 门+6 双联装TbtsKC/36T型150mm炮 |  |  | 102.09% | \ | 16.26% |
| 门+10 单装三年式155mm高角炮 |  |  | 111.38% | 4.60% | 21.60% |
| 门+10 30.5cm无后座力炮 |  |  | 147.63% | 22.54% | 42.46% |
| 对命中进行修正后 |  |  | 129.46% | 13.55% | 32.00% |
<!-- source-body:112:src-c8852cf69a7b:table:a07351e7592c95fb:table -->

<!-- source-body:113:src-c8852cf69a7b:paragraph:dfd492d9463c90c0:paragraph -->

重巡与轻巡同理，在有主炮的情况下优先推荐升级主炮。
<!-- source-body:114:src-c8852cf69a7b:paragraph:79b27037993ce6fa:paragraph -->

对于炮而言，其装备提升幅度较驱逐与轻巡下降，主要原因是重巡主炮提供的炮击值较高，且重巡自身的基础炮击也高于驱逐和轻巡。同时因为重巡在中船场为主力，通常更建议堆高命中以获得更高的命中率。
<!-- source-body:115:src-c8852cf69a7b:paragraph:bf76e4947f4b503a:paragraph -->

装备门炮提升约%，但命中率下降约7.24%。实战中发现装备门炮已经出现30%左右的MISS，装备门后更出现50%以上的MISS。因此，如需装备炮，应同时装备其余高命中炮补足其命中。受装备分配限制，实际配装时通常不会优先将其分配给重巡。
<!-- source-body:116:src-c8852cf69a7b:paragraph:61fa0dda530992d1:paragraph -->

<!-- source-body:117:src-c8852cf69a7b:paragraph:de1b348c6ffd424f:paragraph -->

##### 1.2.6.4 战列副炮
<!-- source-body:118:src-c8852cf69a7b:heading:7c4abc46a6e0af53:paragraph -->

<!-- source-body:119:src-c8852cf69a7b:paragraph:b88bed5a08a68bc7:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-920447efe4adfad4-e6f36e426530a697"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.4 战列副炮”章节的相关插图；DOCX occurrence e6f36e426530a697"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/34b377a2d9707596/original.png"
  :width="1675"
  :height="747"
/>

荷马装备门金限定副驱逐炮
<!-- source-body:120:src-c8852cf69a7b:paragraph:e8e40f8fbd70f714:paragraph -->

<!-- source-body:121:src-c8852cf69a7b:paragraph:389209eb0c1de0bf:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-748b8d6ae9cef1a8-deb496a04f81dba8"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.4 战列副炮”章节的相关插图；DOCX occurrence deb496a04f81dba8"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/5a42c40327741c61/original.png"
  :width="1658"
  :height="745"
/>

荷马装备门金限定副驱逐,1门补命中炮
<!-- source-body:122:src-c8852cf69a7b:paragraph:b1519db751c4b341:paragraph -->

<!-- source-body:123:src-c8852cf69a7b:paragraph:6ed25e03e6d4ce95:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-0e1e1c1453f54432-8e3614b538557d76"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.4 战列副炮”章节的相关插图；DOCX occurrence 8e3614b538557d76"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/046ccc3a4c981ce2/original.png"
  :width="1668"
  :height="769"
/>

荷马装备门金副轻巡炮
<!-- source-body:124:src-c8852cf69a7b:paragraph:2cf297a1d4ea6db8:paragraph -->

<!-- source-body:125:src-c8852cf69a7b:paragraph:233a907e65e3a6f0:paragraph -->

表1-4 战列装备副炮计算
<!-- source-body:126:src-c8852cf69a7b:paragraph:b606bd1bad4936de:paragraph -->

| 装备选装 | 炮击值 | 伤害值 | 对无装备提升率 | 对+6 紫装提升率 | 装备主炮后提升率 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  | \ | \ | \ |
| +6 双联装TbtsKC/36T型150mm炮 |  |  | 7.81% | \ | \ |
| 三联装三年式155mm炮 |  |  | 10.85% | 2.82% | \ |
| +10 单装三年式155mm高角炮 |  |  | 10.37% | 2.37% | \ |
| +10 30.5cm无后座力炮 |  |  | 20.32% | 11.61% | \ |
| +10 三联装B-1-P.Pattern1932型180mm炮 |  |  | 20.00% | 11.31% | \ |
| 门三联装Mk6型406mm炮 |  |  | 72.90% | \ | \ |
| 门+6 三联装三年式155mm炮 |  |  | 95.29% | \ | 12.95% |
| 门+10 30.5cm无后座力炮 |  |  | 114.79% | 9.99% | 24.23% |
| 门+10 三联装B-1-P.Pattern1932型180mm炮 |  |  | 114.13% | 9.65% | 23.85% |
| 对命中进行修正后 |  |  | 100.57% | 2.71% | 16.00% |
<!-- source-body:127:src-c8852cf69a7b:table:a7e52d05801e8799:table -->

<!-- source-body:128:src-c8852cf69a7b:paragraph:a261ddb64fb661d7:paragraph -->

对于战列而言，其基础炮击属性较高，且主炮提供的炮击远大于副炮所能提供的炮击，故实际副炮影响偏小。需注意装备门+10 305炮相比装备门+10 金轻巡炮仅提升约3.09%，但是命中率下降约10.41%，非常不建议同时上门炮作为战列副炮。与此同时，装备门与门驱逐高命中炮修正命中后，伤害相比仅装备门主炮提升约16.00%，但命中率上升约3.50%。通常练级时推荐携带金轻巡炮以追求伤害最大化，而在PVP中通常会推荐携带门补命中副炮以保证命中率。
<!-- source-body:129:src-c8852cf69a7b:paragraph:76ffb6f7e159c88c:paragraph -->

<!-- source-body:130:src-c8852cf69a7b:paragraph:e3a0b00234ad2d7e:paragraph -->

##### 1.2.6.5 轻巡主炮
<!-- source-body:131:src-c8852cf69a7b:heading:578e5811de192503:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:01acca07cae90485"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:1"><ResponsiveMedia media-id="wiki-media-481942f428beea5e-f40bd7368c3add76" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.5 轻巡主炮”章节的相关插图；DOCX occurrence f40bd7368c3add76" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/293e2436743a1b34/original.png" :width="215" :height="369" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:2"><ResponsiveMedia media-id="wiki-media-9cbc0006160404ea-a32430fab6063c66" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.5 轻巡主炮”章节的相关插图；DOCX occurrence a32430fab6063c66" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/7df7575a0805f2d0/original.png" :width="214" :height="372" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:3"><ResponsiveMedia media-id="wiki-media-0963db4e2e4abb6a-79d72cc1238dbd44" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.5 轻巡主炮”章节的相关插图；DOCX occurrence 79d72cc1238dbd44" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/43be5cd50b100200/original.png" :width="217" :height="373" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:4"><ResponsiveMedia media-id="wiki-media-df7d5d9ae1ac6143-aac07732b1cca400" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.5 轻巡主炮”章节的相关插图；DOCX occurrence aac07732b1cca400" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/30922f28e4a4d6eb/original.png" :width="218" :height="373" /></th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:5"><ResponsiveMedia media-id="wiki-media-9f730b2a51159325-3c5c30ea6f0ef3f5" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.5 轻巡主炮”章节的相关插图；DOCX occurrence 3c5c30ea6f0ef3f5" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/007403d5441ecc87/original.png" :width="215" :height="372" /></th></tr></thead></table></div>
<!-- source-body:132:src-c8852cf69a7b:table:01acca07cae90485:table -->

图-2 轻巡炮属性
<!-- source-body:133:src-c8852cf69a7b:paragraph:e8f0e4e65c4e03ea:paragraph -->

<!-- source-body:134:src-c8852cf69a7b:paragraph:7adf7d91a016b1e5:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-7a620b74d8cb7366-b0b0cd1016f74331"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.5 轻巡主炮”章节的相关插图；DOCX occurrence b0b0cd1016f74331"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/c99b8b6045cc7d35/original.png"
  :width="1681"
  :height="750"
/>

重庆未装备
<!-- source-body:135:src-c8852cf69a7b:paragraph:7c8221a6c4799d77:paragraph -->

<!-- source-body:136:src-c8852cf69a7b:paragraph:6bb14be9fa5ad215:paragraph -->

表1-5 轻巡装备主炮计算
<!-- source-body:137:src-c8852cf69a7b:paragraph:de56502a69e98cb6:paragraph -->

| 装备选装 | 炮击值 | 伤害值 | 对无装备提升率 | 对+6 紫装提升率 | 对单门提升率 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  | \ | \ | \ |
| +6 三联装三年式155mm炮 |  |  | 11.78% | \ | \ |
| +10 三联装B-1-P.Pattern1932型180mm炮 |  |  | 21.73% | 8.90% | \ |
| 门+6 三联装三年式155mm炮 |  |  | 23.66% | \ | 10.63% |
| 门+10 三联装B-1-P.Pattern1932型180mm炮 |  |  | 43.74% | 16.24% | 18.08% |
<!-- source-body:138:src-c8852cf69a7b:table:9805f0e867073117:table -->

<!-- source-body:139:src-c8852cf69a7b:paragraph:550ebd125b3260a7:paragraph -->

对轻巡炮而言，其紫装与金装差距并不算大（点以内），在考虑成本后，如果仅能做到，通常更推荐使用三联装三年式155mm炮。而实际提升还是+10 三联装B-1-P.Pattern1932型180mm炮提升更显著，故更建议轻巡舰的轻巡炮携带金炮（圣地亚哥在PVP中更适合携带双联装QF.MK.V型114mm炮（RP41MK.VI））。
<!-- source-body:140:src-c8852cf69a7b:paragraph:81fcf65a937cad78:paragraph -->

<!-- source-body:141:src-c8852cf69a7b:paragraph:b4464722726fd432:paragraph -->

##### 1.2.6.6 高对空轻巡炮
<!-- source-body:142:src-c8852cf69a7b:heading:113d91b448b150f4:paragraph -->

后两种轻巡炮通常作为大船副炮使用，轻巡使用不如常驻金炮（给大船收益更高）。此处使用前卫通常技级进行计算。取弹种增伤110%，计算通常技对空加成，不计算拉古兹增伤。
<!-- source-body:143:src-c8852cf69a7b:paragraph:327234f1b5a6d67a:paragraph -->

<!-- source-body:144:src-c8852cf69a7b:paragraph:5817e16e3658c522:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-3e4df548e192a8dd-65236b67788ef29d"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.6 高对空轻巡炮”章节的相关插图；DOCX occurrence 65236b67788ef29d"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/e916b0b15fc106de/original.png"
  :width="817"
  :height="151"
/>

前卫技能图示
<!-- source-body:145:src-c8852cf69a7b:paragraph:06d0bbd3d3896382:paragraph -->

<!-- source-body:146:src-c8852cf69a7b:paragraph:ba9ee40451031937:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-0f59739973245fb2-c9b968395780b8ab"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.6 高对空轻巡炮”章节的相关插图；DOCX occurrence c9b968395780b8ab"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/c92e6622cb9c0f9f/original.png"
  :width="1678"
  :height="759"
/>

前卫无装备
<!-- source-body:147:src-c8852cf69a7b:paragraph:40a8a65cbb61643c:paragraph -->

<!-- source-body:148:src-c8852cf69a7b:paragraph:b4178457b83fc3a9:paragraph -->

表1-6 前卫装备高对空副炮计算
<!-- source-body:149:src-c8852cf69a7b:paragraph:3f7e9857456f95b4:paragraph -->

| 装备选装 | 炮击值 | 对空值 | 攻击力计算取值 | 伤害值 | 对无装备提升 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  |  |  | \ |
| +10 三联装QF.MK.V型152mm炮 |  |  |  |  | 25.56% |
| +10 三联装Mle1930型152mm炮 |  |  |  |  | 22.65% |
| 同时装备 |  |  |  |  | 48.49% |
<!-- source-body:150:src-c8852cf69a7b:table:d5e65598c010fcbd:table -->

<!-- source-body:151:src-c8852cf69a7b:paragraph:74c872ca1fbad01e:paragraph -->

由于大船在PVP中对对空值的需求较高，前卫等有对空收益舰灵携带该类型炮收益会更高。介于这两件限定装备目前每个账号各限件，更适合优先配给此类舰灵。
<!-- source-body:152:src-c8852cf69a7b:paragraph:dbed89a113874e06:paragraph -->

<!-- source-body:153:src-c8852cf69a7b:paragraph:eab65c5b616699da:paragraph -->

##### 1.2.6.7 重巡主炮
<!-- source-body:154:src-c8852cf69a7b:heading:25ccc74369fb9cc8:paragraph -->

<!-- source-body:155:src-c8852cf69a7b:paragraph:895c76efbf05bec3:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:aa6e5cc76958aff0"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:1"><ResponsiveMedia media-id="wiki-media-20ef1bdb38295a4f-affa827539117951" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence affa827539117951" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/01d253580533a263/original.png" :width="216" :height="371" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:2"><ResponsiveMedia media-id="wiki-media-27a5ceb0ae84c2ef-829cdf87c0c062b6" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence 829cdf87c0c062b6" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/5e5e67d267dd2445/original.png" :width="221" :height="371" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:3"><ResponsiveMedia media-id="wiki-media-162bcf7cec6759d0-a48f529ae33f9bef" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence a48f529ae33f9bef" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/e10690e01e1a4ace/original.png" :width="220" :height="371" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:4"><ResponsiveMedia media-id="wiki-media-c8def54bc4937806-3a2f82063e0681d8" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence 3a2f82063e0681d8" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/0a6155ffe2c4e7ab/original.png" :width="214" :height="376" /></th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:5"><ResponsiveMedia media-id="wiki-media-ed88391b2b34fdc0-ee8148bec00d8625" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence ee8148bec00d8625" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/90503349e29da065/original.png" :width="215" :height="371" /></th><th data-grid-column="6" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:6">&nbsp;</th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:1"><ResponsiveMedia media-id="wiki-media-5dbe4d1d301c2cad-4b0643878eb4340c" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence 4b0643878eb4340c" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/09082a88ba7899ef/original.png" :width="219" :height="376" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:2"><ResponsiveMedia media-id="wiki-media-c1a1b841836a32e6-0bc8574bc9306177" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence 0bc8574bc9306177" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/9127514fefdcc4f8/original.png" :width="213" :height="372" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:3"><ResponsiveMedia media-id="wiki-media-21642c4c8e70a0a8-0ed069d7fe3879c1" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence 0ed069d7fe3879c1" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/1c4fe9cd202160eb/original.png" :width="217" :height="378" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:4"><ResponsiveMedia media-id="wiki-media-ee0d552a05e9bc17-04c055f7d875191c" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence 04c055f7d875191c" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/ffc4dcfff19699ad/original.png" :width="214" :height="369" /></td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:5"><ResponsiveMedia media-id="wiki-media-fc816a25d45c83be-4ae111a8bdb88b0d" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence 4ae111a8bdb88b0d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/95f92bc7e3020a9f/original.png" :width="204" :height="346" /></td><td data-grid-column="6" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:6">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:156:src-c8852cf69a7b:table:aa6e5cc76958aff0:table -->

图-3 重巡炮属性
<!-- source-body:157:src-c8852cf69a7b:paragraph:7f6bd4cbb213eaff:paragraph -->

<!-- source-body:158:src-c8852cf69a7b:paragraph:ed484a5291001c03:paragraph -->

<!-- source-body:159:src-c8852cf69a7b:paragraph:e0a22b066ee25a3c:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-9142adeed2c77909-3eb6707e425ee8db"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.7 重巡主炮”章节的相关插图；DOCX occurrence 3eb6707e425ee8db"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/fcc74760837208c7/original.png"
  :width="1675"
  :height="754"
/>

波拉无装备
<!-- source-body:160:src-c8852cf69a7b:paragraph:0868d6abe0318b22:paragraph -->

<!-- source-body:161:src-c8852cf69a7b:paragraph:5abcf59b3fd2dd5b:paragraph -->

<!-- source-body:162:src-c8852cf69a7b:paragraph:fbcddfc9201a399d:paragraph -->

表1-7 重巡装备主炮计算
<!-- source-body:163:src-c8852cf69a7b:paragraph:52f75895dcebbfd6:paragraph -->

| 装备选装 | 炮击值 | 伤害值 | 对无装备提升率 | 对+6 紫装提升率 | 对单门提升率 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  | \ | \ | \ |
| +6 三联装Mk14型203mm炮 |  |  | 23.56% | \ | \ |
| +10 三联装Mk15型203mm炮 |  |  | 36.39% | 10.38% | \ |
| +10 双联装三年式号203mm炮 |  |  | 34.71% | 9.02% | \ |
| +10 双联式M1929型203mm炮 |  |  | 39.48% | 12.88% | \ |
| 门+6 三联装Mk14型203mm炮 |  |  | 47.65% | \ | 19.49% |
| 门+10 三联装Mk15型203mm炮 |  |  | 73.83% | 17.74% | 27.45% |
| 门+10 双联装三年式号203mm炮 |  |  | 70.39% | 15.41% | 26.49% |
| 门双联式M1929型203mm炮 |  |  | 79.63% | 21.66% | 28.79% |
<!-- source-body:164:src-c8852cf69a7b:table:959b77e442193fc7:table -->

<!-- source-body:165:src-c8852cf69a7b:paragraph:73e461989ce6928c:paragraph -->

从图中不难得出，紫装与金装差距极小（仅点炮击差距）。考虑到成本，如果目前资源仅供，更推荐强化紫装以过渡。同时，由于双联式M1929型203mm炮为补给姬限定装备，较难获取。该装备仅提供的炮击属性，在PVP中其综合收益难以与SSR II型装备中可兑换的双联装三年式号203mm炮提供的对空值相媲美。从PVE角度推荐尽可能堆高炮击，即采用双联式M1929型203mm炮，而PVP更推荐使用双联装三年式号203mm炮。
<!-- source-body:166:src-c8852cf69a7b:paragraph:c0a15f12f02250bd:paragraph -->

<!-- source-body:167:src-c8852cf69a7b:paragraph:9b0547d60e83dd10:paragraph -->

##### 1.2.6.8 战列主炮
<!-- source-body:168:src-c8852cf69a7b:heading:e66762b3cdc5588a:paragraph -->

<!-- source-body:169:src-c8852cf69a7b:paragraph:1f3f919382c2580e:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:ac810f562356ac6f"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:1"><ResponsiveMedia media-id="wiki-media-0b98854024f01676-60484a9f4d1173a9" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence 60484a9f4d1173a9" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/629435aeaf835092/original.png" :width="219" :height="376" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:2"><ResponsiveMedia media-id="wiki-media-41010b96ef3e0e6e-d4ea8ed50a513a40" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence d4ea8ed50a513a40" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/04a43e087752217f/original.png" :width="216" :height="371" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:3"><ResponsiveMedia media-id="wiki-media-6de98e7a6e7db11e-15da2e4115752818" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence 15da2e4115752818" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/1ea6fbd5dd8c3b66/original.png" :width="216" :height="367" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:4"><ResponsiveMedia media-id="wiki-media-3f48290e510334b5-cfab1977af3b227f" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence cfab1977af3b227f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/b460c23d3221ebcb/original.png" :width="216" :height="368" /></th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:5"><ResponsiveMedia media-id="wiki-media-15b900f6bb643feb-b4b9291339951d2a" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence b4b9291339951d2a" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/615d541b3a6d00c0/original.png" :width="215" :height="371" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:1"><ResponsiveMedia media-id="wiki-media-b5fa1713b56f54fa-47fb30334d671ad9" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence 47fb30334d671ad9" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/64541a6785af74c9/original.png" :width="216" :height="374" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:2"><ResponsiveMedia media-id="wiki-media-a909aafc07310a1e-feb6638ea069c14a" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence feb6638ea069c14a" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/6eac383bdd956414/original.png" :width="213" :height="370" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:3"><ResponsiveMedia media-id="wiki-media-efe3c380d1986085-9f0b8de849dcce44" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence 9f0b8de849dcce44" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/32be6e4fd3e89170/original.png" :width="213" :height="369" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:4"><ResponsiveMedia media-id="wiki-media-8e2c89d51f203c12-e92cb182edf5860f" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence e92cb182edf5860f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/8c63ae70660bcf7a/original.png" :width="214" :height="369" /></td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:5"><ResponsiveMedia media-id="wiki-media-0d18604deeb6099e-cd438df5fd6a09a4" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence cd438df5fd6a09a4" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/803e498927eeccaa/original.png" :width="219" :height="373" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:1"><ResponsiveMedia media-id="wiki-media-b70f2f2254fb4812-69bd55970a249c62" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence 69bd55970a249c62" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/8646cdfb32190b6e/original.png" :width="220" :height="373" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:2"><ResponsiveMedia media-id="wiki-media-d31c7bdaaa6f6b83-0da226080d81b0ec" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence 0da226080d81b0ec" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/ba3716b0a4eb150c/original.png" :width="162" :height="275" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:3"><ResponsiveMedia media-id="wiki-media-bbfdde6d0b3b8ff5-f157388caf3ed53f" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence f157388caf3ed53f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/c03a7845ce476939/original.png" :width="163" :height="271" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:4"><ResponsiveMedia media-id="wiki-media-9aaa2ab4c7595775-ac7ffb9db33d0d13" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence ac7ffb9db33d0d13" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/8bb76268cb3356b7/original.png" :width="158" :height="272" /></td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:5"><ResponsiveMedia media-id="wiki-media-ba9719b477ae4edb-5812c89c94d2ba96" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence 5812c89c94d2ba96" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/6134266bda257bd8/original.png" :width="160" :height="275" /></td></tr></tbody></table></div>
<!-- source-body:170:src-c8852cf69a7b:table:ac810f562356ac6f:table -->

<!-- source-body:171:src-c8852cf69a7b:paragraph:0036e8bc85433371:paragraph -->

图-4 战列炮属性
<!-- source-body:172:src-c8852cf69a7b:paragraph:9f6846105fbc4a65:paragraph -->

<!-- source-body:173:src-c8852cf69a7b:paragraph:c917b6c260387a90:paragraph -->

<!-- source-body:174:src-c8852cf69a7b:paragraph:0cb3b89b55df5a80:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-b96ea40b8d8caee8-ddf739572cce38c4"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.8 战列主炮”章节的相关插图；DOCX occurrence ddf739572cce38c4"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/bb1405942e976c79/original.png"
  :width="1651"
  :height="752"
/>

荷马未装备
<!-- source-body:175:src-c8852cf69a7b:paragraph:028abdc28cdff819:paragraph -->

<!-- source-body:176:src-c8852cf69a7b:paragraph:2aa12f3ff1b37796:paragraph -->

<!-- source-body:177:src-c8852cf69a7b:paragraph:d1af5fec2e246ebd:paragraph -->

表1-8 战列装备主炮计算
<!-- source-body:178:src-c8852cf69a7b:paragraph:c1db346e11ac9d18:paragraph -->

| 装备选装 | 炮击值 | 伤害值 | 对无装备提升率 | 对+6 紫装提升率 | 对单门提升率 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  | \ | \ | \ |
| +6 四联装Mk.VII型356mm炮 |  |  | 22.73% | \ | \ |
| +10 三联装Mk6型406mm炮 |  |  | 36.16% | 10.94% | \ |
| +10 双联装Mk.I型381mm炮（Mk.II） |  |  | 34.37% | 9.48% | \ |
| +10 三联装Mk.IV型406mm炮（Mk.III） |  |  | 36.64% | 11.33% | \ |
| 门+6 四联装Mk.VII型356mm炮 |  |  | 45.75% | \ | 18.75% |
| 门+10 三联装Mk6型406mm炮 |  |  | 72.90% | 18.63% | 26.98% |
| 门+10 双联装Mk.I型381mm炮（Mk.II） |  |  | 69.29% | 16.15% | 25.98% |
| 门+10 三联装Mk.IV型406mm炮（Mk.III） |  |  | 73.88% | 19.30% | 27.25% |
<!-- source-body:179:src-c8852cf69a7b:table:bee8e85eab1292bb:table -->

<!-- source-body:180:src-c8852cf69a7b:paragraph:742c13b2199cdd0c:paragraph -->

战列主炮由于属性差距较大，可认为能上金装尽量上金装。由于三联装Mk.IV型406mm炮（Mk.III）炮击仅比三联装Mk6型406mm炮高点，且需要SSR II型兑换，故非常不推荐为了点炮击兑换门并强化至。且由于战列炮存在许多彩炮，均高出三联装Mk6型406mm炮点以上炮击，通常认为彩炮为最优解（本文未逐一计算彩炮：一是种类较多，二是各账号持有情况不同，且多数彩炮通常仅有门）。PVP通常认为将部分炮击转移到命中上会更好，故推荐携带双联装Mk.I型381mm炮（Mk.II）。
<!-- source-body:181:src-c8852cf69a7b:paragraph:6ea00d7db5cc5db2:paragraph -->

<!-- source-body:182:src-c8852cf69a7b:paragraph:a7b52d3d10368613:paragraph -->

##### 1.2.6.9 鱼雷
<!-- source-body:183:src-c8852cf69a7b:heading:ca7b05a520de739b:paragraph -->

<!-- source-body:184:src-c8852cf69a7b:paragraph:323d4c16b577bff7:paragraph -->

<!-- source-body:185:src-c8852cf69a7b:heading:3bbc7c22e58620a5:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:796a08d43d973530"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:1:1"><ResponsiveMedia media-id="wiki-media-51fa0a0d6c45747b-b1eb26d6660b1a5f" alt="《8.1 拂晓伤害计算构成.docx》第 204 个媒体位置的相关插图；DOCX occurrence b1eb26d6660b1a5f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/a62fc654e3222fce/original.png" :width="215" :height="370" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:1:2"><ResponsiveMedia media-id="wiki-media-5aab90f10d37bb78-3f8b98062470875d" alt="《8.1 拂晓伤害计算构成.docx》第 205 个媒体位置的相关插图；DOCX occurrence 3f8b98062470875d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/4fceb248a2979b59/original.png" :width="216" :height="372" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:1:3"><ResponsiveMedia media-id="wiki-media-cc3d88676e0a967a-d8ff5d0848fef672" alt="《8.1 拂晓伤害计算构成.docx》第 206 个媒体位置的相关插图；DOCX occurrence d8ff5d0848fef672" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/033e22abeb9acc19/original.png" :width="218" :height="371" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:1:4"><ResponsiveMedia media-id="wiki-media-3df206b0e2017b10-6526d60724ec5cbb" alt="《8.1 拂晓伤害计算构成.docx》第 207 个媒体位置的相关插图；DOCX occurrence 6526d60724ec5cbb" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/bf0042eb78c8e37e/original.png" :width="216" :height="375" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:2:1"><ResponsiveMedia media-id="wiki-media-6f6421808e438ed3-0c49f23e1651656e" alt="《8.1 拂晓伤害计算构成.docx》第 208 个媒体位置的相关插图；DOCX occurrence 0c49f23e1651656e" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/41aa0c1e6c33305a/original.png" :width="218" :height="372" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:2:2"><ResponsiveMedia media-id="wiki-media-7d92869d057c2bc8-b3622a563f9529b1" alt="《8.1 拂晓伤害计算构成.docx》第 209 个媒体位置的相关插图；DOCX occurrence b3622a563f9529b1" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/ceb8d7bf019035f9/original.png" :width="215" :height="373" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:2:3"><ResponsiveMedia media-id="wiki-media-721993428b1f1ddd-d44bb1bd3c838051" alt="《8.1 拂晓伤害计算构成.docx》第 210 个媒体位置的相关插图；DOCX occurrence d44bb1bd3c838051" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/254c3a8d9b853583/original.png" :width="214" :height="372" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:2:4"><ResponsiveMedia media-id="wiki-media-387517ab7d7f023e-29571f76f491206d" alt="《8.1 拂晓伤害计算构成.docx》第 211 个媒体位置的相关插图；DOCX occurrence 29571f76f491206d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/1e46a1947477d9f5/original.png" :width="159" :height="273" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:3:1"><ResponsiveMedia media-id="wiki-media-0daa4d025f2738b5-62b21ddb94bb268f" alt="《8.1 拂晓伤害计算构成.docx》第 214 个媒体位置的相关插图；DOCX occurrence 62b21ddb94bb268f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/84f13a6fbf0b33ad/original.png" :width="159" :height="272" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:3:3">&nbsp;</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:3:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:186:src-c8852cf69a7b:table:796a08d43d973530:table -->

图-5 鱼雷属性
<!-- source-body:187:src-c8852cf69a7b:paragraph:f8c2f982f4638c25:paragraph -->

<!-- source-body:188:src-c8852cf69a7b:paragraph:a3924ce27c8cda24:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-faf99a16737d1fd9-3854ff45e0cafa59"
  alt="《8.1 拂晓伤害计算构成.docx》第 215 个媒体位置的相关插图；DOCX occurrence 3854ff45e0cafa59"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/1cf119ccd5bc2cfe/original.png"
  :width="1681"
  :height="753"
/>

吹雪改未装备
<!-- source-body:189:src-c8852cf69a7b:paragraph:2a9d7f159457dcc9:paragraph -->

<!-- source-body:190:src-c8852cf69a7b:paragraph:11791f7598c71a9f:paragraph -->

<!-- source-body:191:src-c8852cf69a7b:paragraph:76f00e9d839af3c7:paragraph -->

表1-9 驱逐装备鱼雷计算
<!-- source-body:192:src-c8852cf69a7b:paragraph:d27c9f0df709d096:paragraph -->

| 装备选装 | 雷击值 | 伤害值 | 对无装备提升率 | 对+6 紫装提升率 | 对单门提升率 |
| --- | --- | --- | --- | --- | --- |
| 无装备 |  |  | \ | \ | \ |
| +6 五联装610mm鱼雷发射器 |  |  | 12.18% | \ | \ |
| +10 四联装九二式二型610mm鱼雷发射器（Type 93 Mod1） |  |  | 17.94% | 5.14% | \ |
| 2门+6 五联装610mm鱼雷发射器 |  |  | 24.52% | \ | 11.00% |
| 2门+10 四联装九二式二型610mm鱼雷发射器（Type 93 Mod1） |  |  | 36.21% | 9.39% | 15.49% |
<!-- source-body:193:src-c8852cf69a7b:table:93c485bd49f32b4a:table -->

<!-- source-body:194:src-c8852cf69a7b:paragraph:275f46f5ef076766:paragraph -->

通常鱼雷装备选择高强化金色鱼雷，无金色鱼雷或强化等级不足时，可选择五联装610mm鱼雷发射器。对于小船而言，两个金鱼雷差距不大，对于中船则更推荐装备四联装533mm鱼雷发射器（G7a T1）以获得更多的命中。对于雷巡，PVE中尽可能装备雷击值高的鱼雷，PVP中推荐四联装533mm鱼雷发射器（G7a T1）拉高命中。
<!-- source-body:195:src-c8852cf69a7b:paragraph:c1789b881e3c906a:paragraph -->

<!-- source-body:196:src-c8852cf69a7b:paragraph:b980a459b5eb0e09:paragraph -->

航系装备受舰灵本身装备加成，具体公式如下：
<!-- source-body:197:src-c8852cf69a7b:paragraph:3e6818dccb1a6bdc:paragraph -->

舰载机装备加成数值 =飞机裸数值×（1+载机量(机库)%）
<!-- source-body:198:src-c8852cf69a7b:paragraph:2071095a91280310:paragraph -->

（备注：所有舰载机均适用该公式，且与机型、舰种和属性类型无关 2.载机量与等级和星级无关，改造后可能会改变载机量）
<!-- source-body:199:src-c8852cf69a7b:paragraph:e3eccc1ae68705b6:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:de0ae8b46f6db265"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:de0ae8b46f6db265:1:1"><ResponsiveMedia media-id="wiki-media-2153314e83626dfc-b90634a9f0ce30cc" alt="《8.1 拂晓伤害计算构成.docx》第 216 个媒体位置的相关插图；DOCX occurrence b90634a9f0ce30cc" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/1a1cb8ffbd84a717/original.png" :width="738" :height="379" /><br />列克星敦</th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:de0ae8b46f6db265:1:2"><ResponsiveMedia media-id="wiki-media-66f87a00228a8474-e0aa5f490c2921cb" alt="《8.1 拂晓伤害计算构成.docx》第 217 个媒体位置的相关插图；DOCX occurrence e0aa5f490c2921cb" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/d9f162645475dff7/original.png" :width="730" :height="366" /><br />列克星敦改</th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:de0ae8b46f6db265:2:1"><ResponsiveMedia media-id="wiki-media-cbd457bc2ffa29a5-2a276e1ed949018a" alt="《8.1 拂晓伤害计算构成.docx》第 218 个媒体位置的相关插图；DOCX occurrence 2a276e1ed949018a" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/a3f93addd31acde1/original.png" :width="768" :height="374" /><br />列克星敦誓约后装备槽</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:de0ae8b46f6db265:2:2"><ResponsiveMedia media-id="wiki-media-4765f8575cf5ba31-42cf2160d8ed053d" alt="《8.1 拂晓伤害计算构成.docx》第 219 个媒体位置的相关插图；DOCX occurrence 42cf2160d8ed053d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/f66e562416ae3485/original.png" :width="738" :height="374" /><br />独角兽</td></tr></tbody></table></div>
<!-- source-body:200:src-c8852cf69a7b:table:de0ae8b46f6db265:table -->

图示为舰载机装备加成
<!-- source-body:201:src-c8852cf69a7b:paragraph:6f99cfd0c7c8205e:paragraph -->

可以看到在轻母与航母中部分战斗机、轰炸机、鱼雷机及设备槽位的右下角标有数字，这里的数字就是上面公式所写的载机量（单位%）。部分舰灵的设备槽位没有数字，那么就是没有加成，按装备原值计算。誓约后逐步开放的个槽也没有写数字，故也是按无加成处理。
<!-- source-body:202:src-c8852cf69a7b:paragraph:5dc86b9e444bb247:paragraph -->

注：以下架飞机位置默认装备在前槽，享受载机量加成。
<!-- source-body:203:src-c8852cf69a7b:paragraph:bd5a07ddd5a86827:paragraph -->

<!-- source-body:204:src-c8852cf69a7b:paragraph:f7a9396368cc2ea6:paragraph -->

##### 1.2.6.10 战斗机
<!-- source-body:205:src-c8852cf69a7b:heading:35f3531327972400:paragraph -->

<!-- source-body:206:src-c8852cf69a7b:paragraph:469efd8439cd02c3:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:6300152a88d2ed7f"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:1:1"><ResponsiveMedia media-id="wiki-media-e2dbfe336c734577-6d3241dcc60c0370" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 6d3241dcc60c0370" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/5e4af0b335ece04a/original.png" :width="213" :height="373" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:1:2"><ResponsiveMedia media-id="wiki-media-f74a842a35ce394b-6e1de3cdb23cd3fa" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 6e1de3cdb23cd3fa" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/790b15ffb63fa3c5/original.png" :width="215" :height="373" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:1:3"><ResponsiveMedia media-id="wiki-media-8f81996d19d0dcb3-140225b987889818" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 140225b987889818" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/efcc8631ad11fbe8/original.png" :width="216" :height="368" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:1:4"><ResponsiveMedia media-id="wiki-media-931cdd744a373163-abada8fb0adad4d6" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence abada8fb0adad4d6" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/0e29b8250624c13c/original.png" :width="216" :height="372" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:2:1"><ResponsiveMedia media-id="wiki-media-e85867be9b53a2dc-1fe78ddeee9b5dab" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 1fe78ddeee9b5dab" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/1b2631d2f4e293c8/original.png" :width="215" :height="370" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:2:2"><ResponsiveMedia media-id="wiki-media-97073f48dd4210d9-a4b89274b2696450" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence a4b89274b2696450" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/08548f5162dd510d/original.png" :width="216" :height="369" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:2:3"><ResponsiveMedia media-id="wiki-media-ded075732ad2c35f-edd652ceba83cade" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence edd652ceba83cade" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/71571555f13bf068/original.png" :width="215" :height="371" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:2:4"><ResponsiveMedia media-id="wiki-media-dd8ab54df43b816c-28b8a5902bf918fb" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 28b8a5902bf918fb" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/440ff983f7aabaf6/original.png" :width="215" :height="369" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:3:1"><ResponsiveMedia media-id="wiki-media-4ef1bec216a1386d-e02fa74ca782fef6" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence e02fa74ca782fef6" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/c49bc4a309a952bf/original.png" :width="217" :height="370" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:3:2"><ResponsiveMedia media-id="wiki-media-6b2e3cdbc1f86736-fec8604e1bf9f8b8" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence fec8604e1bf9f8b8" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/5eea9b2798d2b372/original.png" :width="213" :height="372" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:3:3"><ResponsiveMedia media-id="wiki-media-dbb9a84ba661f343-fc1a97ca63d89e75" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence fc1a97ca63d89e75" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/b53b68fbe8ed6eea/original.png" :width="216" :height="371" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:3:4"><ResponsiveMedia media-id="wiki-media-10a9caa5973add75-4e7332f8092794b2" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 4e7332f8092794b2" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/9367b7f3afd37737/original.png" :width="217" :height="373" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:4:1"><ResponsiveMedia media-id="wiki-media-c82c780ca1c0d490-8df124e3535fb994" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 8df124e3535fb994" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/568606479163b80d/original.png" :width="218" :height="373" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:4:2"><ResponsiveMedia media-id="wiki-media-3102e8d9afd78558-efefcb643b882724" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence efefcb643b882724" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/63581e4e3fd75cea/original.png" :width="160" :height="276" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:4:3"><ResponsiveMedia media-id="wiki-media-e92213fdfe7b1524-209b0ae5d63d782b" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 209b0ae5d63d782b" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/cdd979bbaf665361/original.png" :width="160" :height="277" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:4:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:207:src-c8852cf69a7b:table:6300152a88d2ed7f:table -->

图-6 战斗机属性
<!-- source-body:208:src-c8852cf69a7b:paragraph:f78149a989753218:paragraph -->

<!-- source-body:209:src-c8852cf69a7b:paragraph:f42d72a17816c61f:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-baf10015bd0bbf9e-711c48404175f26f"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 711c48404175f26f"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/1460d5b1976bbba6/original.png"
  :width="1635"
  :height="753"
/>

列克星敦未装备
<!-- source-body:210:src-c8852cf69a7b:paragraph:b784788e804fd6bd:paragraph -->

<!-- source-body:211:src-c8852cf69a7b:paragraph:8609b94407d77fa1:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-14aa9c9c7427bfe3-9d7742412d6d2383"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 9d7742412d6d2383"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/4eb1b6b9403b89ba/original.png"
  :width="1646"
  :height="737"
/>

<ResponsiveMedia
  media-id="wiki-media-40f008c6a0b91290-88ba5c31a0782ead"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 88ba5c31a0782ead"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/c0a993520185da30/original.png"
  :width="182"
  :height="355"
/>

列克星敦装备架+6 F4U-1海盗
<!-- source-body:212:src-c8852cf69a7b:paragraph:3276ae22148d4fa3:paragraph -->

<!-- source-body:213:src-c8852cf69a7b:paragraph:830a88a4fc590f2e:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-716c4eeced7ebcb7-7aeb7074348ce4bc"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 7aeb7074348ce4bc"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/aabc2a0310b8cfe8/original.png"
  :width="1666"
  :height="754"
/>

<ResponsiveMedia
  media-id="wiki-media-da3fd97f87018c5f-2eb157109fa30671"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.10 战斗机”章节的相关插图；DOCX occurrence 2eb157109fa30671"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/6ce09795cc3a3214/original.png"
  :width="181"
  :height="361"
/>

列克星敦装备架+10 SO.8000
<!-- source-body:214:src-c8852cf69a7b:paragraph:e71a7885b8852e7a:paragraph -->

<!-- source-body:215:src-c8852cf69a7b:paragraph:11e57445d6f34a2d:paragraph -->

表1-10 轰炸航装备战斗机计算
<!-- source-body:216:src-c8852cf69a7b:paragraph:ac7638e96f121870:paragraph -->

| 装备选装 | 航空值 | 轰炸值 | 轰炸取值 | 轰炸伤害 | 对无装备提升率 | 对+6 紫装提升率 | 对装备架提升率 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 无装备 |  |  |  |  | \ | \ | \ |
| 架+6 F4U-1海盗 |  |  |  |  | 7.38% | \ | \ |
| 架+10 烈风 |  |  |  |  | 7.97% | 0.56% | \ |
| 架+10 SO.8000 |  |  |  |  | 9.99% | 2.43% | \ |
| 架+6 F4U-1海盗 |  |  |  |  | 13.57% | \ | 5.77% |
| 架+10 烈风 |  |  |  |  | 14.54% | 0.86% | 6.08% |
| 架+10 SO.8000 |  |  |  |  | 18.28% | 4.15% | 7.54% |
<!-- source-body:217:src-c8852cf69a7b:table:e8e0c395bb75cfce:table -->

<!-- source-body:218:src-c8852cf69a7b:paragraph:08b0c1b8f05a5b0a:paragraph -->

表1-11 鱼雷航装备战斗机计算
<!-- source-body:219:src-c8852cf69a7b:paragraph:df20dd4a50aa6d5b:paragraph -->

| 装备选装 | 航空值 | 鱼雷值 | 鱼雷取值 | 鱼雷伤害 | 对无装备提升率 | 对+6 紫装提升率 | 对装备架提升率 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 无装备 |  |  |  |  | \ | \ | \ |
| 架+6 F4U-1海盗 |  |  |  |  | 4.69% | \ | \ |
| 架+10 烈风 |  |  |  |  | 7.97% | 3.13% | \ |
| 架+10 SO.8000 |  |  |  |  | 7.97% | 3.13% | \ |
| 架+6 F4U-1海盗 |  |  |  |  | 8.64% | \ | 3.78% |
| 架+10 烈风 |  |  |  |  | 14.54% | 5.43% | 6.08% |
| 架+10 SO.8000 |  |  |  |  | 14.54% | 5.43% | 6.08% |
<!-- source-body:220:src-c8852cf69a7b:table:60f5382ee84b2585:table -->

<!-- source-body:221:src-c8852cf69a7b:paragraph:44a9ca7d717ce29b:paragraph -->

由于战斗机不提供鱼雷值，且对攻击力而言，其仅提供航空值。对于轰炸航母来说，紫飞机优先选择F4U-1 海盗，金飞机优选SO.8000，但由于SO.8000为补给姬装备，通常还是携带烈风或海毒牙居多。对于鱼雷航母，紫飞机建议选择海喷火等带有机动词条且航空值略高的飞机（航空值高点），不过同样也可携带F4U-1 海盗；金飞机建议选烈风或海毒牙这两种常驻装备，好获取且强化后数值加成一致。账号资源足够可选择SSR II型中F6F（Thach队）为鱼雷航母最终装备。F4F-4野猫（Thach）对于轰炸航母，其提供的攻击力加成不如SO.8000，依旧高于烈风或海毒牙此类装备。但对于鱼雷航母，F4F-4野猫（Thach）为最优解。
<!-- source-body:222:src-c8852cf69a7b:paragraph:eb3cef86f03e5c15:paragraph -->

<!-- source-body:223:src-c8852cf69a7b:paragraph:b560b33925e9bad2:paragraph -->

##### 1.2.6.11 轰炸机
<!-- source-body:224:src-c8852cf69a7b:heading:21452c6d10113f26:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:2870062292c4c4d9"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:1:1"><ResponsiveMedia media-id="wiki-media-3397d9e40667f95e-0b6632d72ec9c584" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 0b6632d72ec9c584" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/5fc6cd60c818a626/original.png" :width="215" :height="371" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:1:2"><ResponsiveMedia media-id="wiki-media-7f12cb710fa1fadc-64777361e01f97b6" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 64777361e01f97b6" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/f9ffbceb4279fb41/original.png" :width="215" :height="370" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:1:3"><ResponsiveMedia media-id="wiki-media-8e9d33fc94cd6d2f-f608b73d32fcfc38" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence f608b73d32fcfc38" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/edfbedcc1ecc4378/original.png" :width="222" :height="368" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:1:4"><ResponsiveMedia media-id="wiki-media-6c3fb84d9f18a81a-16144ae3e93f0ce8" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 16144ae3e93f0ce8" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/08cdc171b8f30319/original.png" :width="215" :height="372" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:2:1"><ResponsiveMedia media-id="wiki-media-a3de3f4b41e0dca1-8cef5490a143cdb2" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 8cef5490a143cdb2" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/175cdf3623cf1057/original.png" :width="216" :height="377" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:2:2"><ResponsiveMedia media-id="wiki-media-2e5112330aae6ec6-301e67c71b9a5cd5" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 301e67c71b9a5cd5" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/05dfa694e2366c5e/original.png" :width="216" :height="368" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:2:3"><ResponsiveMedia media-id="wiki-media-9bd9ee3ba3edb128-ac9cda6d09117a54" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence ac9cda6d09117a54" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/216567c86e4dbe15/original.png" :width="213" :height="369" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:2:4"><ResponsiveMedia media-id="wiki-media-20a3562ba04f995e-4fbc7716f718bc14" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 4fbc7716f718bc14" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/4a70d1c7c3734fa7/original.png" :width="214" :height="370" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:3:1"><ResponsiveMedia media-id="wiki-media-61816202329f4daa-9d14e0f70ad07a4d" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 9d14e0f70ad07a4d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/754b59e7d6e2f9b7/original.png" :width="213" :height="364" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:3:2"><ResponsiveMedia media-id="wiki-media-9b1b7bf6d6e684d1-e81f41f0d07ad9d0" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence e81f41f0d07ad9d0" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/ba1047d0093533b8/original.png" :width="213" :height="369" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:3:3"><ResponsiveMedia media-id="wiki-media-a6eff63a97a25f57-d8528f2108e97c80" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence d8528f2108e97c80" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/3694a92a4bbebe84/original.png" :width="217" :height="368" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:3:4"><ResponsiveMedia media-id="wiki-media-111618186805bc21-0566202dcf287f3f" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 0566202dcf287f3f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/ef853479b298db78/original.png" :width="158" :height="272" /></td></tr></tbody></table></div>
<!-- source-body:225:src-c8852cf69a7b:table:2870062292c4c4d9:table -->

图-7 轰炸机属性
<!-- source-body:226:src-c8852cf69a7b:paragraph:75d1e4ac500f5b79:paragraph -->

<!-- source-body:227:src-c8852cf69a7b:paragraph:1774a6845e736655:paragraph -->

<!-- source-body:228:src-c8852cf69a7b:paragraph:0f506d49d16e6d2d:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-3b6658bfa859f5b4-89beb8d0b6583bef"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 89beb8d0b6583bef"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/b6fa3e65c9049848/original.png"
  :width="1668"
  :height="710"
/>

列克星敦装备架+6 九七式舰攻（番）
<!-- source-body:229:src-c8852cf69a7b:paragraph:4ca0071e9835b749:paragraph -->

<!-- source-body:230:src-c8852cf69a7b:paragraph:f44bc9f82f0a0eb3:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-5f70e9b0cbdb9edd-4160f59e2b019430"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 4160f59e2b019430"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/8e956be324d5c1ad/original.png"
  :width="1673"
  :height="752"
/>

<ResponsiveMedia
  media-id="wiki-media-8207f2a6d4538e97-ed708fe2ebdb9258"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence ed708fe2ebdb9258"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/9e57f74f63cc927c/original.png"
  :width="180"
  :height="358"
/>

列克星敦装备架+10 萤火虫F.Mk.I
<!-- source-body:231:src-c8852cf69a7b:paragraph:9bea2b0544e27e79:paragraph -->

<!-- source-body:232:src-c8852cf69a7b:paragraph:c14f1c5034d032d2:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-6c104451973bbece-698d3c8c16c55557"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.11 轰炸机”章节的相关插图；DOCX occurrence 698d3c8c16c55557"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/61081211212edfe1/original.png"
  :width="1670"
  :height="748"
/>

列克星敦装备架+10 SBD（McClusky队）
<!-- source-body:233:src-c8852cf69a7b:paragraph:640d42ab40e16b2d:paragraph -->

<!-- source-body:234:src-c8852cf69a7b:paragraph:90d608a15f0aaf8d:paragraph -->

<!-- source-body:235:src-c8852cf69a7b:paragraph:3775bed1b9daafcc:paragraph -->

表-12 轰炸航装备轰炸机计算
<!-- source-body:236:src-c8852cf69a7b:paragraph:d00dab5670386d8d:paragraph -->

| 装备选装 | 航空值 | 轰炸值 | 轰炸取值 | 轰炸伤害 | 对无装备提升率 | 对+6 紫装提升率 | 对装备架提升率 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 无装备 |  |  |  |  | \ | \ | \ |
| 架+6 九七式舰攻（番） |  |  |  |  | 13.27% | \ | \ |
| 架+10 萤火虫F.Mk.I |  |  |  |  | 16.49% | 2.84% | \ |
| 架+10 SBD（McClusky队） |  |  |  |  | 19.33% | 5.35% | \ |
| 架+6 九七式舰攻（番） |  |  |  |  | 23.07% | \ | 8.65% |
| 架+10 萤火虫F.Mk.I |  |  |  |  | 28.76% | 4.63% | 10.54% |
| 架+10 SBD（McClusky队） |  |  |  |  | 33.63% | 8.58% | 11.99% |
<!-- source-body:237:src-c8852cf69a7b:table:7c02c81ceeaba3d5:table -->

<!-- source-body:238:src-c8852cf69a7b:paragraph:2ae09505d966d5d4:paragraph -->

由于轰炸机绝大部分数值对鱼雷航无效，故鱼雷航母的轰炸机只关注其特殊词条。通常鱼雷航母装备SBD-3无畏（Best）或者九七式舰攻（番）提高暴击率，装备BTD-1毁灭者提高暴击伤害，装备萤火虫F.Mk.I以提高防暴击率。对于轰炸航母而言，在轰炸飞机未能强化到之前最好使用九七式舰攻（番），而在PVE情况下考虑到暴击率，推荐有条件使用SBD作为最终选择。SBD由于为补给姬限定装备，很难获得，故相对更推荐九七式舰攻（番）。PVP情况则更多使用萤火虫。B-25B米切尔（Doolittle队）可视为BTD-1毁灭者的上位，但由于数量稀少，无法实现全列装，仅在拥有该装备时做推荐。
<!-- source-body:239:src-c8852cf69a7b:paragraph:a25ce3876f8e2c81:paragraph -->

<!-- source-body:240:src-c8852cf69a7b:paragraph:d274d76fc5ca3d6b:paragraph -->

##### 1.2.6.12 鱼雷机
<!-- source-body:241:src-c8852cf69a7b:heading:4b603e9c5dbd5171:paragraph -->

<!-- source-body:242:src-c8852cf69a7b:paragraph:8597009c7ea403e8:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:5b42c962b9d6bd21"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:1:1"><ResponsiveMedia media-id="wiki-media-c2169e4bcfa665f5-28db8368bfe61b83" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence 28db8368bfe61b83" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/88d0b19c63a89ca3/original.png" :width="216" :height="372" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:1:2"><ResponsiveMedia media-id="wiki-media-77352e72b74760f9-3052c2c71e9481a3" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence 3052c2c71e9481a3" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/f8f23db2537fb7c0/original.png" :width="218" :height="373" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:1:3"><ResponsiveMedia media-id="wiki-media-31f8df60534c1adc-83a991881ab6b228" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence 83a991881ab6b228" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/43776525a1e203c3/original.png" :width="214" :height="370" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:1:4"><ResponsiveMedia media-id="wiki-media-ba2aa8ce58dd994c-ddceb6dbb9d673ec" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence ddceb6dbb9d673ec" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/76eccf1476e45bea/original.png" :width="216" :height="372" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:2:1"><ResponsiveMedia media-id="wiki-media-6531bbf9ee9e6811-6a7fe21e1de3de83" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence 6a7fe21e1de3de83" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/0a7022ab3b66d450/original.png" :width="217" :height="370" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:2:2"><ResponsiveMedia media-id="wiki-media-d97a637a7318f4b9-603f8f5656d9dfed" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence 603f8f5656d9dfed" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/effd1445d653eb47/original.png" :width="218" :height="370" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:2:3"><ResponsiveMedia media-id="wiki-media-1bea30ef40402e60-a0934fd2c8f28dba" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence a0934fd2c8f28dba" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/8cabd81671b4a447/original.png" :width="215" :height="377" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:2:4"><ResponsiveMedia media-id="wiki-media-4d205f8570d12e95-e79fb2b332e7f084" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence e79fb2b332e7f084" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/1625c20afe59e427/original.png" :width="161" :height="272" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:3:1"><ResponsiveMedia media-id="wiki-media-56f36cf9bf041b54-8cf999f9f4231c8a" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence 8cf999f9f4231c8a" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/fd5336b5c87d6ffd/original.png" :width="163" :height="275" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:3:3">&nbsp;</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:3:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:243:src-c8852cf69a7b:table:5b42c962b9d6bd21:table -->

图-8 鱼雷机属性
<!-- source-body:244:src-c8852cf69a7b:paragraph:26643e760b3309f1:paragraph -->

<!-- source-body:245:src-c8852cf69a7b:paragraph:7fc46d8c9f6a4097:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-ae7447eb8a11500f-c5babdf6b8db2cda"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.12 鱼雷机”章节的相关插图；DOCX occurrence c5babdf6b8db2cda"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/05711d32fb5e0ec9/original.png"
  :width="1699"
  :height="751"
/>

列克星敦装备架+10 剑鱼TB.Mk.II（810NAS）
<!-- source-body:246:src-c8852cf69a7b:paragraph:ae589295baebeb21:paragraph -->

<!-- source-body:247:src-c8852cf69a7b:paragraph:83d7d29ebf13d596:paragraph -->

<!-- source-body:248:src-c8852cf69a7b:paragraph:1a73028d99894318:paragraph -->

表1-13 鱼雷航装备鱼雷机计算
<!-- source-body:249:src-c8852cf69a7b:paragraph:7e241a93fd0a8e2a:paragraph -->

| 装备选装 | 航空值 | 鱼雷值 | 鱼雷取值 | 鱼雷伤害 | 对无装备提升率 | 对+6 紫装提升率 | 对装备架提升率 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 无装备 |  |  |  |  | \ | \ | \ |
| 架+6 剑鱼TB.Mk.III |  |  |  |  | 10.14% | \ | \ |
| 架+10 天河 |  |  |  |  | 17.16% | 6.38% | \ |
| 架+10 剑鱼TB.Mk.II（810NAS） |  |  |  |  | 16.11% | 5.43% | \ |
| 架+6 剑鱼TB.Mk.III |  |  |  |  | 19.03% | \ | 8.07% |
| 架+10 天河 |  |  |  |  | 32.13% | 11.01% | 12.78% |
| 架+10 剑鱼TB.Mk.II（810NAS） |  |  |  |  | 30.18% | 9.37% | 12.12% |
<!-- source-body:250:src-c8852cf69a7b:table:ffa8576b035e871d:table -->

<!-- source-body:251:src-c8852cf69a7b:paragraph:b35d1ecc486a625c:paragraph -->

由于紫装与金装加成属性不完全相同，在金装尚未强化至前，通常更推荐使用紫剑鱼。对于轰炸航母，鱼雷机绝大部分词条对其无效，故仅看特殊词条所需的索敌或者幸运来进行选择。通常推荐携带金剑鱼提升输出。对于鱼雷航母，考虑到暴击率收益，建议遭遇战至少携带架金剑鱼，天河目前更多作用于PVP。TU-91为天河上位，与天河同位置装备即可。
<!-- source-body:252:src-c8852cf69a7b:paragraph:825b096d99f51a76:paragraph -->

注：对于轻母，其不能装备TU-91与天河。故轻母鱼雷机最优解为金剑鱼。
<!-- source-body:253:src-c8852cf69a7b:paragraph:b3a655653f19b692:paragraph -->

<!-- source-body:254:src-c8852cf69a7b:paragraph:6f3d756781d9c767:paragraph -->

##### 1.2.6.13 侦察机
<!-- source-body:255:src-c8852cf69a7b:heading:adfc520464eab1b7:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:1:1"><ResponsiveMedia media-id="wiki-media-df31f42ba52d7d41-eeb686098f9ed23b" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.13 侦察机”章节的相关插图；DOCX occurrence eeb686098f9ed23b" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/344963391e8127cf/original.png" :width="159" :height="275" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:1:2"><ResponsiveMedia media-id="wiki-media-e27d0e01a080d881-0691369ecee3bd91" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.13 侦察机”章节的相关插图；DOCX occurrence 0691369ecee3bd91" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/371554fb540057b8/original.png" :width="165" :height="280" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:1:3"><ResponsiveMedia media-id="wiki-media-a796f3f18cf75d32-bbbcfa0b9bc99534" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.13 侦察机”章节的相关插图；DOCX occurrence bbbcfa0b9bc99534" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/50fce14c778be4f9/original.png" :width="158" :height="275" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:1:4"><ResponsiveMedia media-id="wiki-media-6d9e4980ece000a0-934116bf7e48c058" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.13 侦察机”章节的相关插图；DOCX occurrence 934116bf7e48c058" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/3eb4d5a94172db09/original.png" :width="159" :height="280" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:2:1"><ResponsiveMedia media-id="wiki-media-f21eb5bd1e2ff580-98462124de2a29d2" alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.13 侦察机”章节的相关插图；DOCX occurrence 98462124de2a29d2" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/6762c33d79deed9f/original.png" :width="162" :height="277" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:2:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:2:3">&nbsp;</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:2:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:256:src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:table -->

图-9 侦察机属性
<!-- source-body:257:src-c8852cf69a7b:paragraph:834ce666a8bd2540:paragraph -->

<!-- source-body:258:src-c8852cf69a7b:paragraph:c854b4da19d7e5cf:paragraph -->

<!-- source-body:259:src-c8852cf69a7b:paragraph:2f44275289f7fabb:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-ad22ad3091b3691a-0ce29d6f41c0cfa2"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.13 侦察机”章节的相关插图；DOCX occurrence 0ce29d6f41c0cfa2"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/c3fec4a0a8d53c03/original.png"
  :width="1212"
  :height="555"
/>

伊势·改无装备
<!-- source-body:260:src-c8852cf69a7b:paragraph:5c5225bbfc1298f0:paragraph -->

<!-- source-body:261:src-c8852cf69a7b:paragraph:177ac746df5b9a86:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-0b5da84e4ecd9d23-f6412f815c6565a9"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.6.13 侦察机”章节的相关插图；DOCX occurrence f6412f815c6565a9"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/7aa14d02037c9ce3/original.png"
  :width="1238"
  :height="558"
/>

伊势·改装备架+10 瑞云一二型
<!-- source-body:262:src-c8852cf69a7b:paragraph:00b795616da1a577:paragraph -->

表1-14 航战装备侦察机计算
<!-- source-body:263:src-c8852cf69a7b:paragraph:65e16419ede6c4fa:paragraph -->

| 装备选装 | 航空值 | 轰炸值 | 轰炸取值 | 轰炸伤害 | 对无装备提升率 | 对紫提升率 | 对装备架提升率 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 无 |  |  |  |  | / | / | / |
| 架+6 瑞云一一型 |  |  |  |  | 11.12% | / | / |
| 架+6 瑞云一二型 |  |  |  |  | 13.80% | 2.41% | / |
| 架+10 瑞云一二型 |  |  |  |  | 20.28% | 8.24% | / |
| 架+6 瑞云一一型 |  |  |  |  | 21.18% | / | 9.05% |
| 架+10 瑞云一二型 |  |  |  |  | 38.68% | 14.45% | 15.30% |
<!-- source-body:264:src-c8852cf69a7b:table:204104f269bff711:table -->

<!-- source-body:265:src-c8852cf69a7b:paragraph:ffae91a9363a664b:paragraph -->

目前，携带侦察机能够提升输出的舰灵仅有镇海、伊势·改和日向·改。推荐尽可能携带瑞云一二型提高索敌值同时增加输出。若无瑞云一二型或其等级过低，则推荐携带瑞云一一型。对于特殊减CD装备，由于携带其在90S内不足以额外释放一次通常技，故练级时并不推荐。PVP通常推荐瑞云一二型提高索敌值。
<!-- source-body:266:src-c8852cf69a7b:paragraph:d2a21645bb1178f7:paragraph -->

<!-- source-body:267:src-c8852cf69a7b:paragraph:0b0668f2dc0e52c6:paragraph -->

#### 1.2.7 技能与旗舰
<!-- source-body:268:src-c8852cf69a7b:heading:94d45853a3641db9:paragraph -->

部分舰灵技能或旗舰技会提供攻击力加成（此处特指炮击，雷击，航空，轰炸，鱼雷+X%），需在面板数值的基础上乘以相应倍率，或加上相应数值。
<!-- source-body:269:src-c8852cf69a7b:paragraph:b9da8655a6dc459b:paragraph -->

例如：
<!-- source-body:270:src-c8852cf69a7b:paragraph:972b687259049f77:paragraph -->

<!-- source-body:271:src-c8852cf69a7b:paragraph:f00d8ab9b5e626ad:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-b30d71346f3fd211-58d1e5f40c4f8563"
  alt="《8.1 拂晓伤害计算构成.docx》“1.2.7 技能与旗舰”章节的相关插图；DOCX occurrence 58d1e5f40c4f8563"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/fe53a18f863db6b2/original.png"
  :width="1052"
  :height="349"
/>

旗舰示意图
<!-- source-body:272:src-c8852cf69a7b:paragraph:1b5f7ca362a7f52f:paragraph -->

计算冲撞伤害时，需要计算面板炮击+旗舰加成炮击（×1.2=751.2）。
<!-- source-body:273:src-c8852cf69a7b:paragraph:d964fdcebcfeca0f:paragraph -->

具体计算公式如下：
<!-- source-body:274:src-c8852cf69a7b:paragraph:e2d28c18ea539a82:paragraph -->

舰灵战斗实时数值=（舰灵面板数值+BUFF数值）
<!-- source-body:275:src-c8852cf69a7b:paragraph:eac1e712ffa96695:paragraph -->

×BUFF乘区
<!-- source-body:276:src-c8852cf69a7b:paragraph:5574fbf02811620b:paragraph -->

舰灵面板数值=（舰灵基础数值+装备加成）
<!-- source-body:277:src-c8852cf69a7b:paragraph:b6324b4cd43fa982:paragraph -->

×（1+羁绊百分比加成）
<!-- source-body:278:src-c8852cf69a7b:paragraph:cecb1976cc49b859:paragraph -->

舰灵基础数值=（舰灵面板白值+天赋加成）
<!-- source-body:279:src-c8852cf69a7b:paragraph:68cc98780d443adc:paragraph -->

×（1+天赋百分比加成）
<!-- source-body:280:src-c8852cf69a7b:paragraph:c941edc59ecdcdd2:paragraph -->

面板数值中前面白色数字就是已经计算好的舰灵面板数值，计算时取该值作为舰灵面板数值使用。由于不是每位舰灵技能描述中都有相应增加攻击力，计算前应核对队伍中各舰灵的技能与旗舰技。
<!-- source-body:281:src-c8852cf69a7b:paragraph:c54c9a228cc6a45e:paragraph -->

<!-- source-body:282:src-c8852cf69a7b:paragraph:2dd646170d23d229:paragraph -->
下一章：[防御力](./defense-power)。

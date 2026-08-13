---
id: combat-endless-sea-mechanics
title: "无尽海域二：机制知识储备"
description: "迁移技能模块、甲弹克制、射程锁定、敌舰模块与伤害处理。"
section: combat
order: 460
audience: ["advanced"]
contentType: guide
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-17"
verifiedAt: "2026-07-30"
status: current
authors:
  - name: 拂晓凤栖攻略组
    role: 授权资料迁移编辑
reviewers:
  - name: 暂无
    role: 进阶内容事实审核
sources:
  - title: "7.3 无尽海域配队思路.docx"
    assetId: src-51475ba227c9
    sourceType: docx
    permission: authorized
    publicUse:
      body: true
      asset: false
    notes: 已迁移授权正文；原始 DOCX 文件不开放下载，已授权的 DOCX 内嵌原图可在正文显示并下载。
tags: ["无尽海域","PVE","机制","伤害"]
related: ["combat-endless-sea-basics","combat-endless-sea-team-building","media-source-51475ba227c9"]
---
# 无尽海域二：机制知识储备
## 二、知识储备——拂晓PVE机制大学习
<!-- source-body:20:src-51475ba227c9:heading:a077bd57afb61417:paragraph -->

### （一）构建舰灵技能的模组化认知
<!-- source-body:21:src-51475ba227c9:heading:2b0e3b31f47027b5:paragraph -->

<!-- article-paragraph:prose -->
根据技能模组，可总体上划分出大范围AOE、小范围AOE、单体输出、生存拐、输出拐、奶六类模组。
<!-- source-body:22:src-51475ba227c9:paragraph:eda738d0a1aa3c3e:paragraph -->

<!-- article-paragraph:prose -->
需要注意的是，并非每个技能都只能归类为单一模组。最经典的例子就是小拉菲·改：通常技能为单体输出+自奶模组，必杀技能为对自己的输出拐+对自己的生存拐+大范围AOE模组。因为这些模组极其适配低难度PVE的要求，造就了小拉菲在低难度PVE中的统治级强度。
<!-- source-body:23:src-51475ba227c9:paragraph:51ab8fc564b69a02:paragraph -->

<!-- article-paragraph:prose -->
对你的高练度舰灵进行标签化的模组归类，能够全方位提高你对舰灵的能力认知。在后续的配队思路介绍中，“模组”相关的内容会反复被提到。
<!-- source-body:24:src-51475ba227c9:paragraph:040bbcb937dc9a44:paragraph -->

<!-- source-body:25:src-51475ba227c9:paragraph:4ffd5f99389236f8:paragraph -->

### （二）转变运用模组的思路：从“占模”到并重
<!-- source-body:26:src-51475ba227c9:heading:2cac66546f472fbb:paragraph -->

<!-- article-paragraph:prose -->
由于技能设计在总体上有平衡性要求，所以若一个技能有多种模组，其输出面板必然较低。同理，如果一个技能输出范围很大，其面板也应当低于小范围和单体技能。这就是所谓的“模组平衡”
<!-- source-body:27:src-51475ba227c9:paragraph:87f4dc3c4c504c50:paragraph -->

<!-- article-paragraph:prose -->
在无尽海域上线之前，由于PVE重输出、轻生存的总体环境。玩家普遍有所谓的“占模”心理。即在PVE场景中，将输出技能中的生存拐、奶等与输出关系不大的模组称为“占模”，典型的例子就是波拉，波拉的大招拥有极其强势的30%炮击伤害减免效果（前排生存拐），且CD不算太长，换来的代价就是伤害较低。
<!-- source-body:28:src-51475ba227c9:paragraph:992bdaf280ada653:paragraph -->

<!-- article-paragraph:prose -->
但在无尽海域玩法中，生存能力和输出能力应是并重的两端，这一点在60以上的高层尤为显著。这就意味着一些原本被认为占模的舰灵反而在无尽海域中表现强势，在一个队伍中带上1、2艘生存拐或奶模组的舰灵，往往能大大降低队伍暴毙的概率，从而极大程度地降低整体难度。
<!-- source-body:29:src-51475ba227c9:paragraph:33dfbef3c3f51093:paragraph -->

### （三）甲弹克制
<!-- source-body:30:src-51475ba227c9:heading:8b19c62e8cd2354a:paragraph -->

<!-- article-paragraph:prose -->
不同弹种对不同护甲有不同的伤害修正系数。需注意，甲弹克制的伤害修正为独立乘区，在出战时尽可能选择修正系数加成较高的舰种出战。
<!-- source-body:31:src-51475ba227c9:paragraph:aecfbb3406feb5c6:paragraph -->

<!-- source-body:32:src-51475ba227c9:paragraph:d21e8139fb7199fe:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-353c5d4b781ab968-57eb72172500e020"
  alt="《7.3 无尽海域配队思路.docx》“（三）甲弹克制”章节的相关插图；DOCX occurrence 57eb72172500e020"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-51475ba227c9/c4849f075634eac0/original.jpg"
  :width="310"
  :height="938"
/>

<!-- article-paragraph:prose -->
来自小强之王的《拂晓伤害构成》
<!-- source-body:33:src-51475ba227c9:paragraph:20c2797e953f93c5:paragraph -->

### （四）射程、锁定与技能自动释放
<!-- source-body:34:src-51475ba227c9:heading:daba44f79bbff2db:paragraph -->

<!-- article-paragraph:prose -->
不同种类舰灵的射程不同，敌舰只有进入射程内，才能被锁定并自动释放技能。
<!-- source-body:35:src-51475ba227c9:paragraph:f77c1120691160a5:paragraph -->

<!-- article-paragraph:prose -->
一般来说，小船&lt;中船&lt;大船，同种类里面，炮击&lt;雷击&lt;航空。雷击的实际有效射程长于其锁定射程。（感谢许言等的测试）
<!-- source-body:36:src-51475ba227c9:paragraph:b38e41e2306a83ed:paragraph -->

<!-- source-body:37:src-51475ba227c9:paragraph:b4b5b9e13dc75574:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-2f8c61e92279cc09-8f2e73273956be2a"
  alt="《7.3 无尽海域配队思路.docx》“（四）射程、锁定与技能自动释放”章节的相关插图；DOCX occurrence 8f2e73273956be2a"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-51475ba227c9/821bbc32574a9f8a/original.png"
  :width="921"
  :height="523"
/>

<!-- article-paragraph:prose -->
这也是女灶神被斥为打假赛的原因。
<!-- source-body:38:src-51475ba227c9:paragraph:57f306f8e878fe09:paragraph -->

<!-- source-body:39:src-51475ba227c9:paragraph:46b522ba2e587c69:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-b505f135dd437f2f-133b4b2a7fa31921"
  alt="《7.3 无尽海域配队思路.docx》“（四）射程、锁定与技能自动释放”章节的相关插图；DOCX occurrence 133b4b2a7fa31921"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-51475ba227c9/22d05ff7e957adf2/original.png"
  :width="470"
  :height="702"
/>

### （五）重要敌舰模组
<!-- source-body:40:src-51475ba227c9:heading:2838ddb4c72c3aed:paragraph -->

<!-- article-paragraph:prose -->
部分敌舰模组有自爆、控制、DOT、百分比伤害等效果，需要额外注意。
<!-- source-body:41:src-51475ba227c9:paragraph:9c74a62fe9b7909c:paragraph -->

<!-- article-paragraph:prose -->
这里仅列出60层以上，对我方威胁巨大的敌舰。
<!-- source-body:42:src-51475ba227c9:paragraph:ee7bf1ff46c284bc:paragraph -->

<!-- article-paragraph:prose -->
具体技能效果，感兴趣的可以在Wiki上查看。
<!-- source-body:43:src-51475ba227c9:paragraph:63a9444d42b95162:paragraph -->

<!-- article-paragraph:prose -->
固伤点燃、固有点燃为两种不同的点燃效果，想具体了解的可以去wiki页面查看。https://www.gamekee.com/fxslzk/710425.html，或在wiki搜索“穿甲、高爆弹机制”即可。
<!-- source-body:44:src-51475ba227c9:paragraph:527dd2bd098fca70:paragraph -->

<!-- article-paragraph:prose -->
感谢wiki大佬无星之夜对本小节的大力支持！
<!-- source-body:45:src-51475ba227c9:paragraph:c6a29af4b3e34ca0:paragraph -->

<div class="docx-table-scroll" data-source-table="src-51475ba227c9:table:c2146495dc0f8514" tabindex="0" role="region" aria-label="DOCX 原稿表格，可横向滚动"><table class="docx-table" aria-label="DOCX 原稿表格" data-source-table="src-51475ba227c9:table:c2146495dc0f8514" data-grid-columns="4"><tbody><tr><th data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:1:1">类型</th><th data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:1:2">主要威胁技能</th><th data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:1:3">效果</th><th data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:1:4">类型</th></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:2:1">乙级导驱</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:2:2">天降导弹</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:2:3">固伤点燃+高倍率</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:2:4">DOT+高伤</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:3:1">甲级导驱</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:3:2">天降导弹</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:3:3">眩晕+固伤点燃+高倍率</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:3:4">控制+DOT+高伤</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:4:1" rowspan="2">乙级重炮</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:4:2">自机狙炎爆</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:4:3" rowspan="2">固有点燃</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:4:4" rowspan="2">DOT</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:5:2">点燃炮击</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:6:1" rowspan="3">甲级重炮</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:6:2">重炮弹幕</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:6:3">概率进水</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:6:4">控制</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:7:2">自机狙炎爆</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:7:3" rowspan="2">固有点燃</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:7:4" rowspan="2">DOT</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:8:2">点燃炮击</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:9:1" rowspan="2">乙级航母</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:9:2">地毯式轰炸</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:9:3">固伤点燃+高倍率</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:9:4">DOT</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:10:2">航母高射炮</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:10:3">进水</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:10:4">控制</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:11:1" rowspan="3">甲级航母</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:11:2">航母轰炸机</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:11:3">进水</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:11:4">控制</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:12:2">地毯式轰炸</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:12:3">固伤点燃+高倍率</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:12:4">DOT</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:13:2">航母高射炮</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:13:3">固有点燃+进水</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:13:4">DOT+控制</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:14:1">乙级装母</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:14:2">装母制导炮</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:14:3">固有点燃</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:14:4">DOT</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:15:1">甲级装母</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:15:2">装母制导炮</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:15:3">固有点燃+火坑</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:15:4">DOT</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:16:1" rowspan="2">乙级航战</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:16:2">航战炮击</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:16:3">进水</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:16:4">控制</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:17:2">航战干扰机</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:17:3">减速</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:17:4">控制</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:18:1" rowspan="3">甲级航战</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:18:2">航战炮击</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:18:3">进水</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:18:4">控制</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:19:2">X字风暴</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:19:3">进水</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:19:4">控制</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:20:2">航战干扰机</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:20:3">减速</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:20:4">控制</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:21:1">乙级战列</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:21:2">战列炮击</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:21:3">火坑</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:21:4">DOT</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:22:1" rowspan="2">甲级战列</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:22:2">环状陨星</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:22:3">火坑</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:22:4">DOT</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:23:2">战列激光炮</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:23:3">激光</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:23:4">高伤</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:24:1">乙级战巡</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:24:2">战巡激光炮</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:24:3">激光</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:24:4">高伤</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:25:1">甲级战巡</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:25:2">战巡激光炮</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:25:3">激光+红弹固有点燃</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:25:4">高伤+DOT</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:26:1">乙级自爆</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:26:2">未命名</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:26:3">自爆</td><td data-grid-column="4" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:26:4">伤害后排</td></tr><tr><td data-grid-column="1" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:27:1" rowspan="2">布耶尔</td><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:27:2">高伤害能量球</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:27:3" colspan="2">伤害极高</td></tr><tr><td data-grid-column="2" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:28:2">其他所有技能</td><td data-grid-column="3" data-source-cell="src-51475ba227c9:table:c2146495dc0f8514:28:3" colspan="2">百分比真实伤害</td></tr></tbody></table></div>
<!-- source-body:46:src-51475ba227c9:table:c2146495dc0f8514:table -->

### （六）如何提升伤害
<!-- source-body:47:src-51475ba227c9:heading:7ec92954308a5cdc:paragraph -->

<!-- article-paragraph:prose -->
由于拂晓的伤害计算公式较为复杂，这里仅列出提升伤害的主要方法。具体公式请参考小强之王的《拂晓伤害构成》。
<!-- source-body:48:src-51475ba227c9:paragraph:b794d47abcb2b6d8:paragraph -->

<!-- article-paragraph:prose -->
1.升到满级、满星、满好感、满羁绊、天赋点满（一般不考虑洗天赋打无尽海域）；
<!-- source-body:49:src-51475ba227c9:paragraph:a41741cc652b3b75:paragraph -->

<!-- article-paragraph:prose -->
2.上最好的装备，注意命中不能太低，大船普遍命中较低，要格外注意；
<!-- source-body:50:src-51475ba227c9:paragraph:20fd238320cc9d84:paragraph -->

<!-- article-paragraph:prose -->
3.根据甲弹克制选船；
<!-- source-body:51:src-51475ba227c9:paragraph:994cf96febee568b:paragraph -->

<!-- article-paragraph:prose -->
4.抢T优、空占；
<!-- source-body:52:src-51475ba227c9:paragraph:e1b9f0f30233e5c1:paragraph -->

<!-- article-paragraph:prose -->
5.选择增伤阵型；
<!-- source-body:53:src-51475ba227c9:paragraph:43baaa435cb6f0ac:paragraph -->

<!-- article-paragraph:prose -->
6.选择增伤旗舰；
<!-- source-body:54:src-51475ba227c9:paragraph:ff34d6650d637ca2:paragraph -->

<!-- article-paragraph:prose -->
7.选择增伤装备，如超重弹、爆伤装备等；
<!-- source-body:55:src-51475ba227c9:paragraph:139e2f72d9394077:paragraph -->

<!-- article-paragraph:prose -->
8.选择有输出拐模组的舰灵；
<!-- source-body:56:src-51475ba227c9:paragraph:215841bac596c276:paragraph -->

<!-- article-paragraph:prose -->
9.手操。
<!-- source-body:57:src-51475ba227c9:paragraph:02b733b33dde9e8b:paragraph -->

### （七）如何规避伤害
<!-- source-body:58:src-51475ba227c9:heading:b35ecc3f73710217:paragraph -->

<!-- article-paragraph:prose -->
总体来说，规避伤害和提升伤害是一体两面的，具体如下：
<!-- source-body:59:src-51475ba227c9:paragraph:cf2efa685e7acfce:paragraph -->

<!-- article-paragraph:prose -->
1.升到满级、满星、满好感、满羁绊、天赋点满（一般不考虑洗天赋打无尽海域）；
<!-- source-body:60:src-51475ba227c9:paragraph:c692ee9d430e353c:paragraph -->

<!-- article-paragraph:prose -->
2.选择专用的减伤、机动装备，如防空炮、先进动力系统等；
<!-- source-body:61:src-51475ba227c9:paragraph:34be852527404334:paragraph -->

<!-- article-paragraph:prose -->
3.根据甲弹克制选船；
<!-- source-body:62:src-51475ba227c9:paragraph:eca200c67e51b746:paragraph -->

<!-- article-paragraph:prose -->
4.抢T优、空占；
<!-- source-body:63:src-51475ba227c9:paragraph:86633d824c749627:paragraph -->

<!-- article-paragraph:prose -->
5.选择复纵阵、轮型阵；
<!-- source-body:64:src-51475ba227c9:paragraph:acc67e8993a7c8fc:paragraph -->

<!-- article-paragraph:prose -->
6.选择减伤或机动、回避效果的旗舰；
<!-- source-body:65:src-51475ba227c9:paragraph:cfa19c4d8419229a:paragraph -->

<!-- article-paragraph:prose -->
7.通过装备、天赋、buff等堆装甲可减免炮击、雷击伤害，堆对空则可减免航空伤害。额外的，拉古兹的自爆属于雷击伤害；
<!-- source-body:66:src-51475ba227c9:paragraph:e9ae894bda1c539d:paragraph -->

<!-- article-paragraph:prose -->
8.选择有生存拐模组的舰灵；
<!-- source-body:67:src-51475ba227c9:paragraph:d589f49850920f82:paragraph -->

<!-- article-paragraph:prose -->
9.手操。
<!-- source-body:68:src-51475ba227c9:paragraph:547833653417cc0d:paragraph -->

<!-- source-body:69:src-51475ba227c9:paragraph:ee7dec2a88818800:paragraph -->
下一章：[配队思路](./endless-sea-team-building)。

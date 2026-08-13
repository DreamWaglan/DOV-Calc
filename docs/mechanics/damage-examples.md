---
id: mechanics-damage-examples
title: "伤害构成七：实际核算"
description: "迁移实际核算、结语与参考文献，提供后续复算入口。"
section: mechanics
order: 370
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
tags: ["伤害","核算","样例","参考文献"]
related: ["mechanics-hit-critical","tool-damage-calculator","mechanics-damage-model","media-source-c8852cf69a7b"]
---
# 伤害构成七：实际核算
## 实际核算
<!-- source-body:635:src-c8852cf69a7b:heading:e6988ae5b6b6e090:paragraph -->

<!-- article-paragraph:prose -->
本章会给出一个例子，让大家能明白本攻略的作用。
<!-- source-body:636:src-c8852cf69a7b:paragraph:7a0eee43436f5f78:paragraph -->

<!-- source-body:637:src-c8852cf69a7b:paragraph:7146c13f955c9645:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-b47e23609bef4569-00446dfb760d7366"
  alt="《8.1 拂晓伤害计算构成.docx》“实际核算”章节的相关插图；DOCX occurrence 00446dfb760d7366"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/7d16f81bd3614fa4/original.png"
  :width="2400"
  :height="1088"
/>

<!-- source-body:638:src-c8852cf69a7b:paragraph:b2ae10ae693fa2a9:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-74565dd2fba1cd3a-ae5d193a60cbd33f"
  alt="《8.1 拂晓伤害计算构成.docx》“实际核算”章节的相关插图；DOCX occurrence ae5d193a60cbd33f"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/f510ef2b37d0e4fc/original.png"
  :width="2400"
  :height="1088"
/>

<!-- source-body:639:src-c8852cf69a7b:paragraph:92c53de96cc1b84b:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-cfb88032aca41fa0-7f89c51b3e51b703"
  alt="《8.1 拂晓伤害计算构成.docx》“实际核算”章节的相关插图；DOCX occurrence 7f89c51b3e51b703"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/09287a7a2691afd6/original.png"
  :width="2400"
  :height="1088"
/>

<!-- source-body:640:src-c8852cf69a7b:paragraph:2ac35379a8541919:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-8497cb89ea96766f-2184bd74048910b2"
  alt="《8.1 拂晓伤害计算构成.docx》“实际核算”章节的相关插图；DOCX occurrence 2184bd74048910b2"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/74dcfffc95e1154a/original.png"
  :width="1606"
  :height="735"
/>

<!-- source-body:641:src-c8852cf69a7b:paragraph:3a234a0b3d54f6f4:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-b931de8993ef28e5-e594b73f522ba513"
  alt="《8.1 拂晓伤害计算构成.docx》“实际核算”章节的相关插图；DOCX occurrence e594b73f522ba513"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/db0141b7483c0ced/original.png"
  :width="1610"
  :height="690"
/>

<!-- source-body:642:src-c8852cf69a7b:paragraph:e95fe8b73d78692c:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-376f8027be810241-170dd8fb21e17116"
  alt="《8.1 拂晓伤害计算构成.docx》“实际核算”章节的相关插图；DOCX occurrence 170dd8fb21e17116"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/3ca30c5c5d214dd4/original.png"
  :width="1671"
  :height="750"
/>

<!-- article-paragraph:non-prose -->
计算需求数据图示
<!-- source-body:643:src-c8852cf69a7b:paragraph:12280df6c8067c7b:paragraph -->

<!-- article-paragraph:prose -->
上述为作者打19-5的某套阵容，对该阵容输出进行核算，可得：
<!-- source-body:644:src-c8852cf69a7b:paragraph:468ce8ef64a67efc:paragraph -->

<!-- article-paragraph:prose -->
按90秒战斗时长计算（以剩余时间93秒为结算节点），岛风在该节点内释放了8次通常技，4次必杀技；饺子打出了6次支援技。同时由于饺子旗舰技效果，敌方的航空伤害减免降低10个百分点，因此减伤修正为110%。
<!-- source-body:645:src-c8852cf69a7b:paragraph:979d4f5ee5ef277e:paragraph -->

<!-- article-paragraph:prose -->
岛风最终总伤为：通常技默认暴击后为2672.82，计算暴击爆伤命中后得出最终伤害为2260.08。必杀技默认暴击后为71906.52，计算暴击爆伤命中后得出最终伤害为60802.55。则总伤为2260.08×8+60802.55×4=261290.84
<!-- source-body:646:src-c8852cf69a7b:paragraph:85bb2488020b6dfd:paragraph -->

<!-- article-paragraph:prose -->
饺子支援技一次暴击后为79490.24，进行暴击爆伤命中计算后为48347.24，总伤为48347.24×6=290083.44
<!-- source-body:647:src-c8852cf69a7b:paragraph:db1122439cb3b796:paragraph -->

<!-- article-paragraph:prose -->
加和后队伍总伤为290083.44+261290.84=551374.28
<!-- source-body:648:src-c8852cf69a7b:paragraph:709b0a0fe6fab395:paragraph -->

<!-- article-paragraph:prose -->
理论总伤高于19-5的实际血量460360，因此该阵容在上述假设下具有稳定通关的条件。
<!-- source-body:649:src-c8852cf69a7b:paragraph:dddb6e6ad8b41cbf:paragraph -->

<!-- article-paragraph:prose -->
附上关卡部分计算用数据。
<!-- source-body:650:src-c8852cf69a7b:paragraph:c1277c9c967108b8:paragraph -->

<!-- source-body:651:src-c8852cf69a7b:paragraph:c2aae9da636cb400:paragraph -->

<!-- article-paragraph:non-prose -->
表5-1 PVE核算数据
<!-- source-body:652:src-c8852cf69a7b:paragraph:29b00e3b6b90b1f1:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:33d7a53f2fe3dc25" tabindex="0" role="region" aria-label="DOCX 原稿表格，可横向滚动"><table class="docx-table" aria-label="DOCX 原稿表格" data-source-table="src-c8852cf69a7b:table:33d7a53f2fe3dc25" data-grid-columns="6"><tbody><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:1:1">PVE战备</th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:1:2">装甲值</th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:1:3">对空值</th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:1:4">血量</th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:1:5">机动值</th><th data-grid-column="6" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:1:6">幸运</th></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:2:1">19-5</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:2:2">737</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:2:3">523</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:2:4">460360</td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:2:5">125</td><td data-grid-column="6" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:2:6">15</td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:3:1">19-10</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:3:2">528</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:3:3">1367</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:3:4">385530</td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:3:5">203</td><td data-grid-column="6" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:3:6">15</td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:4:1">20-5/只 </td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:4:2">335</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:4:3">716</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:4:4">198507</td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:4:5">149</td><td data-grid-column="6" data-source-cell="src-c8852cf69a7b:table:33d7a53f2fe3dc25:4:6">15</td></tr></tbody></table></div>
<!-- source-body:653:src-c8852cf69a7b:table:33d7a53f2fe3dc25:table -->

<!-- source-body:654:src-c8852cf69a7b:paragraph:08bad6b5be4be266:paragraph -->

## 结语
<!-- source-body:655:src-c8852cf69a7b:heading:0f7c9fe6e4732136:paragraph -->

<!-- article-paragraph:prose -->
本文给出了玩家计算拂晓舰灵的伤害计算方法，可减少玩家通过反复实战尝试来判断阵容能否通关所需的时间。此外，建议采用十次实战采样法进行验证：若十次挑战均告失败，可判定该阵容通关概率低于10%，不具备实战稳定性，需及时调整配队策略。
<!-- source-body:656:src-c8852cf69a7b:paragraph:e499a73374eb1087:paragraph -->

<!-- article-paragraph:prose -->
同时可配合本攻略参考《练级百科》（来自时雨今天下班没）、《入坑一天行动攻略》（来自时雨今天下班没）、《攻略替换思路》（来自小强之王）、《给萌新的PVE配队思路》（来自小强之王）、《遭遇战攻略》（来自小强之王）、《争锋竞技场简易百科》（来自万理一空）。
<!-- source-body:657:src-c8852cf69a7b:paragraph:964c79f61ea9d352:paragraph -->

<!-- article-paragraph:prose -->
在此感谢北冥无成、冬眠0303、立香、清谧、时雨今天下班没、无星之夜、竹与禾于本攻略撰写期间提供的宝贵建议与数据支持（排名不分先后，按首字母排序）。
<!-- source-body:658:src-c8852cf69a7b:paragraph:814f2c7b6e423d97:paragraph -->

<!-- source-body:659:src-c8852cf69a7b:paragraph:766b2a745b0d9a3e:paragraph -->

<!-- article-paragraph:non-prose -->
作者：小强之王
<!-- source-body:660:src-c8852cf69a7b:paragraph:351ca9879d972931:paragraph -->

<!-- article-paragraph:prose -->
本攻略版权归凤栖攻略组所有。
<!-- source-body:661:src-c8852cf69a7b:paragraph:9fd8caddbf990af1:paragraph -->

<!-- source-body:662:src-c8852cf69a7b:paragraph:6bc9028de8d75052:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-ed1d1a74ea49bae6-3aa1073e53199431"
  alt="《8.1 拂晓伤害计算构成.docx》“结语”章节的相关插图；DOCX occurrence 3aa1073e53199431"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/e5adb64eb2838488/original.jpeg"
  :width="649"
  :height="325"
/>

## 参考文献：
<!-- source-body:663:src-c8852cf69a7b:heading:a2c513aa6d2fc07f:paragraph -->

<!-- article-paragraph:non-prose -->
拂晓wiki.伤害计算公式.拂晓：胜利之刻伤害计算公式Q&amp;A_拂晓：胜利之刻wiki|GameKee
<!-- source-body:664:src-c8852cf69a7b:paragraph:a6e431863b36a907:paragraph -->

<!-- article-paragraph:non-prose -->
拂晓wiki.机库与制空值.拂晓：胜利之刻机库与制空值_拂晓：胜利之刻wiki|GameKee
<!-- source-body:665:src-c8852cf69a7b:paragraph:c92bae221c9c7d26:paragraph -->

<!-- article-paragraph:non-prose -->
拂晓wiki.弹种对甲伤害修正.拂晓：胜利之刻弹种对甲伤害修正_拂晓：胜利之刻wiki|GameKee
<!-- source-body:666:src-c8852cf69a7b:paragraph:b48ef29127940f90:paragraph -->

<!-- article-paragraph:non-prose -->
拂晓wiki.舰灵主副炮装填循环数值表.拂晓：胜利之刻舰灵主副炮装填循环数值表_拂晓：胜利之刻wiki|GameKee
<!-- source-body:667:src-c8852cf69a7b:paragraph:9bbe4172d72c0827:paragraph -->

<!-- article-paragraph:non-prose -->
拂晓wiki.普攻点燃.拂晓：胜利之刻普攻点燃_拂晓：胜利之刻wiki|GameKee
<!-- source-body:668:src-c8852cf69a7b:paragraph:66ee37404043c7e8:paragraph -->

<!-- article-paragraph:non-prose -->
拂晓wiki.穿甲、高爆弹机制.拂晓：胜利之刻穿甲、高爆弹机制_拂晓：胜利之刻wiki|GameKee
<!-- source-body:669:src-c8852cf69a7b:paragraph:dcd60e447c4607a8:paragraph -->

<!-- article-paragraph:non-prose -->
小强之王.拂晓舰灵普攻倍率CD.
<!-- source-body:670:src-c8852cf69a7b:paragraph:89fbe4865e76f09b:paragraph -->

<!-- article-paragraph:non-prose -->
拂晓wiki.舰灵数值和命中暴击.拂晓：胜利之刻舰灵数值和命中暴击_拂晓：胜利之刻wiki|GameKee
<!-- source-body:671:src-c8852cf69a7b:paragraph:788c51adc9b3b54b:paragraph -->

<!-- article-paragraph:non-prose -->
拂晓wiki.幸运值面板计算公式.拂晓：胜利之刻幸运值面板计算公式_拂晓：胜利之刻wiki|GameKee
<!-- source-body:672:src-c8852cf69a7b:paragraph:6263c24ed7daf397:paragraph -->

<!-- source-body:673:src-c8852cf69a7b:paragraph:0dd19352d0ecb5db:paragraph -->

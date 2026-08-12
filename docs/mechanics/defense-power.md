---
id: mechanics-defense-power
title: "伤害构成三：防御力"
description: "迁移 PVE/PVP 防御力定义、影响因素与装备修正。"
section: mechanics
order: 330
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
tags: ["伤害","防御力","PVE","PVP"]
related: ["mechanics-attack-power","mechanics-damage-multipliers","media-source-c8852cf69a7b"]
---
# 伤害构成三：防御力
## 防御力：
<!-- source-body:283:src-c8852cf69a7b:heading:66065b10cc46b2f6:paragraph -->

### 2.1 防御力是什么
<!-- source-body:284:src-c8852cf69a7b:heading:4d5e9e637dd7aa2d:paragraph -->

顾名思义，防御力与攻击力存在对应关系。即将攻击类型与防御类型相互对应，具体如下：
<!-- source-body:285:src-c8852cf69a7b:paragraph:376c1809d49c6111:paragraph -->

计算炮击、雷击、高平两用炮、冲撞伤害时，防御类型使用装甲，即防御值=装甲值。
<!-- source-body:286:src-c8852cf69a7b:paragraph:e38c2dbb27d06ff4:paragraph -->

计算战斗机、轰炸机、鱼雷机时，防御类型使用对空，即防御值=对空值。
<!-- source-body:287:src-c8852cf69a7b:paragraph:11936ea7d4ab183c:paragraph -->

以下图为例：
<!-- source-body:288:src-c8852cf69a7b:paragraph:bd7825c46ca7182c:paragraph -->

<!-- source-body:289:src-c8852cf69a7b:paragraph:005076cce6a5567d:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-03b96fe4f1011f15-eec4823a99c32e8b"
  alt="《8.1 拂晓伤害计算构成.docx》“2.1 防御力是什么”章节的相关插图；DOCX occurrence eec4823a99c32e8b"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/5f376f2be9335447/original.png"
  :width="1041"
  :height="349"
/>

装甲值示意图
<!-- source-body:290:src-c8852cf69a7b:paragraph:51136374ece8f1fe:paragraph -->

计算技能伤害时，对应防御力取装甲值。
<!-- source-body:291:src-c8852cf69a7b:paragraph:28a9288f83acecb7:paragraph -->

### 2.2 影响因素
<!-- source-body:292:src-c8852cf69a7b:heading:9d4e539485060f1e:paragraph -->

本处需要区分PVE与PVP的关系，PVE通常为固定数值，PVP中需按技能命中目标的实际属性计算，可参考己方同名舰灵的面板数值进行估算。
<!-- source-body:293:src-c8852cf69a7b:paragraph:d2ad8f7afcd8fd1e:paragraph -->

#### 2.2.1 PVE数值
<!-- source-body:294:src-c8852cf69a7b:heading:d3b527f5ca8aafa6:paragraph -->

19-5：装甲值，对空值
<!-- source-body:295:src-c8852cf69a7b:paragraph:36807f24604369ee:paragraph -->

19-10：装甲值，对空值
<!-- source-body:296:src-c8852cf69a7b:paragraph:b1fc46becfdc5e79:paragraph -->

20-5：装甲值，对空值
<!-- source-body:297:src-c8852cf69a7b:paragraph:2d46f9c7cc9a58d3:paragraph -->

其余关卡特别是多怪关卡暂未找到。
<!-- source-body:298:src-c8852cf69a7b:paragraph:e78e295a6a41bab0:paragraph -->

#### 2.2.2 PVP数值
<!-- source-body:299:src-c8852cf69a7b:heading:a2fb146714ae139f:paragraph -->

影响因素与攻击力相同，案例请看攻击力处，此处不再赘述，仅给出数据计算。
<!-- source-body:300:src-c8852cf69a7b:paragraph:323cbb36fa942de6:paragraph -->

##### 2.2.2.1 天赋
<!-- source-body:301:src-c8852cf69a7b:heading:a7e2fbefb71442cb:paragraph -->

天赋通常为百分比加成，也有直接数值加成，以荷马为例：
<!-- source-body:302:src-c8852cf69a7b:paragraph:a0175d9b1f1570ed:paragraph -->

<!-- source-body:303:src-c8852cf69a7b:paragraph:03ad3efd09599ca9:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-82410e8fea5c0c80-549da5301662d830"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.1 天赋”章节的相关插图；DOCX occurrence 549da5301662d830"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/d1571d6bfb69c65b/original.png"
  :width="349"
  :height="131"
/>

天赋示意图
<!-- source-body:304:src-c8852cf69a7b:paragraph:b7379b14ac464413:paragraph -->

<!-- source-body:305:src-c8852cf69a7b:paragraph:2333547b4c3dc0f3:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-1d88fdc25131df04-3dd4c35f8545610b"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.1 天赋”章节的相关插图；DOCX occurrence 3dd4c35f8545610b"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/7fb69dc583142b87/original.png"
  :width="1685"
  :height="748"
/>

未点亮天赋前荷马面板
<!-- source-body:306:src-c8852cf69a7b:paragraph:d8386c0839f3ebbc:paragraph -->

<!-- source-body:307:src-c8852cf69a7b:paragraph:6191a10ef0318d96:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-6445964bfb781f20-a893c2e242a01206"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.1 天赋”章节的相关插图；DOCX occurrence a893c2e242a01206"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/edc45c4ab3be0235/original.png"
  :width="1668"
  :height="755"
/>

点亮天赋后荷马面板
<!-- source-body:308:src-c8852cf69a7b:paragraph:79e0e51d328065d8:paragraph -->

以攻击力，倍率为700%，弹种增伤为130%，暴击伤害为140%，增伤区固定为145%，减伤区固定为100%的攻击对不同天赋下荷马的受击进行计算，点亮天赋后受击约为未点亮前的89.45%。等效减伤率提升约11.8%。
<!-- source-body:309:src-c8852cf69a7b:paragraph:f577d4f3dca4dba8:paragraph -->

<!-- source-body:310:src-c8852cf69a7b:paragraph:1b14216e931a4eec:paragraph -->

##### 2.2.2.2 等级与星级
<!-- source-body:311:src-c8852cf69a7b:heading:eca27c3da30564bb:paragraph -->

案例请看1.2.，以鹰在不同等级下的装甲值为例，在攻击力、倍率500%、弹种修正100%的条件下计算，级受到伤害约为级的94.8%（差距点）。对唐斯在不同星级下装甲值进行同等计算，可得星受到伤害约为星的99.39%（差距仅点）。
<!-- source-body:312:src-c8852cf69a7b:paragraph:0fedc298fa070aee:paragraph -->

<!-- source-body:313:src-c8852cf69a7b:paragraph:2e22a2c4b5fce8e2:paragraph -->

##### 2.2.2.3 装备
<!-- source-body:314:src-c8852cf69a7b:heading:a8e454e13f54159f:paragraph -->

目前，可提升对空值的装备主要包括防空炮、舰载机和对空雷达；可提升装甲值的装备主要包括均质装甲和普列塞水下防护系统。通常设备位均需携带5G-1对海搜索雷达，而舰载机位与防空炮位对空值仅对造成航空伤害的舰灵有效，下文仅给出理想化模型下的计算结果。
<!-- source-body:315:src-c8852cf69a7b:paragraph:665fa1e41e62c18b:paragraph -->

取敌方攻击，倍率700%，默认增伤区145%，暴击伤害140%，弹种125%，无减伤修正对以下目标进行攻击。
<!-- source-body:316:src-c8852cf69a7b:paragraph:553e89e4c4890a55:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:a9b235c7eb74029e"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:a9b235c7eb74029e:1:1"><ResponsiveMedia media-id="wiki-media-bb80938310897556-43d011af499fc87f" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 43d011af499fc87f" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/49aef49a40754ad9/original.png" :width="220" :height="372" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:a9b235c7eb74029e:1:2"><ResponsiveMedia media-id="wiki-media-1252660d01d1376c-7cf93de0ceb8fffe" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 7cf93de0ceb8fffe" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/cf7231aefd750320/original.png" :width="217" :height="371" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:a9b235c7eb74029e:1:3"><ResponsiveMedia media-id="wiki-media-2316239918443615-1424f4aa55cc0a0d" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 1424f4aa55cc0a0d" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/f1afbe571a22dd0e/original.png" :width="216" :height="373" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:a9b235c7eb74029e:1:4"><ResponsiveMedia media-id="wiki-media-b2ccb95ea4c50c18-520e5826e52ff766" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 520e5826e52ff766" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/c345c4321c83bb50/original.png" :width="218" :height="367" /></th></tr></thead></table></div>
<!-- source-body:317:src-c8852cf69a7b:table:a9b235c7eb74029e:table -->

图-1 装甲值装备属性
<!-- source-body:318:src-c8852cf69a7b:paragraph:d2f563476a19e2d9:paragraph -->

<!-- source-body:319:src-c8852cf69a7b:paragraph:c0ec715d6b85c18a:paragraph -->

<!-- source-body:320:src-c8852cf69a7b:paragraph:5a8e469604ae99b1:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-1b245b2617c4c7ea-9ca4fabc86158d1f"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 9ca4fabc86158d1f"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/58441753c97c7f7f/original.png"
  :width="1664"
  :height="732"
/>

吹雪装备个均质装甲（小型）
<!-- source-body:321:src-c8852cf69a7b:paragraph:23ec22e2a959cb95:paragraph -->

<!-- source-body:322:src-c8852cf69a7b:paragraph:af4555f03c8f68bd:paragraph -->

表2-1 驱逐装备均质装甲（小型）计算
<!-- source-body:323:src-c8852cf69a7b:paragraph:af915c279c19a049:paragraph -->

| 吹雪 | 装甲值 | 受击伤害 | 对比无装备 | 对比装备个 |
| --- | --- | --- | --- | --- |
| 无装备 |  |  | 100.00% | \ |
| 装备均质装甲 |  |  | 87.94% | 100% |
| 装备均质装甲 |  |  | 78.13% | 88.84% |
<!-- source-body:324:src-c8852cf69a7b:table:2980e6bf92377bc6:table -->

<!-- source-body:325:src-c8852cf69a7b:paragraph:dea7206b1f21baaf:paragraph -->

<!-- source-body:326:src-c8852cf69a7b:paragraph:5d3f6940dcc30641:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-9526ab1b4c341e93-cc004f403eeb5257"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence cc004f403eeb5257"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/6abd721b33145251/original.png"
  :width="1652"
  :height="749"
/>

兰利装备个均质装甲（中型）
<!-- source-body:327:src-c8852cf69a7b:paragraph:cb77672df3f0c572:paragraph -->

<!-- source-body:328:src-c8852cf69a7b:paragraph:2327d079f54afbb2:paragraph -->

表2-2 轻母装备均质装甲（中型）计算
<!-- source-body:329:src-c8852cf69a7b:paragraph:f056b5c1226f6ad8:paragraph -->

| 兰利 | 装甲值 | 受击伤害 | 对比无装备 | 对比装备个 |
| --- | --- | --- | --- | --- |
| 无装备 |  |  | 100.00% | \ |
| 装备均质装甲 |  |  | 85.55% | 100% |
| 装备均质装甲 |  |  | 74.22% | 86.76% |
<!-- source-body:330:src-c8852cf69a7b:table:7ed60c0becb5687c:table -->

<!-- source-body:331:src-c8852cf69a7b:paragraph:811e73ff901815a5:paragraph -->

<!-- source-body:332:src-c8852cf69a7b:paragraph:6e6fb7f777c9349c:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-ac5d55b406fe1627-568b65b7008d64f4"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 568b65b7008d64f4"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/3b12bb11e18d9136/original.png"
  :width="1650"
  :height="733"
/>

荷马装备个均质装甲（大型）
<!-- source-body:333:src-c8852cf69a7b:paragraph:07129adf922bb5e1:paragraph -->

<!-- source-body:334:src-c8852cf69a7b:paragraph:3a589206c8b30b0e:paragraph -->

表2-3 战列装备均质装甲（大型）计算
<!-- source-body:335:src-c8852cf69a7b:paragraph:8a63c5e7fc47c296:paragraph -->

| 荷马 | 装甲值 | 受击伤害 | 对比无装备 | 对比装备个 |
| --- | --- | --- | --- | --- |
| 无装备 |  |  | 100.00% | \ |
| 装备均质装甲 |  |  | 89.28% | 100% |
| 装备均质装甲 |  |  | 80.31% | 89.95% |
<!-- source-body:336:src-c8852cf69a7b:table:a13a9fa45c73fc1d:table -->

<!-- source-body:337:src-c8852cf69a7b:paragraph:b6b6bd98c514fb6c:paragraph -->

<!-- source-body:338:src-c8852cf69a7b:paragraph:5797f84e31eae052:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-9fd96f9e56bf3339-44f4296aff1b44ea"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 44f4296aff1b44ea"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/495b45aeb69eeeac/original.png"
  :width="1647"
  :height="755"
/>

荷马装备个普列塞水下防护系统
<!-- source-body:339:src-c8852cf69a7b:paragraph:2fc2d851fb1b7f5e:paragraph -->

<!-- source-body:340:src-c8852cf69a7b:paragraph:60e48c6c583b66d3:paragraph -->

<!-- source-body:341:src-c8852cf69a7b:paragraph:e2d00a7f00beecc4:paragraph -->

表2-4 战列装备普列塞水下防护系统计算
<!-- source-body:342:src-c8852cf69a7b:paragraph:cf083b146c701c79:paragraph -->

| 荷马 | 装甲值 | 受击伤害 | 对比无装备 | 对比装备个 |
| --- | --- | --- | --- | --- |
| 无装备 |  |  | 100.00% | \ |
| 装备普列塞 |  |  | 86.84% | 100% |
| 装备普列塞 |  |  | 76.67% | 88.29% |
<!-- source-body:343:src-c8852cf69a7b:table:3996a37a6e878a37:table -->

<!-- source-body:344:src-c8852cf69a7b:paragraph:4f3102b8efe13fdf:paragraph -->

可以看到，在小船与中船身上，装备个均质装甲时，减伤效果较为明显，可以作为没有先进型动力系统时的平替选择。同时由于自爆船伤害类型为雷击，吃装甲值与雷击减伤。故更推荐在多自爆船活动图中，给较为低等级的后排携带均质装甲以避免因血量低于50%而影响关卡评价。
<!-- source-body:345:src-c8852cf69a7b:paragraph:5aa3c864e91bad1f:paragraph -->

对于大船而言，由于普列塞能够强化至，其提供数值比均质装甲更高，通常更推荐携带普列塞作为提升防御值手段。但考虑到大船PVP索敌，且PVE由于其机动值较低通常携带先进型动力系统以提高生存能力，故仅推荐前排T位携带普列塞。
<!-- source-body:346:src-c8852cf69a7b:paragraph:a1baa3e4d188e05e:paragraph -->

同时由于普列塞的减伤词条存在，使其更能抵御鱼雷机伤害，在多鱼雷机环境中也推荐使用。
<!-- source-body:347:src-c8852cf69a7b:paragraph:4190ec25b9325cee:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:06f84a13b4797a85"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:1:1"><ResponsiveMedia media-id="wiki-media-881b39abfd62947a-49bd313facf180c3" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 49bd313facf180c3" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/e683410fea9cb30c/original.png" :width="218" :height="372" /></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:1:2"><ResponsiveMedia media-id="wiki-media-146ff7530c8a8ded-70c0f53d4dcd9581" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 70c0f53d4dcd9581" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/419ac84cb8ea2e2d/original.png" :width="221" :height="377" /></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:1:3"><ResponsiveMedia media-id="wiki-media-1321c54199a4286a-a206a1698900c3a3" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence a206a1698900c3a3" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/2eb50ba75525a8bc/original.png" :width="217" :height="376" /></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:1:4"><ResponsiveMedia media-id="wiki-media-c31700ce54f8f5a6-d941c53a7168281e" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence d941c53a7168281e" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/aad92118b67c5b15/original.png" :width="219" :height="378" /></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:2:1"><ResponsiveMedia media-id="wiki-media-56c4155f90a572f1-456b89c503cb685b" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 456b89c503cb685b" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/ead25a713651667e/original.png" :width="218" :height="376" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:2:2"><ResponsiveMedia media-id="wiki-media-5ce007e98fc56cf3-559ac7d60791817e" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 559ac7d60791817e" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/7f721ef3eb713808/original.png" :width="219" :height="374" /></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:2:3"><ResponsiveMedia media-id="wiki-media-6d79b67e559e6308-32817eae10d3d0e9" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 32817eae10d3d0e9" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/62bad3ce9b54321e/original.png" :width="161" :height="285" /></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:2:4"><ResponsiveMedia media-id="wiki-media-7c47518f05a1b69d-a2176388f4b7fb18" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence a2176388f4b7fb18" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/26838b6f84bd7a5c/original.png" :width="159" :height="274" /></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:3:1"><ResponsiveMedia media-id="wiki-media-843405ed658374cf-49388043aa132ff1" alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 49388043aa132ff1" display-mode="table-cell" :variants='[]' fallback-path="/wiki-media/src-c8852cf69a7b/8e63a04cb46e5ecb/original.png" :width="186" :height="318" /></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:3:3">&nbsp;</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:3:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:348:src-c8852cf69a7b:table:06f84a13b4797a85:table -->

图-2 防空炮装备属性
<!-- source-body:349:src-c8852cf69a7b:paragraph:ddf6e4c16cb8da83:paragraph -->

<!-- source-body:350:src-c8852cf69a7b:paragraph:f61388560050375e:paragraph -->

<!-- source-body:351:src-c8852cf69a7b:paragraph:772fdacd12d44827:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-2b44a9cacc815af6-b6936ca30d87d4d2"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence b6936ca30d87d4d2"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/28e2a3dc754f88a3/original.png"
  :width="1661"
  :height="761"
/>

荷马装备门二十八联装120mm喷进炮
<!-- source-body:352:src-c8852cf69a7b:paragraph:8b610abcd58b3e1a:paragraph -->

<!-- source-body:353:src-c8852cf69a7b:paragraph:45f583702bb5abed:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-33c19f116ef72597-48991226d92bd7b3"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.3 装备”章节的相关插图；DOCX occurrence 48991226d92bd7b3"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/0855e49f3cf6292d/original.png"
  :width="1677"
  :height="748"
/>

荷马装备门四联装博福斯40mm防空炮（Mk4）
<!-- source-body:354:src-c8852cf69a7b:paragraph:e2b16e974544701a:paragraph -->

<!-- source-body:355:src-c8852cf69a7b:paragraph:0f37a60bddb63569:paragraph -->

<!-- source-body:356:src-c8852cf69a7b:paragraph:4b0d1fd61c5574d4:paragraph -->

表2-5 战列装备防空炮计算
<!-- source-body:357:src-c8852cf69a7b:paragraph:a9aaea753230af70:paragraph -->

| 荷马 | 对空值 | 受击伤害 | 对比无装备 | 对比装备门 |
| --- | --- | --- | --- | --- |
| 无装备 |  |  | 100.00% | \ |
| 装备门 +6 二十八联装120mm喷进炮 |  |  | 92.81% | \ |
| 装备门 +10 四联装博福斯40mm防空炮（Mk4） |  |  | 88.55% | \ |
| 装备门 +6 二十八联装120mm喷进炮 |  |  | 86.29% | 92.98% |
| 装备门 +10 四联装博福斯40mm防空炮（Mk4） |  |  | 78.86% | 89.06% |
<!-- source-body:358:src-c8852cf69a7b:table:068f269d056dd4df:table -->

<!-- source-body:359:src-c8852cf69a7b:paragraph:f838bf8762ef7f3f:paragraph -->

由于紫色强化部件较为稀缺（强化从至需要个紫色强化部件），通常防空炮在PVE中携带二十八联装120mm喷进炮以保证生存，而四联装博福斯40mm防空炮（Mk4）在前排防空压力大时才装备。后排可在设备位携带三式弹进一步提升航空伤害减免。在PVP中，小船场通常主要携带二十八联装120mm喷进炮，小拉菲携带四联装博福斯40mm防空炮（Mk4）；中船场也绝大多数携带二十八联装120mm喷进炮；大船场携带四联装博福斯40mm防空炮（Mk4）。
<!-- source-body:360:src-c8852cf69a7b:paragraph:fd76defdddac3a20:paragraph -->

<!-- source-body:361:src-c8852cf69a7b:paragraph:11268213c2949eae:paragraph -->

##### 2.2.2.4 技能与旗舰
<!-- source-body:362:src-c8852cf69a7b:heading:93619f0e7d88e616:paragraph -->

部分技能或旗舰会增加装甲值/对空值，鉴于PVP环境中减伤类旗舰技较为普及，本节暂不纳入相关计算示例。案例如下：
<!-- source-body:363:src-c8852cf69a7b:paragraph:340b5caf9e6d694d:paragraph -->

<!-- source-body:364:src-c8852cf69a7b:paragraph:1ceee975129b1a45:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-fa4430f50d718cbe-dfce51cf2ec55b00"
  alt="《8.1 拂晓伤害计算构成.docx》“2.2.2.4 技能与旗舰”章节的相关插图；DOCX occurrence dfce51cf2ec55b00"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-c8852cf69a7b/2c16c5297057e487/original.png"
  :width="682"
  :height="252"
/>

旗舰示意图
<!-- source-body:365:src-c8852cf69a7b:paragraph:8d28a499af08fd17:paragraph -->

注意此处计算时，请记得在舰灵面板值上计算这类加成。
<!-- source-body:366:src-c8852cf69a7b:paragraph:68853505eb6a1276:paragraph -->

##### 2.2.2.5 强化等级
<!-- source-body:367:src-c8852cf69a7b:heading:25c7c9f809a46a46:paragraph -->

同1.2.3。对比强化前，青叶装甲值提升，对空值提升。
<!-- source-body:368:src-c8852cf69a7b:paragraph:6c9512e54bd6a5d2:paragraph -->

##### 2.2.2.6 舰种
<!-- source-body:369:src-c8852cf69a7b:heading:67ac8c2536b3b872:paragraph -->

同1.2.1，同等级下，大船（战列、战巡、航母、装母）的基础面板通常高于中船（轻巡、重巡、重炮、轻母），中船又高于小船（驱逐、水母）。
<!-- source-body:370:src-c8852cf69a7b:paragraph:484b2a0c9b18d2b9:paragraph -->

##### 2.2.2.7 羁绊
<!-- source-body:371:src-c8852cf69a7b:heading:9d19eac62df10307:paragraph -->

同1.2.5。其余各加成不变，对同一舰灵进行计算可得：羁绊加成每提升1%，最终伤害降低约3.42%。
<!-- source-body:372:src-c8852cf69a7b:paragraph:ee5eb09635b3ec1c:paragraph -->

羁绊加成也会在舰灵面板上显示，无需进行额外计算。
<!-- source-body:373:src-c8852cf69a7b:paragraph:d90001c60dfa987d:paragraph -->

<!-- source-body:374:src-c8852cf69a7b:paragraph:5c9995aa97bfbe0c:paragraph -->
下一章：[倍率、暴击与弹种](./damage-multipliers)。

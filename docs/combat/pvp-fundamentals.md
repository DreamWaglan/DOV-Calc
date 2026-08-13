---
id: combat-pvp-fundamentals
title: "争锋竞技场一：综合机制"
description: "迁移竞技场综合篇，覆盖索敌、制空、增减伤、弹种、命中、站位、天赋、装备和通用法则。"
section: combat
order: 360
audience: ["regular","advanced"]
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
  - title: "7.1 争锋竞技场简易百科.docx"
    assetId: src-7d080e8d651b
    sourceType: docx
    permission: authorized
    publicUse:
      body: true
      asset: false
    notes: 已迁移授权正文；原始 DOCX 文件不开放下载，已授权的 DOCX 内嵌原图可在正文显示并下载。
tags: ["PVP","竞技场","机制","公式"]
related: ["combat-pvp-arena","mechanics-damage-model","media-source-7d080e8d651b"]
---
# 争锋竞技场一：综合机制
<!-- article-paragraph:non-prose -->
争锋竞技场简易百科
<!-- source-body:1:src-7d080e8d651b:paragraph:9b0fc7d2a7af50f9:paragraph -->

<!-- article-paragraph:non-prose -->
前言
<!-- source-body:2:src-7d080e8d651b:paragraph:0c03907eda8e9882:paragraph -->

<!-- article-paragraph:prose -->
争锋竞技场（以下简称争锋）作为拂晓的三大核心玩法之一，也是唯一的PVP部分，入门即享保底津贴，高于普通竞技场最高档，可以说是非常休闲了。但若你想让自己的舰灵发光发热，一展风采，那么争锋将是你最好的选择。
<!-- source-body:3:src-7d080e8d651b:paragraph:9ef7e638a48c7beb:paragraph -->

<!-- article-paragraph:prose -->
与人斗其乐无穷，争锋有蓝、紫、金三个场次，所需舰灵数量多，配队较复杂，装备要求高。为方便萌新快速入门、老登快速上手，本攻略将从PVP基础知识、配装思路和参考配队三个方面入手，让读者正确的认识、体验争锋的快乐。
<!-- source-body:4:src-7d080e8d651b:paragraph:211fd398fa6ef39a:paragraph -->

## 一、综合篇
<!-- source-body:5:src-7d080e8d651b:heading:e5e2bdef6652a5f8:paragraph -->

### （一）入门
<!-- source-body:6:src-7d080e8d651b:heading:ea6625a4b5704943:paragraph -->

<!-- article-paragraph:prose -->
如果你是新玩家，又想快速上手，那么准备38个+10对海雷达（即俗称的马桶，含特殊马桶-勋章、蛋糕），所有出战角色装备+6启用尽量提高，技能拉高，队伍旗舰9级或10级拉满，前述条件完成就算入门了。接下来慢慢养成补强其余内容即可（包括好感、羁绊等）。但如果想精进一步，那么请耐心阅读本百科。
<!-- source-body:7:src-7d080e8d651b:paragraph:32e67fa825be71f1:paragraph -->

<!-- article-paragraph:prose -->
牢记，随机数大于一切，即便完全镜像队伍也会出现各种随机变化，有时甚至可以逆转克制关系。因此不必因为几次的失利而焦虑。
<!-- source-body:8:src-7d080e8d651b:paragraph:a1de68b4446faaef:paragraph -->

<!-- article-paragraph:prose -->
PS1：想要更完整、详细的信息请去wiki自行查阅，为方便理解本文只介绍简化的核心要素。
<!-- source-body:9:src-7d080e8d651b:paragraph:b5b76f97f6b3e8c9:paragraph -->

<!-- article-paragraph:prose -->
PS2：竞技场（普通、争锋）的舰灵全部为出战位，支援技不生效。
<!-- source-body:10:src-7d080e8d651b:paragraph:d85f1a8605a01910:paragraph -->

### （二）参数/公式相关
<!-- source-body:11:src-7d080e8d651b:heading:269ede9f2052af06:paragraph -->

#### 1.索敌/制空判定
<!-- source-body:12:src-7d080e8d651b:heading:46b8b624969e1531:paragraph -->

<!-- article-paragraph:prose -->
和pve同样的计算规则
<!-- source-body:13:src-7d080e8d651b:paragraph:c5680d20ad920616:paragraph -->

##### ①索敌判定
<!-- source-body:14:src-7d080e8d651b:heading:6dc9cd6d36ec7eaa:paragraph -->

<!-- article-paragraph:prose -->
我方舰队索敌大于敌方时获得“索敌成功”buff（我方命中率+10%，敌方命中率-10%），同时判定为同航战（敌我双方炮击|雷击伤害+8%，命中值+10%）；
<!-- source-body:15:src-7d080e8d651b:paragraph:6eb2860e6a8dbbdb:paragraph -->

<!-- article-paragraph:prose -->
当我方索敌大于敌方索敌的1.25倍时，判定为T优势（我方雷击|炮击伤害+15%，命中值+20%；敌方雷击|炮击伤害-15%，命中值-10%）。
<!-- source-body:16:src-7d080e8d651b:paragraph:93e082609768fa92:paragraph -->

<!-- article-paragraph:prose -->
我方舰队索敌小于敌方时，不获得任何buff，同时判定为反航战（敌我双方炮击|雷击伤害-8%，命中值-10%）。
<!-- source-body:17:src-7d080e8d651b:paragraph:965c7ad8d1fae2cb:paragraph -->

<!-- article-paragraph:prose -->
当我方索敌小于敌方索敌0.8倍时，判定为T劣势（我方雷击|炮击伤害-15%，命中值-10%；敌方雷击|炮击伤害+15%，命中值+20%）。
<!-- source-body:18:src-7d080e8d651b:paragraph:7b30cbd5c7ba543e:paragraph -->

##### ②制空判定
<!-- source-body:19:src-7d080e8d651b:heading:da8b89f1c53e16ae:paragraph -->

<!-- article-paragraph:prose -->
类似索敌，但是判定条件为航空值的10%，30%。
<!-- source-body:20:src-7d080e8d651b:paragraph:a7aad99520c3948c:paragraph -->

<!-- source-body:21:src-7d080e8d651b:paragraph:a49364e878c259a9:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-13e7027c3077caae-b640badba1a97d55"
  alt="《7.1 争锋竞技场简易百科.docx》“②制空判定”章节的相关插图；DOCX occurrence b640badba1a97d55"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-7d080e8d651b/fb296f9f9e12c0d8/original.png"
  :width="605"
  :height="788"
/>

##### 小结：
<!-- source-body:22:src-7d080e8d651b:heading:ec2ac5e6f914bc62:paragraph -->

<!-- article-paragraph:prose -->
进攻防守索敌线不同，进攻高于对方0.75倍索敌不会T劣，防守需高于对方0.8倍索敌。
<!-- source-body:23:src-7d080e8d651b:paragraph:22142096162b26ec:paragraph -->

<!-- article-paragraph:prose -->
绝大多数配队要避免陷入T劣状态，相对而言航队受影响会低一些。
<!-- source-body:24:src-7d080e8d651b:paragraph:fbb6c0d2511d0222:paragraph -->

<!-- article-paragraph:prose -->
通常来说，同航反航区别不是很大，但是吃闪避的阵容会被航向影响相关数值。因此攻防配队可以主动调整索敌值，以应对不同的属性需求。
<!-- source-body:25:src-7d080e8d651b:paragraph:1786aae73d1b588b:paragraph -->

<!-- article-paragraph:prose -->
制空的影响相对较小，主要看航母数量和影响航空输出。
<!-- source-body:26:src-7d080e8d651b:paragraph:35ddc5efdbeefa8d:paragraph -->

<!-- article-paragraph:prose -->
老登常说的“科技”：在满足反航索敌的需求下，将部分对海雷达进行其他设备替换（例如炮弹、滑板、飞机），满足额外的生存|输出需求。
<!-- source-body:27:src-7d080e8d651b:paragraph:dfb606cc3d0e3af7:paragraph -->

### 2.增伤和减伤
<!-- source-body:28:src-7d080e8d651b:heading:91af34ff0ae68cd2:paragraph -->

<!-- article-paragraph:prose -->
进入争锋PVP所有舰灵都务必誓约，最低要求八槽。最优是永恒好感度，提供20%增伤和20%减伤。
<!-- source-body:29:src-7d080e8d651b:paragraph:0225989ff5c4c106:paragraph -->

<!-- article-paragraph:prose -->
游戏内加减伤均为加算，请尽可能优先堆减伤，来源天赋、旗舰、装备、技能等。
<!-- source-body:30:src-7d080e8d651b:paragraph:4c98cc2fa7d5f963:paragraph -->

<!-- source-body:31:src-7d080e8d651b:paragraph:e5e401c7a2121415:paragraph -->

<!-- article-paragraph:prose -->
以白板永恒誓约船为例：
<!-- source-body:32:src-7d080e8d651b:paragraph:4c36daf9cbbbaa1e:paragraph -->

<!-- article-paragraph:prose -->
A.选择减伤25%天赋，实际坦度增幅为1-0.55/0.8=0.3125
<!-- source-body:33:src-7d080e8d651b:paragraph:43666dd94918104d:paragraph -->

<!-- article-paragraph:prose -->
B.选择增伤25%天赋，实际伤害增幅为1.45/1.2-1=0.2083
<!-- source-body:34:src-7d080e8d651b:paragraph:ea013587e761ad97:paragraph -->

<!-- article-paragraph:prose -->
当数值提高时，此差距会被进一步放大：
<!-- source-body:35:src-7d080e8d651b:paragraph:0c2be31b4a12f0c4:paragraph -->

<!-- article-paragraph:prose -->
A.额外减伤50%，实际坦度增幅为1-0.3/0.8=0.625
<!-- source-body:36:src-7d080e8d651b:paragraph:119f19fcf51c5fbc:paragraph -->

<!-- article-paragraph:prose -->
B.额外增伤50%，实际伤害增幅为1.7/1.2-1=0.4167
<!-- source-body:37:src-7d080e8d651b:paragraph:e04f528bd846098d:paragraph -->

### 3.局内外加成
<!-- source-body:38:src-7d080e8d651b:heading:b0463b4e327d3ee6:paragraph -->

<!-- article-paragraph:prose -->
实际面板=（编队界面面板+对局中固定加成）*对局内增益百分比
<!-- source-body:39:src-7d080e8d651b:paragraph:6768964e21ca74d6:paragraph -->

<!-- article-paragraph:prose -->
对局内增益包括：航向、旗舰、阵型、技能和赛季buff。
<!-- source-body:40:src-7d080e8d651b:paragraph:20d214b7e2ec9228:paragraph -->

<!-- article-paragraph:prose -->
例如伊丽莎白旗舰，复纵阵，面板200机动，实际为（200+90）*1.25=362.5
<!-- source-body:41:src-7d080e8d651b:paragraph:064600fd06dd396d:paragraph -->

### 4.弹种克制
<!-- source-body:42:src-7d080e8d651b:heading:0a4a9f97a0fa4a27:paragraph -->

<!-- article-paragraph:prose -->
同PVE，游戏内可查看详细的数值和克制关系。也可查询弹种伤害修正表。
<!-- source-body:43:src-7d080e8d651b:paragraph:f8e235d960fa66d9:paragraph -->

<!-- article-paragraph:prose -->
特别备注，燃烧属于纯粹伤害，按照面板数值直接扣除。
<!-- source-body:44:src-7d080e8d651b:paragraph:6d4231fe83316490:paragraph -->

<!-- source-body:45:src-7d080e8d651b:paragraph:cd0762f701e98c7a:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-909a00ec27768f4d-65fc75a13d40f70a"
  alt="《7.1 争锋竞技场简易百科.docx》“弹种克制”章节的相关插图；DOCX occurrence 65fc75a13d40f70a"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-7d080e8d651b/e5b76fc0d1bf3a0e/original.png"
  :width="355"
  :height="843"
/>

### 5.幸运值
<!-- source-body:46:src-7d080e8d651b:heading:06d5961f5c032d7d:paragraph -->

<!-- article-paragraph:prose -->
影响基础暴击率和被暴击率，装备来源主要是飞机和蛋糕。
<!-- source-body:47:src-7d080e8d651b:paragraph:cc0984d9ef847ac4:paragraph -->

<!-- article-paragraph:prose -->
基础暴击率={1-[守方幸运/(守方幸运+攻方幸运/3)]^0.8}×80%（最高70%）
<!-- source-body:48:src-7d080e8d651b:paragraph:24342f68c4a284c9:paragraph -->

<!-- article-paragraph:prose -->
最终暴击率=基础暴击率+加成暴击率-守方防暴击率（来自技能、阵型、装备等）
<!-- source-body:49:src-7d080e8d651b:paragraph:dbc7d855d469195a:paragraph -->

<!-- article-paragraph:prose -->
相同幸运值基础暴击率为16.44%。
<!-- source-body:50:src-7d080e8d651b:paragraph:aad56af37e4f038d:paragraph -->

<!-- article-paragraph:prose -->
因此优先需要考虑核心输出舰灵的幸运，此外幸运太低的舰灵通常不适合做主T。
<!-- source-body:51:src-7d080e8d651b:paragraph:59c397c83d4910cc:paragraph -->

<!-- source-body:52:src-7d080e8d651b:paragraph:b4971b97c5fe7e4f:paragraph -->

### 6.命中与机动
<!-- source-body:53:src-7d080e8d651b:heading:d23bd00fdc1e774e:paragraph -->

<!-- article-paragraph:prose -->
装备搭配是争锋博弈的首要考量要素。
<!-- source-body:54:src-7d080e8d651b:paragraph:e8f88e49009f5fa3:paragraph -->

<!-- article-paragraph:prose -->
基础命中率=攻方命中/（攻方命中+守方机动）×100%
<!-- source-body:55:src-7d080e8d651b:paragraph:f811367342ac40d6:paragraph -->

<!-- article-paragraph:prose -->
最终命中率=基础命中率+加成命中率-守方回避率
<!-- source-body:56:src-7d080e8d651b:paragraph:4de65862ea1420cb:paragraph -->

<!-- article-paragraph:prose -->
【阈值：最高命中95%，最低命中5%】
<!-- source-body:57:src-7d080e8d651b:paragraph:c2af9c8c4995a0e9:paragraph -->

<!-- article-paragraph:prose -->
由于舰灵都有基础机动，基础闪避不为0，考虑到血量天赋的固定加成和实际机动情况后，往往是同级别闪避天赋&gt;血量天赋。携带机动装置或有闪避技能、天赋等情况会进一步放大差距。例如10%的闪避和10%血量天赋，基础闪避10%的情况下，实际收益为：1-0.8/0.9=0.1111＞0.1。
<!-- source-body:58:src-7d080e8d651b:paragraph:7b41c610f0dfe11c:paragraph -->

<!-- article-paragraph:prose -->
在拂晓中，通过装备提升生存的最有效手段就是携带+10金色机动装置。这是在满足索敌需求的情况下，生存位最推荐携带的装备。
<!-- source-body:59:src-7d080e8d651b:paragraph:d2b8c97368c0f28f:paragraph -->

<!-- source-body:60:src-7d080e8d651b:paragraph:741eb802a5ed3c30:paragraph -->

### 7.伤害计算公式
<!-- source-body:61:src-7d080e8d651b:heading:a151e81069c74a5c:paragraph -->

#### ①对空伤害
<!-- source-body:62:src-7d080e8d651b:heading:815205b458069cdf:paragraph -->

<!-- article-paragraph:prose -->
通常不考虑，因为PVP实战不明显，很难打下飞机。
<!-- source-body:63:src-7d080e8d651b:paragraph:6fa5e0c90d7725a2:paragraph -->

#### ②注意乘区
<!-- source-body:64:src-7d080e8d651b:heading:8fe2370d965d7553:paragraph -->

<!-- article-paragraph:prose -->
XX伤害提高和XX值提高是独立乘区，例如：炮击伤害提高50%和炮击+50%，实际是1.5*1.5=2.25的伤害提升（不考虑别的buff）。类似的还有航空和雷击。
<!-- source-body:65:src-7d080e8d651b:paragraph:d7f9da5199e8c225:paragraph -->

#### ③攻击力的计算
<!-- source-body:66:src-7d080e8d651b:heading:80470bf6348b7861:paragraph -->

##### （1）炮击/雷击攻击力：
<!-- source-body:67:src-7d080e8d651b:heading:80ed519d24c3b57d:paragraph -->

<!-- article-paragraph:prose -->
炮击|雷击*炮击|雷击伤害百分比
<!-- source-body:68:src-7d080e8d651b:paragraph:a708ae6bab67f39b:paragraph -->

##### （2）航空攻击力：
<!-- source-body:69:src-7d080e8d651b:heading:90cc92809d8600af:paragraph -->

<!-- article-paragraph:prose -->
（航空值+轰炸|鱼雷）*航空伤害百分比
<!-- source-body:70:src-7d080e8d651b:paragraph:1396d10a20a2ebb1:paragraph -->

<!-- article-paragraph:prose -->
技能有额外加成的攻击力，根据描述的最终伤害类型归类。如（炮击+对空）的炮击伤害即为炮击伤害。
<!-- source-body:71:src-7d080e8d651b:paragraph:674b609699502d52:paragraph -->

<!-- article-paragraph:prose -->
此外攻击力增加也是独立乘区。
<!-- source-body:72:src-7d080e8d651b:paragraph:2f331228d0dc5103:paragraph -->

<!-- article-paragraph:prose -->
因此能吃到不同乘区的舰灵往往是强者
<!-- source-body:73:src-7d080e8d651b:paragraph:c670cb58985869fe:paragraph -->

#### ④伤害计算公式（简化）
<!-- source-body:74:src-7d080e8d651b:heading:ae778c0e91ba72bd:paragraph -->

<!-- article-paragraph:prose -->
受到伤害=(攻击力/(攻击力+1.3*防御力))*弹种补正
<!-- source-body:75:src-7d080e8d651b:paragraph:44b9c0c9517e30e9:paragraph -->

<!-- article-paragraph:prose -->
防御力对应装甲和对空。
<!-- source-body:76:src-7d080e8d651b:paragraph:beec4b39ee30f2d0:paragraph -->

<!-- article-paragraph:prose -->
特别的，高平炮和撞击近战对应装甲。
<!-- source-body:77:src-7d080e8d651b:paragraph:4c2d4bb45e2a9120:paragraph -->

<!-- article-paragraph:prose -->
防御力通常比攻击力低很多，因此大多数情况下增加防御的收益没有很高。
<!-- source-body:78:src-7d080e8d651b:paragraph:11a6256f36d6ba06:paragraph -->

### 8.装填
<!-- source-body:79:src-7d080e8d651b:heading:2bf2694ca8715cb9:paragraph -->

<!-- article-paragraph:prose -->
一般作用于战列战巡，详见主副炮装填表。通常不用考虑，特别是轻母航母装填收益很低。
<!-- source-body:80:src-7d080e8d651b:paragraph:b31438c2fa9f4edb:paragraph -->

### （三）站位
<!-- source-body:81:src-7d080e8d651b:heading:13d8398a0af26d4d:paragraph -->

<!-- article-paragraph:prose -->
队伍里舰灵站位通常遵循以下规则：1号，3号负责承受伤害，其中1号是主T可以不追求伤害，3号是副T也会承受较多伤害；2号在1号倒下后会变成T；4号、5号通常是要保护的核心输出|旗舰；6号可作保护位但本身会吃一些伤害（被锁可能直接去世）。
<!-- source-body:82:src-7d080e8d651b:paragraph:f2302776e06ebd3f:paragraph -->

<!-- article-paragraph:prose -->
不同舰灵由于攻击距离范围等因素会使站位规则出现偏差，如炮系排头遇见航系排头可能会罚站。航系开头的2、3、6号可能更容易吃伤害。
<!-- source-body:83:src-7d080e8d651b:paragraph:19bdb17c136e4b5d:paragraph -->

<!-- article-paragraph:prose -->
请根据个人实战体验来调整。也可直接借鉴参考阵容
<!-- source-body:84:src-7d080e8d651b:paragraph:1f9e89d1b6a47558:paragraph -->

### （四）舰灵天赋
<!-- source-body:85:src-7d080e8d651b:heading:5248421ad43e769a:paragraph -->

<!-- article-paragraph:prose -->
查询舰灵PVP天赋图表即可，可根据敌方索敌等实际使用需求微调。
<!-- source-body:86:src-7d080e8d651b:paragraph:01b28f9d537f380d:paragraph -->

### （五）舰灵装备
<!-- source-body:87:src-7d080e8d651b:heading:762419719d6ea2cf:paragraph -->

<!-- article-paragraph:prose -->
有需要可以查询通用装备速查表和wiki图鉴了解属性，名称和效果，以及对应获取渠道，培养优先级等。
<!-- source-body:88:src-7d080e8d651b:paragraph:7f1dc6b45c4097ba:paragraph -->

### （六）信物
<!-- source-body:89:src-7d080e8d651b:heading:212f035afa2eed8b:paragraph -->

<!-- article-paragraph:prose -->
仅从PVP争锋角度，目前版本推荐优先级如下：
<!-- source-body:90:src-7d080e8d651b:paragraph:4eee3b502745df68:paragraph -->

<!-- article-paragraph:prose -->
隼鹰=宁海&gt;南达科他=平海&gt;应瑞&gt;标枪&gt;唐斯&gt;舍尔
<!-- source-body:91:src-7d080e8d651b:paragraph:eb0afe907bf2af2c:paragraph -->

### （七）阵型
<!-- source-body:92:src-7d080e8d651b:heading:a7ace0661c0c6a85:paragraph -->

<!-- article-paragraph:prose -->
游戏内可查看，具体效果同PVE，实战可根据参考阵容。
<!-- source-body:93:src-7d080e8d651b:paragraph:a080a6efd30f2434:paragraph -->

<!-- article-paragraph:prose -->
简记：单纵炮雷；复纵机动；轮型航空；T字暴击很少用。
<!-- source-body:94:src-7d080e8d651b:paragraph:9d4d78af722b28c7:paragraph -->

### （八）赛季天气
<!-- source-body:95:src-7d080e8d651b:heading:c0c455fb6303659c:paragraph -->

<!-- article-paragraph:prose -->
S35赛季开始新引入的系统，游戏内可查看场地buff。
<!-- source-body:96:src-7d080e8d651b:paragraph:55fb5999fbac5a40:paragraph -->

<!-- source-body:97:src-7d080e8d651b:paragraph:e33c10b3af791425:paragraph -->

<ResponsiveMedia
  media-id="wiki-media-c0c5594ad4ba700e-45b15efa6c9a6ce8"
  alt="《7.1 争锋竞技场简易百科.docx》“（八）赛季天气”章节的相关插图；DOCX occurrence 45b15efa6c9a6ce8"
  display-mode="viewer"
  :variants='[]'
  fallback-path="/wiki-media/src-7d080e8d651b/de6b0aab2b0ad343/original.png"
  :width="1342"
  :height="734"
/>

### （九）通用法则
<!-- source-body:98:src-7d080e8d651b:heading:8dd58e801a37e334:paragraph -->

<!-- article-paragraph:prose -->
①输出位装备高命中高输出，生存位高机动高功能性。
<!-- source-body:99:src-7d080e8d651b:paragraph:49c3545b25906d02:paragraph -->

<!-- article-paragraph:prose -->
②偏机动队尽量进攻反航，防守同航。
<!-- source-body:100:src-7d080e8d651b:paragraph:30e2e308359324d9:paragraph -->

<!-- article-paragraph:prose -->
③T优太难，全索敌往往只有同航，收益未必有关键位置科技的反航高。
<!-- source-body:101:src-7d080e8d651b:paragraph:8c8b7fef965019a6:paragraph -->

<!-- article-paragraph:prose -->
④灵活根据自己分段附近主流队伍变阵，通常需要满足索敌条件，攻防装备和阵容均可变
<!-- source-body:102:src-7d080e8d651b:paragraph:3432522a9622406c:paragraph -->

<!-- source-body:103:src-7d080e8d651b:paragraph:ba519d19ce2d3e91:paragraph -->
下一章：[竞技场规则与编队](./pvp-rules-and-fleet)。

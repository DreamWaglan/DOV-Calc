<!-- sourceAssetId: src-c8852cf69a7b; publishable: false; permission: authorized; reviewStatus: migration-review-required -->

# DOCX Import Review: 8.1 拂晓伤害计算构成.docx

## Imported Body

拂晓伤害构成解析
<!-- source-body:1:src-c8852cf69a7b:paragraph:0f7cf37ba2245a20:paragraph -->

<!-- source-body:2:src-c8852cf69a7b:paragraph:f9ea719e5aae5e48:paragraph -->

本文旨在系统解析拂晓的伤害构成机制，提供量化计算舰灵输出能力的标准化方法，辅助玩家评估阵容输出效能是否达到关卡阈值。
<!-- source-body:3:src-c8852cf69a7b:paragraph:22a46f2b249cc0c4:paragraph -->

# 伤害公式
<!-- source-body:4:src-c8852cf69a7b:heading:3847b866f325123a:paragraph -->

拂晓的伤害构成由以下公式得出：
<!-- source-body:5:src-c8852cf69a7b:paragraph:66fc5aa6137f5897:paragraph -->

最终伤害=攻击力×倍率区×修正区
<!-- source-body:6:src-c8852cf69a7b:paragraph:72bb64bc0abb3c17:paragraph -->

+技能实数伤害hp damage
<!-- source-body:7:src-c8852cf69a7b:paragraph:c225b006b6c15d81:paragraph -->

其中，
<!-- source-body:8:src-c8852cf69a7b:paragraph:830e2cdbdad7875a:paragraph -->

修正区=攻击力攻击力+1.3×防御力×暴击伤害修正×弹种修正×增伤修正×减伤修正 ×等级修正（仅pve）
<!-- source-body:9:src-c8852cf69a7b:paragraph:460c35aa4789bbd1:paragraph -->

（注：最终伤害存在±10%随机浮动，因波动范围可控，常规测算中可忽略不计。）
<!-- source-body:10:src-c8852cf69a7b:paragraph:49766a86bbb5c3bd:paragraph -->

下面对公式中的各项参数逐一进行说明：
<!-- source-body:11:src-c8852cf69a7b:paragraph:da1c4fd047e375e1:paragraph -->

# 技能实数伤害（hp damage）：
<!-- source-body:12:src-c8852cf69a7b:heading:c7949832bfef0805:paragraph -->

技能实数伤害为技能造成伤害的固定值。每位舰灵的技能实数伤害不同，目前尚未找到标明其具体数值的资料，由于存在伤害浮动无法测量。计算过程中，可以将此处视为。
<!-- source-body:13:src-c8852cf69a7b:paragraph:0364f6f3e4c69b52:paragraph -->

# 攻击力：
<!-- source-body:14:src-c8852cf69a7b:heading:e63b221ad7246f47:paragraph -->

## 1.1 攻击力是什么
<!-- source-body:15:src-c8852cf69a7b:heading:5945ef72a9fa3599:paragraph -->

攻击力，是由攻击值和攻击类型所组成的统一概念，攻击类型即攻击值的数值类型（或者说攻击值的单位），攻击值即这一单位下攻击力的大小。
<!-- source-body:16:src-c8852cf69a7b:paragraph:862e425fc5946de8:paragraph -->

因此，攻击类型并不仅有炮击、雷击等在文本意义上容易联想到攻击的数值类型。准确来说，攻击类型是技能描述中所使用的数值类型，包括炮击、雷击、航空、轰炸、鱼雷、对空、机动、装甲等。它们最终通过计算，得到的是单位统一的攻击伤害（单位为生命值点数，Life Point）。
<!-- source-body:17:src-c8852cf69a7b:paragraph:fea7578870a626a8:paragraph -->

例如：
<!-- source-body:18:src-c8852cf69a7b:paragraph:9338fa1cff2015e1:paragraph -->

<!-- source-body:19:src-c8852cf69a7b:paragraph:b9a8a2b0baf61ba0:paragraph -->

炮击雷击示意图
<!-- source-body:20:src-c8852cf69a7b:paragraph:465fa5945ce66cf1:paragraph -->

计算通常技时，攻击力取面板炮击值（）；计算必杀技时，取面板雷击值（）。
<!-- source-body:21:src-c8852cf69a7b:paragraph:9eeb555ce79ee239:paragraph -->

再例如：
<!-- source-body:22:src-c8852cf69a7b:paragraph:a5902043c5d14a25:paragraph -->

<!-- source-body:23:src-c8852cf69a7b:paragraph:814079b95ccfd8ad:paragraph -->

轰炸与鱼雷示意图
<!-- source-body:24:src-c8852cf69a7b:paragraph:8b87d5bdff129b28:paragraph -->

此处必杀技需要分项计算，轰炸机攻击力为面板中航空+实际携带轰炸机数值（1130+154），鱼雷机攻击力为面板中航空+实际携带鱼雷机数值（1130+140）。
<!-- source-body:25:src-c8852cf69a7b:paragraph:251472669f7fee7c:paragraph -->

注：鱼雷伤害为鱼雷机造成伤害，属于航空伤害的一种，雷击伤害为鱼雷造成伤害，两者并不属于同一词条。战斗机造成的航空伤害仅对敌方空中单位生效，不会影响敌方血条所显示生命值。
<!-- source-body:26:src-c8852cf69a7b:paragraph:28d9951abaffcfe8:paragraph -->

## 1.2 影响因素
<!-- source-body:27:src-c8852cf69a7b:heading:b978deeb0fae4368:paragraph -->

由于计算时进攻方默认我方，故暂不区分PVE与PVP环境差异。
<!-- source-body:28:src-c8852cf69a7b:paragraph:ade06b94dc8f1edd:paragraph -->

### 1.2.1 舰种
<!-- source-body:29:src-c8852cf69a7b:heading:515645f1636352fb:paragraph -->

不同舰种的舰灵，其基础面板存在差异，案例如下：
<!-- source-body:30:src-c8852cf69a7b:paragraph:09ec1ff15d78db70:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:7231f15b444b0462"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:fc8dc761c4e6aeac --><br />胡德面板</th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:295ddff969f67ada --><br />明尼面板</th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:228018f571782e48 --><br />空想面板</th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:b0b126c2582f69e1 --><br />逸仙面板</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:0a62ee8efef68a4f --><br />龙骧面板</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:db308c5252294c4e --><br />大黄蜂面板</td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:3:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:c0ccc504a4a08d57 --><br />黑暗界面板</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:7231f15b444b0462:3:3">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:31:src-c8852cf69a7b:table:7231f15b444b0462:table -->

图示均为级无加成面板
<!-- source-body:32:src-c8852cf69a7b:paragraph:15c7fe7506ff42f7:paragraph -->

<!-- source-body:33:src-c8852cf69a7b:paragraph:e8c83e4a7c7b63dd:paragraph -->

用该面板作为实际攻击力面板进行计算。在攻击倍率相同（780%），受击目标防御力相同（），增伤条件默认相同（不计算阵型、天赋、旗舰、弹种等）的情况下，以胡德面板对该目标造成伤害作为基准（100%），明尼对该目标造成伤害约为%，空想对该目标造成伤害约为%，逸仙对该目标造成伤害约为32.62%，龙骧对该目标造成伤害约为78.58%，大黄蜂对该目标造成伤害约为105.74%，黑暗界对该目标造成伤害约为66.80%。数据显示，航系攻击力普遍高于炮系，但受击目标对空值通常高于其装甲值，实战表现差距较小。
<!-- source-body:34:src-c8852cf69a7b:paragraph:2c3f0a47cd431268:paragraph -->

同级环境下，舰种基础攻击力呈阶梯分布：大船（战列、战巡、航母、装母）＞中船（轻巡、重巡、重炮、轻母）＞小船（驱逐、水母），技能倍率亦遵循此梯度。可认为大船的输出在同条件下最高。同等级下，航系与炮系的攻击属性通常仅相差百余点，对基础面板的影响相对有限。
<!-- source-body:35:src-c8852cf69a7b:paragraph:9203a637a6e613c1:paragraph -->

### 1.2.2 等级与星级
<!-- source-body:36:src-c8852cf69a7b:heading:bf17b702ce3d35c6:paragraph -->

等级与星级会直接影响面板，案例如下：
<!-- source-body:37:src-c8852cf69a7b:paragraph:b0bc37bbe1efd2cf:paragraph -->

<!-- source-body:38:src-c8852cf69a7b:paragraph:1df984ebb32ffc36:paragraph -->

级鹰面板
<!-- source-body:39:src-c8852cf69a7b:paragraph:b7048fe758a59892:paragraph -->

<!-- source-body:40:src-c8852cf69a7b:paragraph:12bfd20443333f7a:paragraph -->

级鹰面板
<!-- source-body:41:src-c8852cf69a7b:paragraph:6bd4a73a2004efee:paragraph -->

<!-- source-body:42:src-c8852cf69a7b:paragraph:0dcf7f40afe69733:paragraph -->

星唐斯面板
<!-- source-body:43:src-c8852cf69a7b:paragraph:82644de16dda6231:paragraph -->

<!-- source-body:44:src-c8852cf69a7b:paragraph:39798500a25e1e98:paragraph -->

星唐斯面板
<!-- source-body:45:src-c8852cf69a7b:paragraph:cc8c36c70aeeb7c7:paragraph -->

<!-- source-body:46:src-c8852cf69a7b:paragraph:84b55041a33d002a:paragraph -->

可见，升级与升星均能够提升舰灵面板。但由于每个舰灵的基础面板不同，升星与升级带来的数值增益缺乏统一的线性计算公式，推测其成长系数存在舰灵个体差异。实际计算时请取面板左边白字。
<!-- source-body:47:src-c8852cf69a7b:paragraph:0d150d62e7de3fe2:paragraph -->

需注意，升星要花费晶币。星升至星需晶币，星升至星需晶币，星升至星需晶币，星升至星需晶币，星升至星需晶币。
<!-- source-body:48:src-c8852cf69a7b:paragraph:b8f56958907cfdb5:paragraph -->

### 1.2.3 强化等级
<!-- source-body:49:src-c8852cf69a7b:heading:2af13ee8493c9d83:paragraph -->

每位舰灵都有不同的强化等级，强化等级会直接带来面板数值提升，案例如下：
<!-- source-body:50:src-c8852cf69a7b:paragraph:0353796f21f6364f:paragraph -->

<!-- source-body:51:src-c8852cf69a7b:paragraph:60a13d3909bb356a:paragraph -->

青叶未强化
<!-- source-body:52:src-c8852cf69a7b:paragraph:79f1f9412ad403a1:paragraph -->

<!-- source-body:53:src-c8852cf69a7b:paragraph:8dbf4cba88fb7889:paragraph -->

青叶全强化
<!-- source-body:54:src-c8852cf69a7b:paragraph:53151d94bb58d9d0:paragraph -->

上图为同等级同星级下不同强化等级的青叶，可看到未强化青叶比强化满级青叶面板数值少了装甲，炮击，雷击，对空。经测试，强化等级带来的数值增益缺乏统一的线性计算公式，推测其成长系数存在舰灵个体差异。但该强化等级带来的数值会直接显示在面板上，计算时直接使用面板数据即可。
<!-- source-body:55:src-c8852cf69a7b:paragraph:4dfa95402cdd5e8f:paragraph -->

### 1.2. 天赋
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

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:a07813d05a5dce48"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:a07813d05a5dce48:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:ff809cc9186fbd48 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:a07813d05a5dce48:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:b3abc537020cbf21 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:a07813d05a5dce48:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:9c602dd181bbbccb --></th></tr></thead></table></div>
<!-- source-body:62:src-c8852cf69a7b:table:a07813d05a5dce48:table -->

天赋示意图
<!-- source-body:63:src-c8852cf69a7b:paragraph:986c47f1448f8375:paragraph -->

例如以攻击力计算，天赋加成20%，对同一防御力目标（）进行倍率为780%的攻击，修正区除攻击力外其余条件不变，则最终伤害提升约32.4%。
<!-- source-body:64:src-c8852cf69a7b:paragraph:55793c0dd04dc295:paragraph -->

天赋为每位舰灵独有，舰灵面板中白字已默认计算此处加成，计算时请直接使用面板数据即可。
<!-- source-body:65:src-c8852cf69a7b:paragraph:c675d5f85a7731a1:paragraph -->

需特别区分，天赋中标注为“炮击/雷击/航空/轰炸/鱼雷+X”的词条，为直接在攻击力上进行计算。而标注为攻击伤害加成、炮击伤害加成、航空伤害加成等名称中含有“伤害”二字的词条，则计入后文所述增伤修正区。
<!-- source-body:66:src-c8852cf69a7b:paragraph:2b0dbd26fb702b21:paragraph -->

### 1.2. 羁绊
<!-- source-body:67:src-c8852cf69a7b:heading:c39e593d0eb1532b:paragraph -->

每个账号的羁绊等级与加成情况均不相同，可在头像处点击羁绊查看。
<!-- source-body:68:src-c8852cf69a7b:paragraph:0374d44ebfa47d7c:paragraph -->

<!-- source-body:69:src-c8852cf69a7b:paragraph:78ed61243680f0fd:paragraph -->

羁绊示意图
<!-- source-body:70:src-c8852cf69a7b:paragraph:1aa44a2258c24a6d:paragraph -->

对同一舰灵进行计算，羁绊加成每提升1%，最终伤害提升约1.6%。
<!-- source-body:71:src-c8852cf69a7b:paragraph:61f6202b19c5cfea:paragraph -->

羁绊加成在舰灵面板上已自动计算，无需进行额外计算。
<!-- source-body:72:src-c8852cf69a7b:paragraph:48bfe0d29707b385:paragraph -->

### 1.2. 装备
<!-- source-body:73:src-c8852cf69a7b:heading:69afcc4a63e19f92:paragraph -->

装备是除等级、星级外提升舰灵面板数值的核心途径，可提供高额属性增益。请看以下案例：
<!-- source-body:74:src-c8852cf69a7b:paragraph:b70873fea030c2f6:paragraph -->

以下计算均采用面板攻击力，敌方防御、倍率700%、增伤区145%(航队135%)、暴击伤害140%、减伤区100%、无等级压制；航空伤害计算时，弹种克制取中甲即轰炸伤害100%、鱼雷伤害90%；炮击值计算统一取125%弹种增伤；雷击值计算时，为保持与实际一致，取弹种增伤140%、敌方装甲值计算。
<!-- source-body:75:src-c8852cf69a7b:paragraph:4b173e520265bcf7:paragraph -->

<!-- source-body:76:src-c8852cf69a7b:paragraph:be6346a33cabe046:paragraph -->

#### 1.2.6.1 驱逐主炮
<!-- source-body:77:src-c8852cf69a7b:heading:b7d44adf8dd551cf:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:52739e62d44924e8 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:6c262e1383f85891 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:4856717d48bf778c --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:22d986cc3601e996 --></th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:1:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:d46b8b9eb069301f --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:9f834a9f29cd661b --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:562543c79029ef57 --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:f1c64d7404bad155 --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:a712cc3a774d13b3 --></td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:2:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:5cb42e8b9c1a5155 --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:1">&nbsp;</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:c64eb5bc4aff0eeb --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:4">&nbsp;</td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:3:5">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:78:src-c8852cf69a7b:table:6c8ce9fa3ebaa51a:table -->

图-1 驱逐炮属性
<!-- source-body:79:src-c8852cf69a7b:paragraph:ba91783b25064c61:paragraph -->

<!-- source-body:80:src-c8852cf69a7b:paragraph:23e84ced1f5a90e9:paragraph -->

<!-- source-body:81:src-c8852cf69a7b:paragraph:b490da310b26decc:paragraph -->

吹雪无装备
<!-- source-body:82:src-c8852cf69a7b:paragraph:71629b0479b88aa2:paragraph -->

<!-- source-body:83:src-c8852cf69a7b:paragraph:63380d51d5aa4af0:paragraph -->

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

#### 1.2.6.2 轻巡副炮
<!-- source-body:91:src-c8852cf69a7b:heading:94dca1ce5911b09a:paragraph -->

<!-- source-body:92:src-c8852cf69a7b:paragraph:480f97fd29f32d5e:paragraph -->

逸仙未装备
<!-- source-body:93:src-c8852cf69a7b:paragraph:8233912532374887:paragraph -->

<!-- source-body:94:src-c8852cf69a7b:paragraph:cce8755b43823435:paragraph -->

逸仙装备门 30.5cm无后座力炮
<!-- source-body:95:src-c8852cf69a7b:paragraph:6d558c12ded6feb8:paragraph -->

<!-- source-body:96:src-c8852cf69a7b:paragraph:46cf0e2079498a6e:paragraph -->

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

#### 1.2.6.3 重巡副炮
<!-- source-body:105:src-c8852cf69a7b:heading:95b8bd76c9edbd53:paragraph -->

<!-- source-body:106:src-c8852cf69a7b:paragraph:b3bd099776121bcf:paragraph -->

波拉装备门+10 305炮
<!-- source-body:107:src-c8852cf69a7b:paragraph:e977a360d86890c5:paragraph -->

<!-- source-body:108:src-c8852cf69a7b:paragraph:82c00fa0944dc428:paragraph -->

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

#### 1.2.6.4 战列副炮
<!-- source-body:118:src-c8852cf69a7b:heading:7c4abc46a6e0af53:paragraph -->

<!-- source-body:119:src-c8852cf69a7b:paragraph:b88bed5a08a68bc7:paragraph -->

荷马装备门金限定副驱逐炮
<!-- source-body:120:src-c8852cf69a7b:paragraph:e8e40f8fbd70f714:paragraph -->

<!-- source-body:121:src-c8852cf69a7b:paragraph:389209eb0c1de0bf:paragraph -->

荷马装备门金限定副驱逐,1门补命中炮
<!-- source-body:122:src-c8852cf69a7b:paragraph:b1519db751c4b341:paragraph -->

<!-- source-body:123:src-c8852cf69a7b:paragraph:6ed25e03e6d4ce95:paragraph -->

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

#### 1.2.6.5 轻巡主炮
<!-- source-body:131:src-c8852cf69a7b:heading:578e5811de192503:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:01acca07cae90485"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:f40bd7368c3add76 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:a32430fab6063c66 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:79d72cc1238dbd44 --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:aac07732b1cca400 --></th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:01acca07cae90485:1:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:3c5c30ea6f0ef3f5 --></th></tr></thead></table></div>
<!-- source-body:132:src-c8852cf69a7b:table:01acca07cae90485:table -->

图-2 轻巡炮属性
<!-- source-body:133:src-c8852cf69a7b:paragraph:e8f0e4e65c4e03ea:paragraph -->

<!-- source-body:134:src-c8852cf69a7b:paragraph:7adf7d91a016b1e5:paragraph -->

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

#### 1.2.6.6 高对空轻巡炮
<!-- source-body:142:src-c8852cf69a7b:heading:113d91b448b150f4:paragraph -->

后两种轻巡炮通常作为大船副炮使用，轻巡使用不如常驻金炮（给大船收益更高）。此处使用前卫通常技级进行计算。取弹种增伤110%，计算通常技对空加成，不计算拉古兹增伤。
<!-- source-body:143:src-c8852cf69a7b:paragraph:327234f1b5a6d67a:paragraph -->

<!-- source-body:144:src-c8852cf69a7b:paragraph:5817e16e3658c522:paragraph -->

前卫技能图示
<!-- source-body:145:src-c8852cf69a7b:paragraph:06d0bbd3d3896382:paragraph -->

<!-- source-body:146:src-c8852cf69a7b:paragraph:ba9ee40451031937:paragraph -->

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

#### 1.2.6.7 重巡主炮
<!-- source-body:154:src-c8852cf69a7b:heading:25ccc74369fb9cc8:paragraph -->

<!-- source-body:155:src-c8852cf69a7b:paragraph:895c76efbf05bec3:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:aa6e5cc76958aff0"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:affa827539117951 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:829cdf87c0c062b6 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:a48f529ae33f9bef --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:3a2f82063e0681d8 --></th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:ee8148bec00d8625 --></th><th data-grid-column="6" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:1:6">&nbsp;</th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:4b0643878eb4340c --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:0bc8574bc9306177 --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:0ed069d7fe3879c1 --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:04c055f7d875191c --></td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:4ae111a8bdb88b0d --></td><td data-grid-column="6" data-source-cell="src-c8852cf69a7b:table:aa6e5cc76958aff0:2:6">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:156:src-c8852cf69a7b:table:aa6e5cc76958aff0:table -->

图-3 重巡炮属性
<!-- source-body:157:src-c8852cf69a7b:paragraph:7f6bd4cbb213eaff:paragraph -->

<!-- source-body:158:src-c8852cf69a7b:paragraph:ed484a5291001c03:paragraph -->

<!-- source-body:159:src-c8852cf69a7b:paragraph:e0a22b066ee25a3c:paragraph -->

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

#### 1.2.6.8 战列主炮
<!-- source-body:168:src-c8852cf69a7b:heading:e66762b3cdc5588a:paragraph -->

<!-- source-body:169:src-c8852cf69a7b:paragraph:1f3f919382c2580e:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:ac810f562356ac6f"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:60484a9f4d1173a9 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:d4ea8ed50a513a40 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:15da2e4115752818 --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:cfab1977af3b227f --></th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:1:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:b4b9291339951d2a --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:47fb30334d671ad9 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:feb6638ea069c14a --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:9f0b8de849dcce44 --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:e92cb182edf5860f --></td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:2:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:cd438df5fd6a09a4 --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:69bd55970a249c62 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:0da226080d81b0ec --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:f157388caf3ed53f --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:ac7ffb9db33d0d13 --></td><td data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:ac810f562356ac6f:3:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:5812c89c94d2ba96 --></td></tr></tbody></table></div>
<!-- source-body:170:src-c8852cf69a7b:table:ac810f562356ac6f:table -->

<!-- source-body:171:src-c8852cf69a7b:paragraph:0036e8bc85433371:paragraph -->

图-4 战列炮属性
<!-- source-body:172:src-c8852cf69a7b:paragraph:9f6846105fbc4a65:paragraph -->

<!-- source-body:173:src-c8852cf69a7b:paragraph:c917b6c260387a90:paragraph -->

<!-- source-body:174:src-c8852cf69a7b:paragraph:0cb3b89b55df5a80:paragraph -->

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

#### 1.2.6.9 鱼雷
<!-- source-body:183:src-c8852cf69a7b:heading:ca7b05a520de739b:paragraph -->

<!-- source-body:184:src-c8852cf69a7b:paragraph:323d4c16b577bff7:paragraph -->

<!-- source-body:185:src-c8852cf69a7b:heading:3bbc7c22e58620a5:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:796a08d43d973530"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:b1eb26d6660b1a5f --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:3f8b98062470875d --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:d8ff5d0848fef672 --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:6526d60724ec5cbb --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:0c49f23e1651656e --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:b3622a563f9529b1 --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:d44bb1bd3c838051 --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:2:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:29571f76f491206d --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:3:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:62b21ddb94bb268f --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:3:3">&nbsp;</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:796a08d43d973530:3:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:186:src-c8852cf69a7b:table:796a08d43d973530:table -->

图-5 鱼雷属性
<!-- source-body:187:src-c8852cf69a7b:paragraph:f8c2f982f4638c25:paragraph -->

<!-- source-body:188:src-c8852cf69a7b:paragraph:a3924ce27c8cda24:paragraph -->

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

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:de0ae8b46f6db265"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:de0ae8b46f6db265:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:b90634a9f0ce30cc --><br />列克星敦</th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:de0ae8b46f6db265:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:e0aa5f490c2921cb --><br />列克星敦改</th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:de0ae8b46f6db265:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:2a276e1ed949018a --><br />列克星敦誓约后装备槽</td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:de0ae8b46f6db265:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:42cf2160d8ed053d --><br />独角兽</td></tr></tbody></table></div>
<!-- source-body:200:src-c8852cf69a7b:table:de0ae8b46f6db265:table -->

图示为舰载机装备加成
<!-- source-body:201:src-c8852cf69a7b:paragraph:6f99cfd0c7c8205e:paragraph -->

可以看到在轻母与航母中部分战斗机、轰炸机、鱼雷机及设备槽位的右下角标有数字，这里的数字就是上面公式所写的载机量（单位%）。部分舰灵的设备槽位没有数字，那么就是没有加成，按装备原值计算。誓约后逐步开放的个槽也没有写数字，故也是按无加成处理。
<!-- source-body:202:src-c8852cf69a7b:paragraph:5dc86b9e444bb247:paragraph -->

注：以下架飞机位置默认装备在前槽，享受载机量加成。
<!-- source-body:203:src-c8852cf69a7b:paragraph:bd5a07ddd5a86827:paragraph -->

<!-- source-body:204:src-c8852cf69a7b:paragraph:f7a9396368cc2ea6:paragraph -->

#### 1.2.6.10 战斗机
<!-- source-body:205:src-c8852cf69a7b:heading:35f3531327972400:paragraph -->

<!-- source-body:206:src-c8852cf69a7b:paragraph:469efd8439cd02c3:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:6300152a88d2ed7f"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:6d3241dcc60c0370 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:6e1de3cdb23cd3fa --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:140225b987889818 --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:abada8fb0adad4d6 --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:1fe78ddeee9b5dab --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:a4b89274b2696450 --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:edd652ceba83cade --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:2:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:28b8a5902bf918fb --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:3:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:e02fa74ca782fef6 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:3:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:fec8604e1bf9f8b8 --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:3:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:fc1a97ca63d89e75 --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:3:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:4e7332f8092794b2 --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:4:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:8df124e3535fb994 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:4:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:efefcb643b882724 --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:4:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:209b0ae5d63d782b --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:6300152a88d2ed7f:4:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:207:src-c8852cf69a7b:table:6300152a88d2ed7f:table -->

图-6 战斗机属性
<!-- source-body:208:src-c8852cf69a7b:paragraph:f78149a989753218:paragraph -->

<!-- source-body:209:src-c8852cf69a7b:paragraph:f42d72a17816c61f:paragraph -->

列克星敦未装备
<!-- source-body:210:src-c8852cf69a7b:paragraph:b784788e804fd6bd:paragraph -->

<!-- source-body:211:src-c8852cf69a7b:paragraph:8609b94407d77fa1:paragraph -->

列克星敦装备架+6 F4U-1海盗
<!-- source-body:212:src-c8852cf69a7b:paragraph:3276ae22148d4fa3:paragraph -->

<!-- source-body:213:src-c8852cf69a7b:paragraph:830a88a4fc590f2e:paragraph -->

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

#### 1.2.6.11 轰炸机
<!-- source-body:224:src-c8852cf69a7b:heading:21452c6d10113f26:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:2870062292c4c4d9"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:0b6632d72ec9c584 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:64777361e01f97b6 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:f608b73d32fcfc38 --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:16144ae3e93f0ce8 --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:8cef5490a143cdb2 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:301e67c71b9a5cd5 --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:ac9cda6d09117a54 --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:2:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:4fbc7716f718bc14 --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:3:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:9d14e0f70ad07a4d --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:3:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:e81f41f0d07ad9d0 --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:3:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:d8528f2108e97c80 --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:2870062292c4c4d9:3:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:0566202dcf287f3f --></td></tr></tbody></table></div>
<!-- source-body:225:src-c8852cf69a7b:table:2870062292c4c4d9:table -->

图-7 轰炸机属性
<!-- source-body:226:src-c8852cf69a7b:paragraph:75d1e4ac500f5b79:paragraph -->

<!-- source-body:227:src-c8852cf69a7b:paragraph:1774a6845e736655:paragraph -->

<!-- source-body:228:src-c8852cf69a7b:paragraph:0f506d49d16e6d2d:paragraph -->

列克星敦装备架+6 九七式舰攻（番）
<!-- source-body:229:src-c8852cf69a7b:paragraph:4ca0071e9835b749:paragraph -->

<!-- source-body:230:src-c8852cf69a7b:paragraph:f44bc9f82f0a0eb3:paragraph -->

列克星敦装备架+10 萤火虫F.Mk.I
<!-- source-body:231:src-c8852cf69a7b:paragraph:9bea2b0544e27e79:paragraph -->

<!-- source-body:232:src-c8852cf69a7b:paragraph:c14f1c5034d032d2:paragraph -->

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

#### 1.2.6.12 鱼雷机
<!-- source-body:241:src-c8852cf69a7b:heading:4b603e9c5dbd5171:paragraph -->

<!-- source-body:242:src-c8852cf69a7b:paragraph:8597009c7ea403e8:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:5b42c962b9d6bd21"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:28db8368bfe61b83 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:3052c2c71e9481a3 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:83a991881ab6b228 --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:ddceb6dbb9d673ec --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:6a7fe21e1de3de83 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:603f8f5656d9dfed --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:a0934fd2c8f28dba --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:2:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:e79fb2b332e7f084 --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:3:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:8cf999f9f4231c8a --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:3:3">&nbsp;</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:5b42c962b9d6bd21:3:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:243:src-c8852cf69a7b:table:5b42c962b9d6bd21:table -->

图-8 鱼雷机属性
<!-- source-body:244:src-c8852cf69a7b:paragraph:26643e760b3309f1:paragraph -->

<!-- source-body:245:src-c8852cf69a7b:paragraph:7fc46d8c9f6a4097:paragraph -->

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

#### 1.2.6.13 侦察机
<!-- source-body:255:src-c8852cf69a7b:heading:adfc520464eab1b7:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:eeb686098f9ed23b --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:0691369ecee3bd91 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:bbbcfa0b9bc99534 --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:934116bf7e48c058 --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:98462124de2a29d2 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:2:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:2:3">&nbsp;</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:2:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:256:src-c8852cf69a7b:table:0e0e0e3d7fe4e71b:table -->

图-9 侦察机属性
<!-- source-body:257:src-c8852cf69a7b:paragraph:834ce666a8bd2540:paragraph -->

<!-- source-body:258:src-c8852cf69a7b:paragraph:c854b4da19d7e5cf:paragraph -->

<!-- source-body:259:src-c8852cf69a7b:paragraph:2f44275289f7fabb:paragraph -->

伊势·改无装备
<!-- source-body:260:src-c8852cf69a7b:paragraph:5c5225bbfc1298f0:paragraph -->

<!-- source-body:261:src-c8852cf69a7b:paragraph:177ac746df5b9a86:paragraph -->

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

### 1.2.7 技能与旗舰
<!-- source-body:268:src-c8852cf69a7b:heading:94d45853a3641db9:paragraph -->

部分舰灵技能或旗舰技会提供攻击力加成（此处特指炮击，雷击，航空，轰炸，鱼雷+X%），需在面板数值的基础上乘以相应倍率，或加上相应数值。
<!-- source-body:269:src-c8852cf69a7b:paragraph:b9da8655a6dc459b:paragraph -->

例如：
<!-- source-body:270:src-c8852cf69a7b:paragraph:972b687259049f77:paragraph -->

<!-- source-body:271:src-c8852cf69a7b:paragraph:f00d8ab9b5e626ad:paragraph -->

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

# 防御力：
<!-- source-body:283:src-c8852cf69a7b:heading:66065b10cc46b2f6:paragraph -->

## 2.1 防御力是什么
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

装甲值示意图
<!-- source-body:290:src-c8852cf69a7b:paragraph:51136374ece8f1fe:paragraph -->

计算技能伤害时，对应防御力取装甲值。
<!-- source-body:291:src-c8852cf69a7b:paragraph:28a9288f83acecb7:paragraph -->

## 2.2 影响因素
<!-- source-body:292:src-c8852cf69a7b:heading:9d4e539485060f1e:paragraph -->

本处需要区分PVE与PVP的关系，PVE通常为固定数值，PVP中需按技能命中目标的实际属性计算，可参考己方同名舰灵的面板数值进行估算。
<!-- source-body:293:src-c8852cf69a7b:paragraph:d2ad8f7afcd8fd1e:paragraph -->

### 2.2.1 PVE数值
<!-- source-body:294:src-c8852cf69a7b:heading:d3b527f5ca8aafa6:paragraph -->

19-5：装甲值，对空值
<!-- source-body:295:src-c8852cf69a7b:paragraph:36807f24604369ee:paragraph -->

19-10：装甲值，对空值
<!-- source-body:296:src-c8852cf69a7b:paragraph:b1fc46becfdc5e79:paragraph -->

20-5：装甲值，对空值
<!-- source-body:297:src-c8852cf69a7b:paragraph:2d46f9c7cc9a58d3:paragraph -->

其余关卡特别是多怪关卡暂未找到。
<!-- source-body:298:src-c8852cf69a7b:paragraph:e78e295a6a41bab0:paragraph -->

### 2.2.2 PVP数值
<!-- source-body:299:src-c8852cf69a7b:heading:a2fb146714ae139f:paragraph -->

影响因素与攻击力相同，案例请看攻击力处，此处不再赘述，仅给出数据计算。
<!-- source-body:300:src-c8852cf69a7b:paragraph:323cbb36fa942de6:paragraph -->

#### 2.2.2.1 天赋
<!-- source-body:301:src-c8852cf69a7b:heading:a7e2fbefb71442cb:paragraph -->

天赋通常为百分比加成，也有直接数值加成，以荷马为例：
<!-- source-body:302:src-c8852cf69a7b:paragraph:a0175d9b1f1570ed:paragraph -->

<!-- source-body:303:src-c8852cf69a7b:paragraph:03ad3efd09599ca9:paragraph -->

天赋示意图
<!-- source-body:304:src-c8852cf69a7b:paragraph:b7379b14ac464413:paragraph -->

<!-- source-body:305:src-c8852cf69a7b:paragraph:2333547b4c3dc0f3:paragraph -->

未点亮天赋前荷马面板
<!-- source-body:306:src-c8852cf69a7b:paragraph:d8386c0839f3ebbc:paragraph -->

<!-- source-body:307:src-c8852cf69a7b:paragraph:6191a10ef0318d96:paragraph -->

点亮天赋后荷马面板
<!-- source-body:308:src-c8852cf69a7b:paragraph:79e0e51d328065d8:paragraph -->

以攻击力，倍率为700%，弹种增伤为130%，暴击伤害为140%，增伤区固定为145%，减伤区固定为100%的攻击对不同天赋下荷马的受击进行计算，点亮天赋后受击约为未点亮前的89.45%。等效减伤率提升约11.8%。
<!-- source-body:309:src-c8852cf69a7b:paragraph:f577d4f3dca4dba8:paragraph -->

<!-- source-body:310:src-c8852cf69a7b:paragraph:1b14216e931a4eec:paragraph -->

#### 2.2.2.2 等级与星级
<!-- source-body:311:src-c8852cf69a7b:heading:eca27c3da30564bb:paragraph -->

案例请看1.2.，以鹰在不同等级下的装甲值为例，在攻击力、倍率500%、弹种修正100%的条件下计算，级受到伤害约为级的94.8%（差距点）。对唐斯在不同星级下装甲值进行同等计算，可得星受到伤害约为星的99.39%（差距仅点）。
<!-- source-body:312:src-c8852cf69a7b:paragraph:0fedc298fa070aee:paragraph -->

<!-- source-body:313:src-c8852cf69a7b:paragraph:2e22a2c4b5fce8e2:paragraph -->

#### 2.2.2.3 装备
<!-- source-body:314:src-c8852cf69a7b:heading:a8e454e13f54159f:paragraph -->

目前，可提升对空值的装备主要包括防空炮、舰载机和对空雷达；可提升装甲值的装备主要包括均质装甲和普列塞水下防护系统。通常设备位均需携带5G-1对海搜索雷达，而舰载机位与防空炮位对空值仅对造成航空伤害的舰灵有效，下文仅给出理想化模型下的计算结果。
<!-- source-body:315:src-c8852cf69a7b:paragraph:665fa1e41e62c18b:paragraph -->

取敌方攻击，倍率700%，默认增伤区145%，暴击伤害140%，弹种125%，无减伤修正对以下目标进行攻击。
<!-- source-body:316:src-c8852cf69a7b:paragraph:553e89e4c4890a55:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:a9b235c7eb74029e"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:a9b235c7eb74029e:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:43d011af499fc87f --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:a9b235c7eb74029e:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:7cf93de0ceb8fffe --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:a9b235c7eb74029e:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:1424f4aa55cc0a0d --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:a9b235c7eb74029e:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:520e5826e52ff766 --></th></tr></thead></table></div>
<!-- source-body:317:src-c8852cf69a7b:table:a9b235c7eb74029e:table -->

图-1 装甲值装备属性
<!-- source-body:318:src-c8852cf69a7b:paragraph:d2f563476a19e2d9:paragraph -->

<!-- source-body:319:src-c8852cf69a7b:paragraph:c0ec715d6b85c18a:paragraph -->

<!-- source-body:320:src-c8852cf69a7b:paragraph:5a8e469604ae99b1:paragraph -->

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

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:06f84a13b4797a85"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:49bd313facf180c3 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:70c0f53d4dcd9581 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:a206a1698900c3a3 --></th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:d941c53a7168281e --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:456b89c503cb685b --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:559ac7d60791817e --></td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:2:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:32817eae10d3d0e9 --></td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:2:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:a2176388f4b7fb18 --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:3:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:49388043aa132ff1 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:3:2">&nbsp;</td><td data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:3:3">&nbsp;</td><td data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:06f84a13b4797a85:3:4">&nbsp;</td></tr></tbody></table></div>
<!-- source-body:348:src-c8852cf69a7b:table:06f84a13b4797a85:table -->

图-2 防空炮装备属性
<!-- source-body:349:src-c8852cf69a7b:paragraph:ddf6e4c16cb8da83:paragraph -->

<!-- source-body:350:src-c8852cf69a7b:paragraph:f61388560050375e:paragraph -->

<!-- source-body:351:src-c8852cf69a7b:paragraph:772fdacd12d44827:paragraph -->

荷马装备门二十八联装120mm喷进炮
<!-- source-body:352:src-c8852cf69a7b:paragraph:8b610abcd58b3e1a:paragraph -->

<!-- source-body:353:src-c8852cf69a7b:paragraph:45f583702bb5abed:paragraph -->

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

#### 2.2.2.4 技能与旗舰
<!-- source-body:362:src-c8852cf69a7b:heading:93619f0e7d88e616:paragraph -->

部分技能或旗舰会增加装甲值/对空值，鉴于PVP环境中减伤类旗舰技较为普及，本节暂不纳入相关计算示例。案例如下：
<!-- source-body:363:src-c8852cf69a7b:paragraph:340b5caf9e6d694d:paragraph -->

<!-- source-body:364:src-c8852cf69a7b:paragraph:1ceee975129b1a45:paragraph -->

旗舰示意图
<!-- source-body:365:src-c8852cf69a7b:paragraph:8d28a499af08fd17:paragraph -->

注意此处计算时，请记得在舰灵面板值上计算这类加成。
<!-- source-body:366:src-c8852cf69a7b:paragraph:68853505eb6a1276:paragraph -->

#### 2.2.2.5 强化等级
<!-- source-body:367:src-c8852cf69a7b:heading:25c7c9f809a46a46:paragraph -->

同1.2.3。对比强化前，青叶装甲值提升，对空值提升。
<!-- source-body:368:src-c8852cf69a7b:paragraph:6c9512e54bd6a5d2:paragraph -->

#### 2.2.2.6 舰种
<!-- source-body:369:src-c8852cf69a7b:heading:67ac8c2536b3b872:paragraph -->

同1.2.1，同等级下，大船（战列、战巡、航母、装母）的基础面板通常高于中船（轻巡、重巡、重炮、轻母），中船又高于小船（驱逐、水母）。
<!-- source-body:370:src-c8852cf69a7b:paragraph:484b2a0c9b18d2b9:paragraph -->

#### 2.2.2.7 羁绊
<!-- source-body:371:src-c8852cf69a7b:heading:9d19eac62df10307:paragraph -->

同1.2.5。其余各加成不变，对同一舰灵进行计算可得：羁绊加成每提升1%，最终伤害降低约3.42%。
<!-- source-body:372:src-c8852cf69a7b:paragraph:ee5eb09635b3ec1c:paragraph -->

羁绊加成也会在舰灵面板上显示，无需进行额外计算。
<!-- source-body:373:src-c8852cf69a7b:paragraph:d90001c60dfa987d:paragraph -->

<!-- source-body:374:src-c8852cf69a7b:paragraph:5c9995aa97bfbe0c:paragraph -->

# 倍率区：
<!-- source-body:375:src-c8852cf69a7b:heading:09063c8535900d43:paragraph -->

## 3.1 什么是倍率
<!-- source-body:376:src-c8852cf69a7b:heading:5a3f823933d40638:paragraph -->

指技能倍率与普攻倍率。技能倍率可在面板中点击技能查看，普攻倍率请查看附表（拂晓舰灵普攻倍率）。
<!-- source-body:377:src-c8852cf69a7b:paragraph:02f0266b30d81ab0:paragraph -->

<!-- source-body:378:src-c8852cf69a7b:paragraph:5c367ff77187b924:paragraph -->

<!-- source-body:379:src-c8852cf69a7b:paragraph:73ee6891d4f2f900:paragraph -->

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

## 3.2 影响因素
<!-- source-body:387:src-c8852cf69a7b:heading:5a1f96ce45224545:paragraph -->

倍率区数值仅受技能等级影响。舰灵通过技能学院学习技能等级提升倍率。实际计算时直接查看技能面板中倍率即可。
<!-- source-body:388:src-c8852cf69a7b:paragraph:4ebdc77d080bbc99:paragraph -->

羁绊技能倍率与其等级有关，而其等级按舰灵必杀技与旗舰技等级换算而成，为该舰灵的必杀技与旗舰技等级之和除以后向下取整。例如级必杀级旗舰，羁绊技等级为；级必杀级旗舰，羁绊技等级为。
<!-- source-body:389:src-c8852cf69a7b:paragraph:d0139890596f80db:paragraph -->

# 暴击伤害修正
<!-- source-body:390:src-c8852cf69a7b:heading:4d38914c2ee7b133:paragraph -->

## 什么是暴击伤害修正
<!-- source-body:391:src-c8852cf69a7b:heading:7e2b6c175dadcffe:paragraph -->

暴击伤害为暴击触发时产生的额外倍率伤害，属于独立乘区。默认值为140%。无暴击时该乘区默认100%。
<!-- source-body:392:src-c8852cf69a7b:paragraph:f7bfb879da033ada:paragraph -->

## 4.2 影响因素
<!-- source-body:393:src-c8852cf69a7b:heading:6f0a6cbbe9eb6b17:paragraph -->

可调控范围内，仅有三件装备与一种阵型影响，分别为：
<!-- source-body:394:src-c8852cf69a7b:paragraph:bbdaa533c2ae31ee:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:9be7840a47446f90"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:9be7840a47446f90:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:508917be4527740a --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:9be7840a47446f90:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:b6ba39689fd156b1 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:9be7840a47446f90:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:f486e3918c57fd6e --></th></tr></thead></table></div>
<!-- source-body:395:src-c8852cf69a7b:table:9be7840a47446f90:table -->

<!-- source-body:396:src-c8852cf69a7b:paragraph:423bbbc0baa4abc8:paragraph -->

图-1 暴击伤害装备
<!-- source-body:397:src-c8852cf69a7b:paragraph:64ea8d3de7e28081:paragraph -->

<!-- source-body:398:src-c8852cf69a7b:paragraph:6612f6ad2f2d6647:paragraph -->

图-2 梯形阵
<!-- source-body:399:src-c8852cf69a7b:paragraph:79df63da8f41831f:paragraph -->

按照攻击，700%倍率，敌方防御力，增伤区135%，无减伤修正计算，梯形阵比无暴击伤害加成下提升约3.57%；满级高脚杯提升约60.82%（计算装备增加数值），满级BTD-1毁灭者提升约39.91%（计算装备增加数值），满级B-25提升约73.36%（计算装备增加数值）。
<!-- source-body:400:src-c8852cf69a7b:paragraph:e1afbe99f3c38ccb:paragraph -->

部分舰灵独有属性（旗舰技，天赋，技能）也会增加暴击伤害，案例如下：
<!-- source-body:401:src-c8852cf69a7b:paragraph:07b0f623a54baaa0:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:83271d1b2981dd78"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:83271d1b2981dd78:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:63e60a87f05dde04 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:83271d1b2981dd78:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:366748e337e3b016 --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:83271d1b2981dd78:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:97e42b591a00ca34 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:83271d1b2981dd78:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:8d3ca025588dcd90 --></td></tr></tbody></table></div>
<!-- source-body:402:src-c8852cf69a7b:table:83271d1b2981dd78:table -->

暴击伤害技能示意图
<!-- source-body:403:src-c8852cf69a7b:paragraph:4b9cf6767f6d46a3:paragraph -->

由于此处并非每位舰灵都能调整，且为独立乘区，暂不给出提升率计算。
<!-- source-body:404:src-c8852cf69a7b:paragraph:fba26f7f1a12dfc7:paragraph -->

<!-- source-body:405:src-c8852cf69a7b:paragraph:4c8fb7c8f4d1065d:paragraph -->

# 弹种修正
<!-- source-body:406:src-c8852cf69a7b:heading:04975a6d1fa0bcd6:paragraph -->

弹种修正为每位舰灵的独有属性，具体请看下图：
<!-- source-body:407:src-c8852cf69a7b:paragraph:043ce6a368ed868b:paragraph -->

<!-- source-body:408:src-c8852cf69a7b:paragraph:0723bbc48d4317d4:paragraph -->

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

## 5.1 高爆弹点燃
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

## 5.2 穿甲弹击穿判定
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

# 增伤修正
<!-- source-body:450:src-c8852cf69a7b:heading:77e7ec0d31a9c6dd:paragraph -->

增伤修正为拂晓目前的增伤区集合，受以下因素影响。（注：本节内所述因素均以加算方式叠加）
<!-- source-body:451:src-c8852cf69a7b:paragraph:086f15b0e86fe62a:paragraph -->

## .1 好感增伤
<!-- source-body:452:src-c8852cf69a7b:heading:e97993b58cd4c5c6:paragraph -->

好感度与增伤相关，具体数值如下：
<!-- source-body:453:src-c8852cf69a7b:paragraph:dbe4c7ea62d5cff0:paragraph -->

<!-- source-body:454:src-c8852cf69a7b:paragraph:4d22cd69eab8e3ea:paragraph -->

图5.1 好感增伤数值
<!-- source-body:455:src-c8852cf69a7b:paragraph:b76db30c451e2dcc:paragraph -->

经测算，在其他条件恒定前提下，好感度由“爱”提升至“誓约”，最终伤害增幅约为4.84%；由“誓约”到“永恒”，最终伤害提升约.84%；由“爱”到“永恒”，最终伤害提升约8.87%。鉴于收益显著，建议优先将有出战需求舰灵好感度培养至“誓约”及以上等级。好感度还决定装备槽数量："誓约"开第 5 槽、"依偎"第 6、"守护"第 7、"至爱"第 8，规则同前四槽。考虑到 6.4 节提到的索敌机制，实战中建议队伍内至少存在位好感达到“至爱”的舰灵。
<!-- source-body:456:src-c8852cf69a7b:paragraph:ffa126ffafcbe115:paragraph -->

## .2 天赋增伤
<!-- source-body:457:src-c8852cf69a7b:heading:edcb6967c7afad06:paragraph -->

天赋列表中常见的增伤词条包括对特定舰种增伤，以及攻击、炮击或雷击伤害加成等。此类增伤均在本处计算。
<!-- source-body:458:src-c8852cf69a7b:paragraph:742349e2d2fa7760:paragraph -->

例如以下天赋面板（来自神通改）：
<!-- source-body:459:src-c8852cf69a7b:paragraph:73bfeb37eaebb8c1:paragraph -->

<!-- source-body:460:src-c8852cf69a7b:paragraph:b949267c5b57030a:paragraph -->

天赋面板示意图
<!-- source-body:461:src-c8852cf69a7b:paragraph:383b08a04222ef21:paragraph -->

此处对理想中型敌方（中甲单位），防御值，我方轻巡穿甲弹（125%），攻击，倍率700%，增伤区取默认145%（未包含该天赋增伤）进行计算（取该值为100%），可得：
<!-- source-body:462:src-c8852cf69a7b:paragraph:b5b911b9f64c8389:paragraph -->

在单独点亮对中型舰伤害提升天赋后，最终伤害提升约17.24%；在单独点亮了攻击伤害加成后，最终伤害提升约13.79%；在单独点亮炮击伤害加成后，最终伤害提升约6.89%；在同时点亮对中增以及攻击伤害加成后，最终伤害提升约31.03%。
<!-- source-body:463:src-c8852cf69a7b:paragraph:fe0281617460f0b8:paragraph -->

需注意天赋需要舰灵好感达到相识解锁，天赋需要舰灵星级达到星解锁，天赋需要舰灵好感达到喜欢解锁，天赋需要舰灵星级达到星解锁。实际计算时请自行查看面板。
<!-- source-body:464:src-c8852cf69a7b:paragraph:4eac761b45c68db8:paragraph -->

## .3 羁绊增伤
<!-- source-body:465:src-c8852cf69a7b:heading:3a69b439f13a1600:paragraph -->

羁绊系统中有两项可在战斗中为全队提供炮击或雷击伤害加成的效果，如下图所示：
<!-- source-body:466:src-c8852cf69a7b:paragraph:4204c83bec717e05:paragraph -->

<!-- source-body:467:src-c8852cf69a7b:paragraph:c2948c67f5381338:paragraph -->

图5.2 羁绊增伤
<!-- source-body:468:src-c8852cf69a7b:paragraph:a64ebb0d93fba6cb:paragraph -->

例如，此处对理想中型敌方（中甲单位），防御值，我方轻巡穿甲弹（125%），攻击，倍率700%，增伤区取默认135%，进行计算。长门级羁绊星相较于无星级提升约1.48%，满星级相较于无星级提升约7.40%。
<!-- source-body:469:src-c8852cf69a7b:paragraph:fc417127f5134a67:paragraph -->

## .4 索敌/制空增伤
<!-- source-body:470:src-c8852cf69a7b:heading:ca6789243c24ca37:paragraph -->

索敌与制空影响增伤区，其中索敌可带来“索敌成功”buff、航向状态buff，主要影响炮击、雷击伤害；制空只能带来制空状态buff，主要影响航空伤害。具体如下：
<!-- source-body:471:src-c8852cf69a7b:paragraph:e06cd384d284e113:paragraph -->

当进攻方舰队索敌值高于防守方时，进攻方获得“索敌成功”buff（进攻方命中率+10%，防守方命中率-10%），判定为同航战或T优势（进攻方大于防守方的倍时）；
<!-- source-body:472:src-c8852cf69a7b:paragraph:2f4d817cc32f5053:paragraph -->

当进攻方索敌值低于防守方时，进攻方获得“索敌失败”buff，同时判定为反航战或T劣势（当进攻方小于防守方的倍时）；
<!-- source-body:473:src-c8852cf69a7b:paragraph:89cbbde1f642e585:paragraph -->

各航向状态buff见下表：
<!-- source-body:474:src-c8852cf69a7b:paragraph:8d335a5ac5360cd4:paragraph -->

表4-1 航向buff
<!-- source-body:475:src-c8852cf69a7b:paragraph:fa639d9d3dd18192:paragraph -->

| 航向判定 | 进攻方 | 防守方 |
| --- | --- | --- |
| T优势 | 雷击/炮击伤害+15%，命中值+20% | 雷击/炮击伤害-15%，命中值-10% |
| 同航战 | 炮击/雷击伤害+8%，命中值+10% | 炮击/雷击伤害+8%，命中值+10% |
| 反航战 | 炮击/雷击伤害-8%，命中值-10% | 炮击/雷击伤害-8%，命中值-10% |
| T劣势 | 雷击/炮击伤害-15%，命中值-10% | 雷击/炮击伤害+15%，命中值+20% |
<!-- source-body:476:src-c8852cf69a7b:table:5d11d2bcb92d0ee2:table -->

制空状态的判定规则同上，注意没有“制空成功”buff，各制空状态buff如下图所示：
<!-- source-body:477:src-c8852cf69a7b:paragraph:131fc082c1388704:paragraph -->

<!-- source-body:478:src-c8852cf69a7b:paragraph:55cc433b2ceea01a:paragraph -->

图5.3 制空状态buff
<!-- source-body:479:src-c8852cf69a7b:paragraph:a2f379b4a517b367:paragraph -->

关于制空值的计算：
<!-- source-body:480:src-c8852cf69a7b:paragraph:bffb16bd1fb48d1d:paragraph -->

制空值仅与队伍中的航母、轻母、装母、水母有关，如果队伍中不存在上述舰灵，则制空值默认为。
<!-- source-body:481:src-c8852cf69a7b:paragraph:a2de417845a04731:paragraph -->

全队的制空值按单船的制空值相加获得。
<!-- source-body:482:src-c8852cf69a7b:paragraph:df43391a4ebbd8fe:paragraph -->

单船制空值公式如下：
<!-- source-body:483:src-c8852cf69a7b:paragraph:ae8ab580b18cb180:paragraph -->

单船制空值=船只面板航空值+战斗机实际装备位置载机量总和×0.75+轰炸机与鱼雷机实际装备位置载机量总和×0.25
<!-- source-body:484:src-c8852cf69a7b:paragraph:2f90cf6eb7ad8a8f:paragraph -->

注：部分轻巡、重巡、战巡，设备位的机库值为，在携带侦察机的情况下会产生点制空值。
<!-- source-body:485:src-c8852cf69a7b:paragraph:4bc9d54e57e786e6:paragraph -->

例如，船只航空值，在战斗机位置（机库）装备战斗机，在轰炸机（机库）装备轰炸机，在鱼雷机（机库）位置装备鱼雷机。在设备位（机库）装备战斗机，则其制空值=1000/3.33+（18+10）*0.75+（18+27）*0.25=332点制空值（向下取整）
<!-- source-body:486:src-c8852cf69a7b:paragraph:c9d848e71bb1226f:paragraph -->

载机量相关请看1.2.6。
<!-- source-body:487:src-c8852cf69a7b:paragraph:bab8463795861c49:paragraph -->

对理想中型敌方（中甲单位），防御值，我方轻巡穿甲弹（125%），攻击，倍率700%，增伤区取默认145%（未计算本处增伤），以本处增伤0%为基准（100%），同航战伤害约为105.51%，T优势下的伤害约为110.34%，反航伤害约为94.48%，T劣势下的伤害约为89.65%。对于航空伤害，取敌方轻甲防御，我方轰炸，航空值，倍率700%，增伤区默认取135%（未计算本处增伤），以本处增伤0%为基准（100%），制空优势伤害约为%，制空确保伤害约为.%，制空劣势伤害约为%，制空丧失伤害约为%。
<!-- source-body:488:src-c8852cf69a7b:paragraph:86d83c7f55fb4919:paragraph -->

PVE作战中，主要伤害为炮击/雷击队伍应争取获得T优buff，航空伤害队伍需确保同航战时取得制空确保。PVP中，同航与反航的差距通常不大，只要不陷入T劣势都能打。
<!-- source-body:489:src-c8852cf69a7b:paragraph:ea251307c692e421:paragraph -->

## .5 阵型增伤
<!-- source-body:490:src-c8852cf69a7b:heading:04d882bb77276a8e:paragraph -->

阵型增伤为拂晓战备中重要一环，虽然数值并不多，但依旧对通关有影响。具体阵型如下：
<!-- source-body:491:src-c8852cf69a7b:paragraph:9fee99d20bf678f4:paragraph -->

<!-- source-body:492:src-c8852cf69a7b:paragraph:b9c02d3320933819:paragraph -->

图-4 阵型
<!-- source-body:493:src-c8852cf69a7b:paragraph:0997d88ca7bad79a:paragraph -->

### .5.1 单纵阵
<!-- source-body:494:src-c8852cf69a7b:heading:f60f173f032ed97f:paragraph -->

效果：我方炮击、雷击伤害+12%
<!-- source-body:495:src-c8852cf69a7b:paragraph:ec18bff4a655aa0b:paragraph -->

以PVE标准战备计算所得（以下涉及计算过程省略），单独计算增伤，对于炮击/雷击提升约为11%；在以19-10为基准计算后，对比无增伤阵型，提升约9%。（对比同一区间增伤，天赋增伤20%，T优BUFF增伤15%）由于其同时提升炮击与雷击伤害，更适用于驱逐，巡洋这类同时具有炮击和鱼雷的舰型。
<!-- source-body:496:src-c8852cf69a7b:paragraph:bf295d9b2058f2ec:paragraph -->

以通用小船场PVP计算，对于炮击/雷击伤害最终伤害提升大约8%；以减伤旗舰大船场PVP计算，对于炮击/雷击伤害最终伤害提升大约6.5%。
<!-- source-body:497:src-c8852cf69a7b:paragraph:1d76cbcda5f437e3:paragraph -->

### .5.2 轮型阵
<!-- source-body:498:src-c8852cf69a7b:heading:a43e770a0ae38fb6:paragraph -->

效果：我方航空、对空伤害+15%，炮击、雷击伤害-5%
<!-- source-body:499:src-c8852cf69a7b:paragraph:2dfb1356a4a2cbb1:paragraph -->

轮型阵为增伤类阵型，与单纵阵相同。实际增伤相比单纵阵，用对空，航空的3%增伤换炮击，雷击-5%，故仅推荐在航系输出占比较高的队伍中使用。
<!-- source-body:500:src-c8852cf69a7b:paragraph:18a86f8836ddca1f:paragraph -->

对PVE标准战备计算，单独计算航空增伤，提升约为12%；在以19-10为基准计算后，对比无增伤阵型，提升约10%。
<!-- source-body:501:src-c8852cf69a7b:paragraph:50a93642a3343a75:paragraph -->

对PVP标准进行计算，大型船航母对重甲伤害提升10%，但战列对同甲伤害-5%。
<!-- source-body:502:src-c8852cf69a7b:paragraph:5e4bdd1d90c75257:paragraph -->

主要适用于由轻母、装母和航母组成的航系队伍。
<!-- source-body:503:src-c8852cf69a7b:paragraph:743c80085d1cfd65:paragraph -->

### .5.3 梯形阵
<!-- source-body:504:src-c8852cf69a7b:heading:55b7a58983d5c707:paragraph -->

效果：我方暴击率+15%，暴击伤害+5%，被暴击率+5%
<!-- source-body:505:src-c8852cf69a7b:paragraph:574196a5c14bb1e7:paragraph -->

梯形阵为增伤类阵型，通过提升暴击率达到增伤目的，但需要注意被暴击率增加造成的生存压力增大。主要用于以较低练度尝试通关。
<!-- source-body:506:src-c8852cf69a7b:paragraph:d547a671d39333a3:paragraph -->

以面板攻，700%倍率，防，暴击伤害140%默认值，弹种增伤125%（航队取130%），增伤区145%（航队取135%），减伤区无修正，双方幸运值相同，且不计额外暴击率加成或防暴击率修正进行计算。无必定暴击情况下，炮系舰灵梯形阵最终伤害仅为同条件单纵阵伤害的98.91%；计算穿甲弹必定暴击情况下，梯形阵最终伤害比单纵阵低大约32.76%。按航系计算，梯形阵约为轮型阵的96.40%。（本处计算期望，且默认必中）
<!-- source-body:507:src-c8852cf69a7b:paragraph:d38d3341878e4404:paragraph -->

关于暴击率问题，请看后文。
<!-- source-body:508:src-c8852cf69a7b:paragraph:4108e1a2788e5516:paragraph -->

## .6 旗舰增伤
<!-- source-body:509:src-c8852cf69a7b:heading:0f92ab74442105f9:paragraph -->

旗舰中描写有炮击/雷击/航空/轰炸/鱼雷伤害增加属于本处。以下为例子：
<!-- source-body:510:src-c8852cf69a7b:paragraph:169f35807c16b6b3:paragraph -->

<!-- source-body:511:src-c8852cf69a7b:paragraph:6ac16366e974572b:paragraph -->

<!-- source-body:512:src-c8852cf69a7b:paragraph:dd2aa90b8328f37e:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:af80d022570b9a52"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:803eea6bac09785a --><br />维内托旗舰</th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:399c845a0c9aa77b --><br />加贺旗舰</th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:ca16040bae44632c --><br />大井改旗舰</th><th data-grid-column="4" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:4"><!-- docx-cell-media:src-c8852cf69a7b:relation:52f50b1f9b62ca9d --><br />列克星敦旗舰</th><th data-grid-column="5" data-source-cell="src-c8852cf69a7b:table:af80d022570b9a52:1:5"><!-- docx-cell-media:src-c8852cf69a7b:relation:ebd5fdca100fcb7f --><br />新奥尔良旗舰</th></tr></thead></table></div>
<!-- source-body:513:src-c8852cf69a7b:table:af80d022570b9a52:table -->

以标准敌方为目标，设防御力为，弹种增伤为100%，我方攻击力为，倍率为700%，暴击伤害为140%，增伤修正为135%（未计算本处增伤），该情况作为基准（100%），计算得从左到右分别比基准值高27.40%，20.00%，11.11%，16.30%，7.41%。由于旗舰增伤仅与舰灵旗舰技以及旗舰等级有关，因此，在多数情况下，该项在本乘区中按计算，除非旗舰技明确写明有本乘区数值。
<!-- source-body:514:src-c8852cf69a7b:paragraph:fc4f37b1b970c6a5:paragraph -->

## .7 装备增伤
<!-- source-body:515:src-c8852cf69a7b:heading:d7136fc09c875d26:paragraph -->

目前（.）拂晓内明确写在该乘区内增伤只有超重弹一件装备。具体数值如下：
<!-- source-body:516:src-c8852cf69a7b:paragraph:9c6320554154008d:paragraph -->

<!-- source-body:517:src-c8852cf69a7b:paragraph:1b5b621f7a43c696:paragraph -->

图-5 超重弹
<!-- source-body:518:src-c8852cf69a7b:paragraph:57533b6f8bb369c6:paragraph -->

对其进行标准计算，取攻击力，倍率700%，弹种增伤125%，防御力，暴击伤害140%，未计入该装备加成时，增伤修正取155%，以此为基准，携带超重弹个后最终伤害提升约24.05%。（计算炮击增加数值）
<!-- source-body:519:src-c8852cf69a7b:paragraph:2e312bb5f5b2c982:paragraph -->

<!-- source-body:520:src-c8852cf69a7b:paragraph:b870367445efbc3a:paragraph -->

## .8 拉古兹增伤
<!-- source-body:521:src-c8852cf69a7b:heading:df60b4510f1f9feb:paragraph -->

拉古兹增伤目前仅在部分舰灵技能描述中出现，且仅在PVE战斗中生效。
<!-- source-body:522:src-c8852cf69a7b:paragraph:3483870a24258651:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:fc777e13ab89a69d"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:fc777e13ab89a69d:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:bc384a86e060de73 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:fc777e13ab89a69d:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:3b40c95985a2e594 --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:fc777e13ab89a69d:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:3e552d5b272d08dd --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:fc777e13ab89a69d:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:446fe8d9fed27d7d --></td></tr></tbody></table></div>
<!-- source-body:523:src-c8852cf69a7b:table:fc777e13ab89a69d:table -->

拉古兹增伤图示
<!-- source-body:524:src-c8852cf69a7b:paragraph:de40fe506a72e7e3:paragraph -->

# 减伤修正
<!-- source-body:525:src-c8852cf69a7b:heading:8606bce44ea0ebf0:paragraph -->

减伤为独立乘区，且为加算。通常本处在PVE中可直接按无减伤修正（100%）计算，PVP才有增加减伤手段。由于其为独立乘区，可认为减伤堆叠直接使伤害降低对应数值百分比。
<!-- source-body:526:src-c8852cf69a7b:paragraph:8b83f92f54953fac:paragraph -->

目前PVP增加减伤手段有：好感（数值请看）、天赋、旗舰与技能效果、普列塞水下防护装置（仅大船装备且仅能减免雷击与鱼雷伤害）、防空炮自带减伤词条（仅针对航空伤害）。由于不具有普遍性，且为直接影响伤害，本处不给出计算。
<!-- source-body:527:src-c8852cf69a7b:paragraph:267d8cba11c7ff12:paragraph -->

<!-- source-body:528:src-c8852cf69a7b:paragraph:0826582d8a903115:paragraph -->

减伤图示
<!-- source-body:529:src-c8852cf69a7b:paragraph:f08ea5c445394e76:paragraph -->

# 等级压制
<!-- source-body:530:src-c8852cf69a7b:heading:0793e137b0b3f9a7:paragraph -->

仅PVE存在。规律为双方等级每差距级，等级高的一方获得攻击伤害加成+2%，攻击伤害减免+2%。该加成以加算方式累计，最高获得加成不超过50%。例如敌方级，我方级，则我方对敌方造成伤害计算时需×60%，敌方对我方造成伤害计算时需×140%。减伤为加算，可在减伤乘区加算叠加，但注意仅PVE生效。
<!-- source-body:531:src-c8852cf69a7b:paragraph:3ade0c426ca9ee3a:paragraph -->

注：19-5等级为76,19-10等级为，20-5等级为。
<!-- source-body:532:src-c8852cf69a7b:paragraph:56df19bba43a0316:paragraph -->

<!-- source-body:533:src-c8852cf69a7b:paragraph:0a77edc26940ca52:paragraph -->

# 暴击率与暴击伤害
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

## .1 攻方幸运，守方幸运
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

### .1.1 等级与星级
<!-- source-body:548:src-c8852cf69a7b:heading:48ae7dac91120a34:paragraph -->

提升等级与提升星级时偶尔会提升到点幸运。由于并非每次都会提升，故无法总结规律，建议以面板上显示幸运为准。
<!-- source-body:549:src-c8852cf69a7b:paragraph:1c3ffd346b6f8a83:paragraph -->

### .1.2 羁绊
<!-- source-body:550:src-c8852cf69a7b:heading:30522e641634753b:paragraph -->

<!-- source-body:551:src-c8852cf69a7b:paragraph:73ff48366aa439ff:paragraph -->

图6.1 幸运羁绊
<!-- source-body:552:src-c8852cf69a7b:paragraph:76d6e10865a2d543:paragraph -->

主要受该羁绊影响，但其影响已经加到面板中，故一般取面板值即可。
<!-- source-body:553:src-c8852cf69a7b:paragraph:4bed361af3156187:paragraph -->

### .1.3 装备
<!-- source-body:554:src-c8852cf69a7b:heading:36e24e135d4d885b:paragraph -->

部分装备会影响幸运，具体如下所示：
<!-- source-body:555:src-c8852cf69a7b:paragraph:650fa15bab3582c6:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:b6af1f6d9baba62d"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:4447e01dd262e78f --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:a73328d86faae7dc --></th></tr></thead><tbody><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:2:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:3fcc01e88a030241 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:2:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:a8623cf7a0e0bb7d --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:3:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:87ba02140c79b300 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:3:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:6aec82144648a432 --></td></tr><tr><td data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:4:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:cd42dc0f05c2e533 --></td><td data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:b6af1f6d9baba62d:4:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:a338bcf23cf67e97 --></td></tr></tbody></table></div>
<!-- source-body:556:src-c8852cf69a7b:table:b6af1f6d9baba62d:table -->

图-2 幸运装备
<!-- source-body:557:src-c8852cf69a7b:paragraph:fb47badb2fd7f1d0:paragraph -->

取双方幸运均为进行计算，架满级SBD-3无畏提升暴击率约13.2%，架提升暴击率约22.88%；架满级金剑鱼提升暴击率约6.72%，架提升暴击率约13.88%；个蛋糕提升暴击率约4.07%，个蛋糕提升暴击率约7.64%；个勋章提升暴击率约.14%；个满级柴油机提升暴击率约6.17%，个满级柴油机提升暴击率约13.14%；个满级雷达告警装置提升暴击率约4.07%，个满级雷达告警装置提升暴击率约9.47%。（注：上述双装备方案均已计入誓约提供的点幸运）
<!-- source-body:558:src-c8852cf69a7b:paragraph:9f5aeaf6b9ec3634:paragraph -->

<!-- source-body:559:src-c8852cf69a7b:paragraph:d0efa4e9b3a09a12:paragraph -->

### .1.4 誓约
<!-- source-body:560:src-c8852cf69a7b:heading:da1e6349951c8309:paragraph -->

舰灵缔结誓约后，基础幸运值永久增加点。
<!-- source-body:561:src-c8852cf69a7b:paragraph:53f36dcf90a1e272:paragraph -->

<!-- source-body:562:src-c8852cf69a7b:paragraph:47f7c71aab5b0588:paragraph -->

## 加成暴击率
<!-- source-body:563:src-c8852cf69a7b:heading:f81f5160a0632d04:paragraph -->

当前加成暴击率主要来自以下途径：装备词条加成，旗舰加成，技能加成，梯形阵。
<!-- source-body:564:src-c8852cf69a7b:paragraph:067190d73a1c9b5b:paragraph -->

### .2.1 装备加成
<!-- source-body:565:src-c8852cf69a7b:heading:3975142c1f86ef89:paragraph -->

目前仅发现 九七式舰攻（番）飞机与九一式穿甲弹携带该词条。
<!-- source-body:566:src-c8852cf69a7b:paragraph:b8a94c253710324a:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:d951b749dc521c7a"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:d951b749dc521c7a:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:2b3cbed63ca5c9c2 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:d951b749dc521c7a:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:02ffe9a72499658d --></th></tr></thead></table></div>
<!-- source-body:567:src-c8852cf69a7b:table:d951b749dc521c7a:table -->

图-3 加成暴击率装备
<!-- source-body:568:src-c8852cf69a7b:paragraph:aa5140f15db101a4:paragraph -->

<!-- source-body:569:src-c8852cf69a7b:paragraph:dc768bd7b4ee03ed:paragraph -->

### .2.2 旗舰加成
<!-- source-body:570:src-c8852cf69a7b:heading:d50368a49255fde0:paragraph -->

仅部分旗舰技有该词条，例如：
<!-- source-body:571:src-c8852cf69a7b:paragraph:87f2e34d9edb89cc:paragraph -->

<!-- source-body:572:src-c8852cf69a7b:paragraph:264e56f118db99f2:paragraph -->

旗舰图示
<!-- source-body:573:src-c8852cf69a7b:paragraph:0b767b5be84af6f2:paragraph -->

### .2.3 天赋加成
<!-- source-body:574:src-c8852cf69a7b:heading:11bf35ce70331ec5:paragraph -->

仅部分舰灵能够获得该加成，例如：
<!-- source-body:575:src-c8852cf69a7b:paragraph:7397e9d102a5496b:paragraph -->

<!-- source-body:576:src-c8852cf69a7b:paragraph:a732ee79a49524fc:paragraph -->

天赋图示
<!-- source-body:577:src-c8852cf69a7b:paragraph:747a1bf689741e83:paragraph -->

### .2.4 技能加成
<!-- source-body:578:src-c8852cf69a7b:heading:9b2a939bc49665c7:paragraph -->

仅部分舰灵拥有，例如：
<!-- source-body:579:src-c8852cf69a7b:paragraph:62a51e25dca94d31:paragraph -->

<!-- source-body:580:src-c8852cf69a7b:paragraph:77f4abd3eaa93746:paragraph -->

技能图示
<!-- source-body:581:src-c8852cf69a7b:paragraph:d630a565926de829:paragraph -->

### .2.5 阵型
<!-- source-body:582:src-c8852cf69a7b:heading:a0b7720156a38b48:paragraph -->

目前仅梯形阵能增加，具体如下：
<!-- source-body:583:src-c8852cf69a7b:paragraph:a7e17b6a9c254488:paragraph -->

效果：我方暴击率+15%，暴击伤害+5%，被暴击率+5%
<!-- source-body:584:src-c8852cf69a7b:paragraph:9e645a4904290e6b:paragraph -->

以攻，700%倍率，防，增伤区145%（航队取135%），减防区无修正，暴击伤害140%默认值，弹种增伤125%（航队取130%），双方幸运值同样，无额外加减暴击率计算。无必定暴击情况下，炮系舰灵梯形阵最终伤害仅为同条件单纵阵伤害的98.91%；计算穿甲弹必定暴击情况下，梯形阵最终伤害比单纵阵低大约32.76%。按航系计算，梯形阵约为轮型阵的96.40%。（本处计算期望，且默认必中）
<!-- source-body:585:src-c8852cf69a7b:paragraph:7888caf9bb8a49f7:paragraph -->

<!-- source-body:586:src-c8852cf69a7b:paragraph:5cc9eba90d67e43b:paragraph -->

## .3 防暴击率
<!-- source-body:587:src-c8852cf69a7b:heading:371170aded7b381d:paragraph -->

防暴击率目前只有两个轰炸机能增加，我方天赋中均为降低我方防暴击率。具体如下图所示：
<!-- source-body:588:src-c8852cf69a7b:paragraph:064dcd04c0bc8702:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:cc5109e2fc71837a"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:cc5109e2fc71837a:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:6d3e0523c6d5adb7 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:cc5109e2fc71837a:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:efab820e399d6199 --></th></tr></thead></table></div>
<!-- source-body:589:src-c8852cf69a7b:table:cc5109e2fc71837a:table -->

图-4 防暴击率装备
<!-- source-body:590:src-c8852cf69a7b:paragraph:2b0b3c7a3e66cc0b:paragraph -->

以防暴击率12%核算，对同幸运单位，受到伤害约为未装备的%。需要注意在PVP中经常因被暴击而被击沉，所以堆防暴击率依然是有必要的。
<!-- source-body:591:src-c8852cf69a7b:paragraph:8ce1aef1eaa947e9:paragraph -->

对梯形阵而言，在其他条件相同的情况下计算，相比于单纵阵与轮型阵，梯形阵提高了约19%等效血量需求。
<!-- source-body:592:src-c8852cf69a7b:paragraph:b87262550fff6e7c:paragraph -->

<!-- source-body:593:src-c8852cf69a7b:paragraph:1b7dbe8edee2a102:paragraph -->

# 命中率与闪避率
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

## .1 攻方命中
<!-- source-body:602:src-c8852cf69a7b:heading:bf12d684c6ad3cea:paragraph -->

指舰灵面板中命中。其影响因素与前文所述攻击力、防御力相同，均受舰灵舰种、舰灵等级与星级、舰灵天赋、舰灵羁绊、舰灵装备（大部分装备都会带有命中词条）、技能效果等影响。除技能效果外其余计算过程结果已经显示在舰灵面板上。由于前文已写出详细内容，故本处不再赘述。实战中仅需注意是否有技能效果影响命中与是否取得航向/制空buff，否则通常取舰灵面板值即可。
<!-- source-body:603:src-c8852cf69a7b:paragraph:ace1d76f789873fe:paragraph -->

<!-- source-body:604:src-c8852cf69a7b:paragraph:d6407c96051cf76d:paragraph -->

## .2 守方机动
<!-- source-body:605:src-c8852cf69a7b:heading:80ddaa09ea25f7d9:paragraph -->

守方机动在PVE中通常为固定值（对面什么船都是一样的），PVP请按预计敌方舰灵可能存在的值（用自身同一舰灵面板值代入）进行计算。本处仅给出一个单独例子，实际核算请读者自行计算。
<!-- source-body:606:src-c8852cf69a7b:paragraph:e73db0ef201f2b3a:paragraph -->

### .2.1 PVE数值
<!-- source-body:607:src-c8852cf69a7b:heading:03c38b506e720c18:paragraph -->

19-5机动值为125,19-10机动值为，20-5机动值为，其余并未找到。
<!-- source-body:608:src-c8852cf69a7b:paragraph:0489ad0ac2512ddf:paragraph -->

### .2.2 PVP数值
<!-- source-body:609:src-c8852cf69a7b:heading:4c35c0eb174e98e4:paragraph -->

通常也取面板数值，主要调控手段为先进型动力系统以及复纵阵，下面介绍：
<!-- source-body:610:src-c8852cf69a7b:paragraph:71c34361b1b68047:paragraph -->

#### 8.2.2.1 先进型动力系统
<!-- source-body:611:src-c8852cf69a7b:heading:fef87958e404296b:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:9ad85ec54e6046b9"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:9ad85ec54e6046b9:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:d7f3174f82f0f844 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:9ad85ec54e6046b9:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:a0842e39c8ea1c12 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:9ad85ec54e6046b9:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:163822fa226430d8 --></th></tr></thead></table></div>
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

#### 8.2.2.2 复纵阵：
<!-- source-body:618:src-c8852cf69a7b:heading:5ef63257ab5d818f:paragraph -->

效果：我方机动+25%
<!-- source-body:619:src-c8852cf69a7b:paragraph:65f5d2f3fbdbff49:paragraph -->

分别对原始机动为，，进行衡算，攻方命中固定进行计算。
<!-- source-body:620:src-c8852cf69a7b:paragraph:0c363bd977d6e89e:paragraph -->

可得对机动单位，复纵阵闪避提升约3.33%；对机动单位，复纵阵闪避提升约4.76%；对机动单位，复纵阵闪避提升约5.56%。由此可得，复纵阵对原始机动越高的单位，提升幅度越大，通常推荐小中船携带。
<!-- source-body:621:src-c8852cf69a7b:paragraph:9408dfd35ee66170:paragraph -->

当我方机动与敌方命中相等时，复纵阵提升回避率5.6%；我方机动等于倍敌方命中时，提升回避率5.2%；我方机动等于倍敌方命中时提升5.1%。
<!-- source-body:622:src-c8852cf69a7b:paragraph:18dbf5ae71e3e4a8:paragraph -->

## .3 加成命中率
<!-- source-body:623:src-c8852cf69a7b:heading:b6bd6c154d1541df:paragraph -->

命中率加成来源主要包括火控雷达类装备、航向buff、特定天赋、旗舰技及角色技能。
<!-- source-body:624:src-c8852cf69a7b:paragraph:14ee86a4e0b6008a:paragraph -->

以下是可增加加成命中率的装备：
<!-- source-body:625:src-c8852cf69a7b:paragraph:788796a94a869a7a:paragraph -->

<div class="docx-table-scroll" data-source-table="src-c8852cf69a7b:table:4526e9b80fc647a8"><table class="docx-table"><thead><tr><th data-grid-column="1" data-source-cell="src-c8852cf69a7b:table:4526e9b80fc647a8:1:1"><!-- docx-cell-media:src-c8852cf69a7b:relation:a805d0a1382dd989 --></th><th data-grid-column="2" data-source-cell="src-c8852cf69a7b:table:4526e9b80fc647a8:1:2"><!-- docx-cell-media:src-c8852cf69a7b:relation:d602c682e7d98530 --></th><th data-grid-column="3" data-source-cell="src-c8852cf69a7b:table:4526e9b80fc647a8:1:3"><!-- docx-cell-media:src-c8852cf69a7b:relation:e62f7dc197873de7 --></th></tr></thead></table></div>
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

## .4 守方回避率
<!-- source-body:632:src-c8852cf69a7b:heading:12b4008448f81f9f:paragraph -->

通常PVE守方回避率为5%，PVP中，提高回避率的手段主要包括技能、旗舰技、天赋和先进型动力系统（详情看守方机动）。高练度玩家展现出的极高闪避率，主要归因于高阶机动装置的列装与卡索敌拿到的“反航”buff。
<!-- source-body:633:src-c8852cf69a7b:paragraph:7ecdf81ed89563bb:paragraph -->

<!-- source-body:634:src-c8852cf69a7b:paragraph:fba904b712346e82:paragraph -->

# 实际核算
<!-- source-body:635:src-c8852cf69a7b:heading:e6988ae5b6b6e090:paragraph -->

本章会给出一个例子，让大家能明白本攻略的作用。
<!-- source-body:636:src-c8852cf69a7b:paragraph:7a0eee43436f5f78:paragraph -->

<!-- source-body:637:src-c8852cf69a7b:paragraph:7146c13f955c9645:paragraph -->

<!-- source-body:638:src-c8852cf69a7b:paragraph:b2ae10ae693fa2a9:paragraph -->

<!-- source-body:639:src-c8852cf69a7b:paragraph:92c53de96cc1b84b:paragraph -->

<!-- source-body:640:src-c8852cf69a7b:paragraph:2ac35379a8541919:paragraph -->

<!-- source-body:641:src-c8852cf69a7b:paragraph:3a234a0b3d54f6f4:paragraph -->

<!-- source-body:642:src-c8852cf69a7b:paragraph:e95fe8b73d78692c:paragraph -->

计算需求数据图示
<!-- source-body:643:src-c8852cf69a7b:paragraph:12280df6c8067c7b:paragraph -->

上述为作者打19-5的某套阵容，对该阵容输出进行核算，可得：
<!-- source-body:644:src-c8852cf69a7b:paragraph:468ce8ef64a67efc:paragraph -->

按秒战斗时长计算（以剩余时间秒为结算节点），岛风在该节点内释放了次通常技，次必杀技；饺子打出了次支援技。同时由于饺子旗舰技效果，敌方的航空伤害减免降低个百分点，因此减伤修正为110%。
<!-- source-body:645:src-c8852cf69a7b:paragraph:979d4f5ee5ef277e:paragraph -->

岛风最终总伤为：通常技默认暴击后为，计算暴击爆伤命中后得出最终伤害为。必杀技默认暴击后为，计算暴击爆伤命中后得出最终伤害为。则总伤为×8+×4=261290.84
<!-- source-body:646:src-c8852cf69a7b:paragraph:85bb2488020b6dfd:paragraph -->

饺子支援技一次暴击后为，进行暴击爆伤命中计算后为，总伤为×6=290083.44
<!-- source-body:647:src-c8852cf69a7b:paragraph:db1122439cb3b796:paragraph -->

加和后队伍总伤为90083.44+261290.84=551374.28
<!-- source-body:648:src-c8852cf69a7b:paragraph:709b0a0fe6fab395:paragraph -->

理论总伤高于19-5的实际血量，因此该阵容在上述假设下具有稳定通关的条件。
<!-- source-body:649:src-c8852cf69a7b:paragraph:dddb6e6ad8b41cbf:paragraph -->

附上关卡部分计算用数据。
<!-- source-body:650:src-c8852cf69a7b:paragraph:c1277c9c967108b8:paragraph -->

<!-- source-body:651:src-c8852cf69a7b:paragraph:c2aae9da636cb400:paragraph -->

表5-1 PVE核算数据
<!-- source-body:652:src-c8852cf69a7b:paragraph:29b00e3b6b90b1f1:paragraph -->

| PVE战备 | 装甲值 | 对空值 | 血量 | 机动值 | 幸运 |
| --- | --- | --- | --- | --- | --- |
| - |  |  |  |  |  |
| - |  |  |  |  |  |
| 20-5/只 |  |  |  |  |  |
<!-- source-body:653:src-c8852cf69a7b:table:33d7a53f2fe3dc25:table -->

<!-- source-body:654:src-c8852cf69a7b:paragraph:08bad6b5be4be266:paragraph -->

# 结语
<!-- source-body:655:src-c8852cf69a7b:heading:0f7c9fe6e4732136:paragraph -->

本文给出了玩家计算拂晓舰灵的伤害计算方法，可减少玩家通过反复实战尝试来判断阵容能否通关所需的时间。此外，建议采用十次实战采样法进行验证：若十次挑战均告失败，可判定该阵容通关概率低于10%，不具备实战稳定性，需及时调整配队策略。
<!-- source-body:656:src-c8852cf69a7b:paragraph:e499a73374eb1087:paragraph -->

同时可配合本攻略参考《练级百科》（来自时雨今天下班没）、《入坑一天行动攻略》（来自时雨今天下班没）、《攻略替换思路》（来自小强之王）、《给萌新的PVE配队思路》（来自小强之王）、《遭遇战攻略》（来自小强之王）、《争锋竞技场简易百科》（来自万理一空）。
<!-- source-body:657:src-c8852cf69a7b:paragraph:964c79f61ea9d352:paragraph -->

在此感谢北冥无成、冬眠、立香、清谧、时雨今天下班没、无星之夜、竹与禾于本攻略撰写期间提供的宝贵建议与数据支持（排名不分先后，按首字母排序）。
<!-- source-body:658:src-c8852cf69a7b:paragraph:814f2c7b6e423d97:paragraph -->

<!-- source-body:659:src-c8852cf69a7b:paragraph:766b2a745b0d9a3e:paragraph -->

作者：小强之王
<!-- source-body:660:src-c8852cf69a7b:paragraph:351ca9879d972931:paragraph -->

本攻略版权归凤栖攻略组所有。
<!-- source-body:661:src-c8852cf69a7b:paragraph:9fd8caddbf990af1:paragraph -->

<!-- source-body:662:src-c8852cf69a7b:paragraph:6bc9028de8d75052:paragraph -->

# 参考文献：
<!-- source-body:663:src-c8852cf69a7b:heading:a2c513aa6d2fc07f:paragraph -->

拂晓wiki.伤害计算公式.拂晓：胜利之刻伤害计算公式Q&amp;A_拂晓：胜利之刻wiki|GameKee
<!-- source-body:664:src-c8852cf69a7b:paragraph:a6e431863b36a907:paragraph -->

拂晓wiki.机库与制空值.拂晓：胜利之刻机库与制空值_拂晓：胜利之刻wiki|GameKee
<!-- source-body:665:src-c8852cf69a7b:paragraph:c92bae221c9c7d26:paragraph -->

拂晓wiki.弹种对甲伤害修正.拂晓：胜利之刻弹种对甲伤害修正_拂晓：胜利之刻wiki|GameKee
<!-- source-body:666:src-c8852cf69a7b:paragraph:b48ef29127940f90:paragraph -->

拂晓wiki.舰灵主副炮装填循环数值表.拂晓：胜利之刻舰灵主副炮装填循环数值表_拂晓：胜利之刻wiki|GameKee
<!-- source-body:667:src-c8852cf69a7b:paragraph:9bbe4172d72c0827:paragraph -->

拂晓wiki.普攻点燃.拂晓：胜利之刻普攻点燃_拂晓：胜利之刻wiki|GameKee
<!-- source-body:668:src-c8852cf69a7b:paragraph:66ee37404043c7e8:paragraph -->

拂晓wiki.穿甲、高爆弹机制.拂晓：胜利之刻穿甲、高爆弹机制_拂晓：胜利之刻wiki|GameKee
<!-- source-body:669:src-c8852cf69a7b:paragraph:dcd60e447c4607a8:paragraph -->

小强之王.拂晓舰灵普攻倍率CD.
<!-- source-body:670:src-c8852cf69a7b:paragraph:89fbe4865e76f09b:paragraph -->

拂晓wiki.舰灵数值和命中暴击.拂晓：胜利之刻舰灵数值和命中暴击_拂晓：胜利之刻wiki|GameKee
<!-- source-body:671:src-c8852cf69a7b:paragraph:788c51adc9b3b54b:paragraph -->

拂晓wiki.幸运值面板计算公式.拂晓：胜利之刻幸运值面板计算公式_拂晓：胜利之刻wiki|GameKee
<!-- source-body:672:src-c8852cf69a7b:paragraph:6263c24ed7daf397:paragraph -->

<!-- source-body:673:src-c8852cf69a7b:paragraph:0dd19352d0ecb5db:paragraph -->

## Quarantine Review Items

- drawings: 222 - Drawing and floating layout content was counted but not converted into publishable Markdown.
- media: 223 - Embedded media files remain in the DOCX package and require permission and placement review.
- footnotes: 0 - Footnote part was detected and must be manually reconciled against the rendered document.
- formulas: 24 - Office math objects were detected and require manual conversion review.

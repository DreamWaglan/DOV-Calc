# 阶段 0 治理与基线

本目录保存《拂晓手册》Wiki 的来源、许可、责任、术语、永久 ID/URL 和版本基线。这里的登记不等于取得公开发布授权。

## 交付物

- `source-assets.json`：29 个整合资料文件的哈希、来源别名、责任角色、许可与公开阻断状态。
- `version-baselines.json`：现有结构化数据与资料版本的基线及漂移发现。
- `source-policy.md`：来源 A—D 分级和许可规则。
- `roles-and-review.md`：角色、RACI、待指派和签核规则。
- `terminology.md`：内容、版本、来源、数据和审核术语。
- `url-and-id-policy.md`：永久 ID、URL、alias、redirect 和 canonical 规则。

配套 Schema 位于 `content/schemas/`，工具黄金基线位于 `tests/fixtures/`。

## 重新生成

在 PowerShell 中登记整合资料：

```powershell
node scripts/content/build-source-inventory.mjs "F:\Visual Studio Project\Project_Test\拂晓手册"
```

其余仓库内基线：

```powershell
pnpm baseline:equipment
pnpm baseline:damage
pnpm baseline:versions
pnpm validate:stage0
```

`source-assets.json` 顶层的 `sourceRoot.path` 只用于本地重新生成。单项资产和页面不得复制该绝对路径；引用时使用 `sourceRoot.alias` 与相对路径。

## 当前阻断状态

- 所有整合资料当前许可均为 `pending`，公开正文、附件、搜索索引和站点地图均为阻断状态。
- 具体人员尚未确定时使用“待指派”，但每项资产已经绑定内容保管、版权/来源和事实审核责任角色。
- 装备一图流版本为 `20260712`，现有装备 JSON 版本为 `20260511`。该漂移在复核前阻断“最新装备数据”声明，不阻断无关原创内容和工具维护。

## 阶段退出检查

阶段 0 只有在以下检查全部通过后完成：

1. 资产台账恰好包含 29 项，ID 和 SHA-256 均唯一有效。
2. `pending`、`restricted` 资产没有任何公开放行位。
3. 页面、数据记录和源资产 Schema 可以解析，永久 ID/URL 规则有文档。
4. 装备基线记录数、主键、图片和版本均已取证。
5. 伤害计算器至少具有五个可复算黄金用例，并记录现有 localStorage 契约。
6. `pnpm validate:stage0` 通过。

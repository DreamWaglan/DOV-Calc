# 全量迁移总账

`full-content-map.json` 是 29 个授权源资产进入 Wiki 的元素级迁移账本。它不等同于“已经发布”：授权状态、迁移处置和页面审核是三个独立维度。

## 生成与验证

```powershell
pnpm content:import-corpus
pnpm content:full-map
pnpm validate:full-map
pnpm test:imports
```

全量导入会读取 `content/governance/source-assets.json`，校验源文件哈希与授权决定，再生成 DOCX、XLSX 和图片检查产物。重复执行必须保持字节稳定。

## 账本约定

- `sourceElementId` 由源资产 ID、元素类型和结构位置确定。
- `disposition` 只能是 `published`、`merged`、`internal-only` 或 `omitted-with-rationale`。
- `authorized` 只表示授权证据有效，不表示内容已经通过编辑或事实审核。
- `publishable: false` 表示导入产物仍在迁移审核区，不会绕过页面状态和公开出口门禁。
- DOCX 的 `drawingRelations` 单独记录 OOXML 绘图包装节点与真实媒体文件的关系，不能把 drawing 数量当作图片数量。

阶段 2 只完成来源登记、确定性导入和目标映射。页面正文审核、公式复算、表格适配、图片 alt/caption 与响应式派生分别在后续阶段完成。

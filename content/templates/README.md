# Wiki 页面模板

模板用于新建页面时复制，不参与公开构建。复制后必须替换示例 ID、日期、责任人、来源和相关页面。`docs/.vitepress/navigation.mts` 会从页面 Frontmatter 自动生成导航、侧边栏和相关页面索引，无需再次手工登记。

- `home.md`：首页。
- `section.md`：章节索引页。
- `guide.md`：指南页。
- `mechanism.md`：机制页。
- `data-page.md`：数据页。
- `topic.md`：专题聚合页。
- `site.md`：站务与维护规则页。

所有模板都遵循 `content/schemas/page.schema.json`，来源许可仍以 `content/governance/source-policy.md` 为准。

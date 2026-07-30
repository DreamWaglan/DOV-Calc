---
id: about-release-checklist
title: 发布清单
description: 规定 Wiki 候选发布、正式标签、GitHub Pages 上线检查和失败处置的完整门禁。
section: about
order: 860
audience: [maintainer]
contentType: site
gameVersion: "2026-07"
sourceUpdatedAt: "2026-07-29"
verifiedAt: "2026-07-30"
status: current
authors:
  - name: DOV-Calc 维护组
    role: 发布流程
reviewers:
  - name: DOV-Calc 编辑审核组
    role: 发布审核
sources:
  - title: DOV-Calc 站点维护记录
    assetId: site-maintenance-record
    sourceType: internal
    permission: owned
    publicUse:
      body: true
      asset: false
tags: [发布, GitHub Pages, 标签, SHA256]
related: [about-maintenance, about-rollback, about-version-log]
---

# 发布清单

候选版本为 `wiki-v1.1.4`，上一已知良好版本为 `wiki-v1.0.0`。`wiki-v1.1.0`、`wiki-v1.1.1`、`wiki-v1.1.2` 与 `wiki-v1.1.3` 保留为未部署成功的历史候选标签，不得移动或覆盖。仓库处于整合阶段时，发布清单必须显示 `WORKTREE / candidate`。只有源代码进入干净提交、不可变新标签指向该提交，并且上线后检查通过，维护人员才能把该版本登记为线上已验证发布。

## 一、候选发布门禁

- [ ] `pnpm test` 通过；
- [ ] `pnpm docs:build` 通过；
- [ ] 内容 Schema、来源、许可、链接和版本漂移报告没有失败项；
- [ ] 待授权正文、表格和图片没有进入公开构建；
- [ ] 中文搜索样本达到约定命中率；
- [ ] 360 像素宽度下没有页面级横向滚动；
- [ ] 键盘操作、可见焦点、标题层级和表单标签通过检查；
- [ ] 性能预算、canonical、描述、站点地图和 404 页面通过检查；
- [ ] 版本日志说明本次用户可感知的变化；
- [ ] 回滚目标、执行人和故障沟通渠道已经确认。

## 二、生成候选发布记录

先构建站点，再生成和校验清单：

```powershell
pnpm test
pnpm docs:build
pnpm test:base
pnpm test:search-built
pnpm test:e2e
pnpm test:perf
pnpm validate:stage8
pnpm validate:architecture
node scripts/release/create-release-manifest.mjs
node scripts/release/validate-release-manifest.mjs
node scripts/release/verify-rollback.mjs
pnpm validate:stage5
```

`content/release/release-manifest.json` 记录以下内容：

- 候选版本与标签；
- 当前 HEAD、提交标题、工作树状态和变更项；
- 版本日志与内容状态报告的 SHA256；
- `docs/.vitepress/dist` 中每个文件的路径、大小和 SHA256；
- 产物聚合哈希；
- 回滚目标策略和验证命令。

`docs/.vitepress/dist`、`content/reports`、发布清单和回滚演练报告属于生成型产物。脚本会在完整工作树状态之外，单独计算排除这些文件后的 `releaseWorkspaceState`。目录规则必须以 `/` 结尾，并按相对路径前缀匹配。该字段只能用于排除可重复生成的产物，不能掩盖其他未提交的源代码或内容变更。

`stage5-release-readiness.json` 会读取发布清单并汇总 AC-01 至 AC-15，因此不进入发布清单的内容报告哈希集合。该排除项必须由清单显式记录。搜索、E2E、Lighthouse、SEO、过期内容和移动端静态检查等原始报告仍必须全部登记并校验。

发布内容再次变化后，旧清单即失效。维护人员必须重新构建、重新生成清单并重跑回滚演练。

## 三、提交与正式标签

1. 审核即将进入发布提交的文件，不提交临时目录、调试输出或凭据。
2. 创建发布提交，并确认 `git status --short` 没有源代码或内容变更。
3. 在该提交上创建附注标签 `wiki-v1.1.4`。不得移动或覆盖 `wiki-v1.0.0` 与失败候选标签 `wiki-v1.1.0`、`wiki-v1.1.1`、`wiki-v1.1.2`、`wiki-v1.1.3`。
4. 重新生成发布清单。
5. 运行严格校验：

```powershell
pnpm validate:stage5 -- --require-tagged
node scripts/release/validate-release-manifest.mjs --require-tagged
```

严格校验必须确认标签存在并指向当前 HEAD。候选清单中的 `deploymentState: not-verified` 只表示尚未验证线上状态，不能作为部署成功证据。

`tagged` 是源码、构建产物和标签一致性的状态，不是线上发布状态。只有 GitHub Pages 部署完成并保存本节所列上线检查结果后，维护人员才能把版本登记为“线上已验证”。

## 四、GitHub Pages 上线后检查

发布工作流完成后，应直接访问线上站点执行下列检查：

- [ ] 首页返回成功且标题、导航和搜索可用；
- [ ] 计算器与装备速查的客户端交互可用；
- [ ] “争夺竞技”等深层页面可以通过其线上完整地址直接打开；
- [ ] 不存在由本次发布引入的 404；
- [ ] 404 页面能够返回站点入口；
- [ ] 页面 canonical 使用线上域名与站点配置的基路径；
- [ ] `sitemap.xml` 包含公开页面，且不包含草稿专用或隔离资产路径；
- [ ] 线上 HTML、关键静态资源与发布产物清单一致；
- [ ] GitHub Pages 对应提交、标签和发布清单中的提交一致。

维护人员应使用部署工作流返回的提交和运行记录执行线上校验：

```powershell
pnpm release:deploy:verify -- `
  --url "$env:DOCS_PRODUCTION_URL" `
  --deployed-commit "<GitHub Actions head SHA>" `
  --workflow-run-id "<GitHub Actions run ID>" `
  --workflow-url "<GitHub Actions run URL>"
node scripts/release/validate-release-manifest.mjs --require-deployed
pnpm validate:stage5 -- --require-deployed
```

校验程序会逐项复核线上 HTML、JavaScript、CSS、XML、SVG 和 JSON 关键产物的大小与 SHA256，并使用无头浏览器检查搜索、三个工具页面、深层页面和 404 导航。校验通过后，程序将生成 `deployment-verification.json`，并把发布清单的 `deploymentState` 更新为 `verified`。

GitHub Actions 的 `verify-deployment` 作业执行相同门禁并保存验证产物。若任一关键检查失败，工作流必须保持失败状态，维护人员应停止推广链接，并按[回滚流程](./rollback)处理。

## 五、完成条件

正式发布记录必须同时具备标签、提交、构建产物清单、内容状态报告、版本日志、上线检查和回滚演练。缺少任一项时，版本仍是候选状态。

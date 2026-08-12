import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import {
  PUBLIC_RELEASE_FIELDS,
  derivePublicRelease,
} from './lib/authorization-policy.mjs'

const inventoryPath = 'content/governance/source-assets.json'
const evidencePath =
  'content/governance/authorization-evidence/index.json'
const evidenceId = 'auth-user-declaration-20260730'
const internalOnlyIds = new Set([
  'src-90f788a9def4',
  'src-6d7a8eecd6bb',
])

function scopeFor(asset) {
  if (internalOnlyIds.has(asset.id)) {
    return Object.fromEntries(
      PUBLIC_RELEASE_FIELDS.map((field) => [field, false]),
    )
  }
  if (asset.assetType === 'image') {
    return {
      body: false,
      asset: true,
      searchIndex: true,
      sitemap: true,
      download: true,
      derivative: true,
      structuredData: false,
    }
  }
  return {
    body: true,
    asset: false,
    searchIndex: true,
    sitemap: true,
    download: false,
    derivative: true,
    structuredData: true,
  }
}

function deniedScopesFor(asset) {
  if (internalOnlyIds.has(asset.id)) return [...PUBLIC_RELEASE_FIELDS]
  if (asset.assetType === 'image') return ['body', 'structuredData']
  return ['asset', 'download']
}

function restrictionsFor(asset) {
  if (internalOnlyIds.has(asset.id)) {
    return [
      '该文件是项目治理或写作模板，只用于内部维护，不进入公开正文或下载。',
      '如需公开模板，必须另行建立公开版本和独立审核记录。',
    ]
  }
  return [
    '不提供原始 DOCX 或 XLSX 文件下载；独立图片和 DOCX 内嵌媒体可按 Wiki 上下文查看和下载。',
    '不提供脱离 Wiki 上下文的素材包、镜像包或批量再分发。',
    '作者姓名、授权期限或署名要求未在现有资料中提供时不得虚构。',
  ]
}

const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'))
const evidenceRegistry = JSON.parse(await readFile(evidencePath, 'utf8'))
const evidence = evidenceRegistry.evidence.find(
  (entry) => entry.id === evidenceId,
)
if (!evidence) throw new Error(`Missing authorization evidence ${evidenceId}`)

const covered = new Set(evidence.appliesToAssetIds)
if (inventory.assets.some((asset) => !covered.has(asset.id))) {
  throw new Error('Authorization evidence does not cover every source asset')
}

inventory.authorizationUpdatedAt = '2026-07-30T00:00:00.000Z'
inventory.governanceDefaults = {
  permission: 'pending',
  publicRelease: false,
  rule:
    '新资产默认不公开；本台账已登记资产必须由 permission、authorization.scope 与 deniedScopes 的单一策略函数派生公开出口。',
}

inventory.assets = inventory.assets.map((asset) => {
  const scope = scopeFor(asset)
  const authorization = {
    evidenceId,
    rightsHolder:
      '各资料原作者或权利人；由项目资料提供方确认已经授权',
    grantedBy: '项目资料提供方（用户，身份未公开）',
    grantedAt: '2026-07-30',
    evidencePath:
      'content/governance/authorization-evidence/user-declaration-20260730.md',
    attribution:
      '按原文件标题和来源资产 ID 标注；原作者姓名未提供时不得虚构。',
    expiresAt: null,
    restrictions: restrictionsFor(asset),
    deniedScopes: deniedScopesFor(asset),
    scope,
  }
  const updated = {
    ...asset,
    permission: 'authorized',
    status: 'approved',
    owners: [
      {
        name: '拂晓凤栖攻略组',
        role: '内容保管责任角色',
      },
    ],
    reviewers: [
      {
        name: 'DOV-Calc 版权与来源维护组',
        role: '版权/来源责任人',
      },
      {
        name: '暂无',
        role: '事实审核人',
      },
      {
        name: 'DOV-Calc 发布维护组',
        role: '公开范围审核人',
      },
    ],
    authorization,
  }
  return {
    ...updated,
    publicRelease: derivePublicRelease(updated).publicRelease,
    notes: internalOnlyIds.has(asset.id)
      ? '授权证据已登记；该文件按内部治理/模板处置，不进入公开构建。'
      : '授权证据和逐出口范围已登记；独立图片与 DOCX 内嵌媒体原始字节可在 Wiki 上下文中公开。',
  }
})

const serialized = `${JSON.stringify(inventory, null, 2)}\n`
if (process.argv.includes('--write')) {
  await writeFile(inventoryPath, serialized, 'utf8')
  console.log(`Updated ${inventory.assets.length} authorization entries.`)
} else {
  const existing = await readFile(inventoryPath, 'utf8')
  if (existing !== serialized) {
    console.error(
      'Authorization ledger is out of date. Run this script with --write.',
    )
    process.exitCode = 1
  } else {
    console.log(`Authorization ledger is current (${inventory.assets.length}).`)
  }
}

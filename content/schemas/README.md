# Content Schemas

This directory contains JSON Schema 2020-12 contracts for the Fuxiao Wiki content governance baseline.

## Files

- `page.schema.json`: Markdown frontmatter for publishable pages.
- `data-record.schema.json`: Versioned structured data records used by data pages and tools.
- `source-asset.schema.json`: Source asset ledger entries for DOCX, XLSX, images, external posts, datasets, and derived assets.
- `authorization-evidence.schema.json`: Authorization evidence records that bind a declaration or document to explicit public-release scope.
- `full-content-map.schema.json`: Element-level migration ledger for all authorized DOCX, XLSX, and image sources.
- `redirects.schema.json`: URL history, alias, split-anchor, noindex, search, and sitemap policy.

The full migration ledger is generated at `content/migrations/full-content-map.json` and validated by `pnpm validate:full-map`.

## Required Fields

Page frontmatter requires:

- `id`, `title`, `description`, `section`, `order`
- `audience`, `contentType`
- `gameVersion`, `sourceUpdatedAt`, `verifiedAt`, `status`
- `authors`, `reviewers`, `sources`
- `tags`, `related`

Data records require:

- `id`, `name`, `category`, `values`
- `applicableVersion`, `verifiedAt`, `sourceRefs`, `status`

Source asset ledger entries require:

- `id`, `title`, `assetType`, `origin`
- `permission`, `status`, `owners`, `reviewers`, `hashes`, `publicRelease`
- `owned`、`authorized` 与 `quoted` 还必须登记 `authorization`；七类 scope 不允许省略

## Enumerations

Page `status`:

- `draft`
- `current`
- `stale`
- `archived`

Data record `status`:

- `current`
- `stale`
- `archived`

Source permission:

- `owned`
- `authorized`
- `quoted`
- `pending`
- `restricted`

Public release mode:

- `public`
- `quote-only`
- `external-link-only`
- `blocked`

## Public License Rules

The release policy is conservative by default:

- `owned` and `authorized` can be published when the ledger records the owner or authorization evidence.
- `quoted` can publish only necessary short quotes or original analysis; source assets are not public assets.
- `pending` cannot publish copied body text or source assets. It may be represented by an external link or blocked.
- `restricted` cannot enter public HTML, assets, search index, sitemap, download packages, or social share output.

The schemas expose these decisions through `permission`, `authorization.scope`, `publicUse`, and `publicRelease`. The build gates call the same authorization policy function and fail public output if any page, data record, or asset exceeds its registered scope, depends on invalid evidence, or exposes `pending`, `restricted`, or an unregistered third-party asset.

## ID And URL Constraints

- IDs use lowercase URL-safe slugs: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Page IDs and data record IDs must remain stable after publication.
- Schema validation checks ID shape only. Repository-wide uniqueness must be enforced by the future `content:schema` check.
- External links use JSON Schema `format: uri`.
- Asset `origin.path` must be relative to the repository root or the declared `origin.sourceRootAlias`. Absolute paths and parent traversal are rejected. The inventory wrapper may map a source-root alias to a local absolute path for regeneration, but page frontmatter and individual asset entries must not copy that machine path.
- `gameVersion` and dataset versions use `YYYY-MM` with an optional lowercase suffix, for example `2026-07` or `2026-07-hotfix`.
- Dates use ISO `YYYY-MM-DD`; import timestamps use ISO date-time.

## Validation

These files are plain JSON Schema 2020-12. Example validation with Ajv:

```bash
pnpm exec ajv validate --spec=draft2020 -s content/schemas/page.schema.json -d path/to/frontmatter.json
pnpm exec ajv validate --spec=draft2020 -s content/schemas/data-record.schema.json -d path/to/data-record.json
pnpm exec ajv validate --spec=draft2020 -s content/schemas/source-asset.schema.json -d path/to/source-asset.json
```

Cross-file checks are implemented by the content gates. `validate-authorization.mjs` verifies evidence and the five-state/seven-output matrix; `validate-provenance.mjs` checks page/import use; `scan-public-artifacts.mjs` scans public and built output. Duplicate IDs, dangling references and route constraints remain covered by the other content validators.

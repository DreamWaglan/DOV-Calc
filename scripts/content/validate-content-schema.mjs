import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  loadPages,
  printResult,
  readJson,
  root,
  writeReport,
} from './lib/content-utils.mjs'

const failures = []
const pages = await loadPages().catch((error) => {
  failures.push(error.message)
  return []
})

const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const pageSchema = await readJson('content/schemas/page.schema.json')
const dataSchema = await readJson('content/schemas/data-record.schema.json')
const validatePage = ajv.compile(pageSchema)
const validateRecord = ajv.compile(dataSchema)

for (const page of pages) {
  if (!validatePage(page.frontmatter)) {
    for (const error of validatePage.errors ?? []) {
      failures.push(
        `${page.filePath}${error.instancePath || '/'} ${error.message}`,
      )
    }
  }
}

for (const [field, values] of [
  ['id', pages.map((page) => page.frontmatter.id)],
  ['route', pages.map((page) => page.route)],
]) {
  const duplicates = values.filter(
    (value, index) => values.indexOf(value) !== index,
  )
  for (const duplicate of new Set(duplicates)) {
    failures.push(`duplicate ${field}: ${duplicate}`)
  }
}

const pageIds = new Set(pages.map((page) => page.frontmatter.id))
for (const page of pages) {
  for (const relatedId of page.frontmatter.related ?? []) {
    if (!pageIds.has(relatedId)) {
      failures.push(`${page.filePath}: related id not found: ${relatedId}`)
    }
    if (relatedId === page.frontmatter.id) {
      failures.push(`${page.filePath}: page cannot relate to itself`)
    }
  }
}

const dataCollections = [
  'content/imports/xlsx/basic-attack/records.json',
].filter(async () => true)
let recordCount = 0
for (const relativePath of dataCollections) {
  const absolutePath = path.join(root, relativePath)
  const source = await readFile(absolutePath, 'utf8').catch(() => null)
  if (!source) continue
  const collection = JSON.parse(source)
  const recordIds = new Set()
  for (const record of collection.records ?? []) {
    recordCount += 1
    if (!validateRecord(record)) {
      for (const error of validateRecord.errors ?? []) {
        failures.push(
          `${relativePath}:${record.id ?? '(missing id)'}${error.instancePath || '/'} ${error.message}`,
        )
      }
    }
    if (recordIds.has(record.id)) {
      failures.push(`${relativePath}: duplicate record id ${record.id}`)
    }
    recordIds.add(record.id)
  }
}

const navigationSource = await readFile(
  path.join(root, 'docs/.vitepress/navigation.mts'),
  'utf8',
)
if (
  !navigationSource.includes('listMarkdown(docsRoot)') ||
  !navigationSource.includes('parseFrontmatter')
) {
  failures.push(
    'docs/.vitepress/navigation.mts: navigation is not derived from page frontmatter',
  )
}

const report = {
  schemaVersion: 1,
  check: 'content-schema',
  summary: {
    pages: pages.length,
    uniquePageIds: pageIds.size,
    routes: new Set(pages.map((page) => page.route)).size,
    dataRecords: recordCount,
    failures: failures.length,
  },
  pages: pages.map((page) => ({
    file: page.filePath,
    id: page.frontmatter.id,
    route: page.route,
    status: page.frontmatter.status,
  })),
  failures,
}
const reportPath = await writeReport('content-schema', report)
printResult('Content schema validation', failures, reportPath)

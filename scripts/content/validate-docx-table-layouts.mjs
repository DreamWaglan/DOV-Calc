import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  printResult,
  relative,
  root,
  writeReport,
} from './lib/content-utils.mjs'

function attributesOf(tag) {
  const attributes = new Map()
  for (const match of tag.matchAll(/([:\w-]+)="([^"]*)"/g)) {
    attributes.set(match[1], match[2])
  }
  return attributes
}

function positiveInteger(value, fallback = 1) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function firstAvailableRun(activeUntil, cursor, span, rowIndex) {
  let candidate = cursor
  while (true) {
    const blocked = Array.from({ length: span }, (_, offset) => candidate + offset).some(
      (column) => (activeUntil[column] ?? 0) >= rowIndex,
    )
    if (!blocked) return candidate
    candidate += 1
  }
}

function auditRowGroup(table, group, failures) {
  const activeUntil = []
  for (let rowOffset = 0; rowOffset < group.rows.length; rowOffset += 1) {
    const rowIndex = rowOffset + 1
    let cursor = 1
    for (const cell of group.rows[rowOffset].cells) {
      const column = firstAvailableRun(activeUntil, cursor, cell.colspan, rowIndex)
      const expectedColumn = cell.gridColumn ?? cell.placeholderStart
      const expectedEndColumn =
        expectedColumn === null ? null : expectedColumn + cell.colspan - 1
      if (
        expectedEndColumn !== null &&
        (expectedColumn < 1 || expectedEndColumn > table.gridColumns)
      ) {
        failures.push(
          `${table.filePath}:${table.sourceTable}: row ${table.rowNumberByRow.get(
            group.rows[rowOffset],
          )} ${cell.kind} occupies columns ${expectedColumn}-${expectedEndColumn} outside 1-${table.gridColumns}`,
        )
      }
      if (expectedColumn !== null && column !== expectedColumn) {
        failures.push(
          `${table.filePath}:${table.sourceTable}: row ${table.rowNumberByRow.get(
            group.rows[rowOffset],
          )} places ${cell.kind} at browser column ${column}, expected source column ${expectedColumn}`,
        )
      }
      const rowEnd = rowIndex + cell.rowspan - 1
      if (rowEnd > group.rows.length) {
        failures.push(
          `${table.filePath}:${table.sourceTable}: rowspan ${cell.rowspan} crosses the ${group.name} row-group boundary at row ${table.rowNumberByRow.get(
            group.rows[rowOffset],
          )}`,
        )
      }
      for (let offset = 0; offset < cell.colspan; offset += 1) {
        activeUntil[column + offset] = Math.max(
          activeUntil[column + offset] ?? 0,
          rowEnd,
        )
      }
      cursor = column + cell.colspan
    }
  }
}

export function auditDocxTableHtml(markdown, filePath = '<memory>') {
  const failures = []
  const completedTables = []
  const tableStack = []
  const tokens = markdown.match(
    /<\/?(?:table|thead|tbody|tr|th|td)\b[^>]*>/gi,
  ) ?? []

  for (const token of tokens) {
    const closing = token.startsWith('</')
    const tagName = token.match(/^<\/?([a-z]+)/i)?.[1]?.toLowerCase()
    if (!tagName) continue

    if (tagName === 'table' && !closing) {
      const attributes = attributesOf(token)
      const classes = (attributes.get('class') ?? '').split(/\s+/)
      tableStack.push({
        filePath,
        sourceTable: attributes.get('data-source-table') ?? '<missing-source-table>',
        isDocxTable: classes.includes('docx-table'),
        gridColumns: positiveInteger(attributes.get('data-grid-columns'), null),
        groups: [],
        currentGroup: null,
        currentRow: null,
        rowNumberByRow: new Map(),
        rowCount: 0,
      })
      continue
    }

    const table = tableStack.at(-1)
    if (!table) continue

    if (tagName === 'table' && closing) {
      tableStack.pop()
      if (table.isDocxTable) {
        if (table.sourceTable === '<missing-source-table>') {
          failures.push(`${table.filePath}: DOCX table is missing data-source-table`)
        }
        if (table.gridColumns === null) {
          failures.push(
            `${table.filePath}:${table.sourceTable}: DOCX table is missing a valid data-grid-columns value`,
          )
        }
        for (const group of table.groups) auditRowGroup(table, group, failures)
        completedTables.push(table)
      }
      continue
    }
    if (!table.isDocxTable) continue

    if ((tagName === 'thead' || tagName === 'tbody') && !closing) {
      const group = { name: tagName, rows: [] }
      table.groups.push(group)
      table.currentGroup = group
      continue
    }
    if ((tagName === 'thead' || tagName === 'tbody') && closing) {
      table.currentGroup = null
      continue
    }
    if (tagName === 'tr' && !closing) {
      const group = table.currentGroup ?? { name: 'implicit', rows: [] }
      if (!table.currentGroup) {
        table.groups.push(group)
        table.currentGroup = group
      }
      const row = { cells: [] }
      group.rows.push(row)
      table.rowCount += 1
      table.rowNumberByRow.set(row, table.rowCount)
      table.currentRow = row
      continue
    }
    if (tagName === 'tr' && closing) {
      table.currentRow = null
      continue
    }
    if ((tagName === 'th' || tagName === 'td') && !closing && table.currentRow) {
      const attributes = attributesOf(token)
      const gridColumn = attributes.has('data-grid-column')
        ? positiveInteger(attributes.get('data-grid-column'), null)
        : null
      const placeholderStart = attributes.has('data-grid-placeholder-start')
        ? positiveInteger(attributes.get('data-grid-placeholder-start'), null)
        : null
      table.currentRow.cells.push({
        kind: placeholderStart === null ? 'source cell' : 'structural placeholder',
        gridColumn,
        placeholderStart,
        colspan: positiveInteger(attributes.get('colspan')),
        rowspan: positiveInteger(attributes.get('rowspan')),
      })
    }
  }

  if (tableStack.length > 0) {
    failures.push(`${filePath}: contains ${tableStack.length} unclosed table element(s)`)
  }
  return { failures, tableCount: completedTables.length }
}

async function main() {
  const corpusReport = JSON.parse(
    await readFile(path.join(root, 'content', 'reports', 'docx-import.json'), 'utf8'),
  )
  const markdownFiles = new Set()
  for (const asset of corpusReport.assets ?? []) {
    const reportFile = path.join(root, asset.outputs?.report?.path ?? '')
    const report = JSON.parse(await readFile(reportFile, 'utf8'))
    if (report.publicRelease?.body !== true) continue
    const markdownPath = report.outputs?.markdown?.path
    if (markdownPath) markdownFiles.add(path.join(root, markdownPath))
  }

  const failures = []
  let tableCount = 0
  for (const markdownFile of [...markdownFiles].sort()) {
    const audit = auditDocxTableHtml(
      await readFile(markdownFile, 'utf8'),
      relative(markdownFile),
    )
    failures.push(...audit.failures)
    tableCount += audit.tableCount
  }

  const reportPath = await writeReport('docx-table-layouts', {
    schemaVersion: 1,
    publicDocxMarkdownFiles: markdownFiles.size,
    tableCount,
    failureCount: failures.length,
    failures,
  })
  printResult('DOCX table layout validation', failures, reportPath)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main()
}

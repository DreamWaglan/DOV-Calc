import assert from 'node:assert/strict'
import {
  collectBody,
  collectTableCellLayouts,
  parseWordprocessingXml,
  renderHtmlTable,
} from '../../scripts/content/import-docx.mjs'
import { auditDocxTableHtml } from '../../scripts/content/validate-docx-table-layouts.mjs'

const fixtureXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <w:body>
    <w:tbl>
      <w:tr>
        <w:tc>
          <w:tcPr><w:gridSpan w:val="2"/><w:vMerge w:val="restart"/></w:tcPr>
          <w:p>
            <w:r><w:t>前</w:t><w:drawing><wp:inline><wp:extent cx="914400" cy="457200"/><a:blip r:embed="rId1"/></wp:inline></w:drawing></w:r>
            <w:r><w:br/><w:drawing><wp:inline><wp:extent cx="457200" cy="457200"/><a:blip r:embed="rId2"/></wp:inline></w:drawing><w:t>后</w:t></w:r>
          </w:p>
          <w:tbl>
            <w:tr><w:tc><w:p><w:r><w:drawing><wp:inline><a:blip r:embed="rId3"/></wp:inline></w:drawing></w:r></w:p></w:tc></w:tr>
          </w:tbl>
        </w:tc>
        <w:tc><w:p><w:r><w:t>普通单元格</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:tcPr><w:gridSpan w:val="2"/><w:vMerge/></w:tcPr><w:p/></w:tc>
        <w:tc><w:p><w:r><w:t>第二行</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p><w:r><w:drawing><wp:anchor><a:blip r:embed="rId4"/></wp:anchor></w:drawing></w:r></w:p>
  </w:body>
</w:document>`

function serializableLayout() {
  const documentXml = parseWordprocessingXml(fixtureXml)
  const bodyItems = collectBody(documentXml)
  const { tables, drawingContexts } = collectTableCellLayouts({
    assetId: 'src-aaaaaaaaaaaa',
    bodyItems,
  })
  return {
    tables: tables.map((table) => ({
      tableIndex: table.tableIndex,
      sourceElementId: table.sourceElementId,
      bodyIndex: table.bodyIndex,
      rowCount: table.rowCount,
      columnCount: table.columnCount,
      rows: table.rows.map((row) =>
        row.cells.map(({ node, ...cell }) => cell),
      ),
    })),
    drawings: drawingContexts.map(({ drawing, cell, cellPath, ...order }) => ({
      cell: { ...cell, node: undefined },
      cellPath: cellPath.map(({ node, ...entry }) => entry),
      ...order,
    })),
  }
}

const first = serializableLayout()
const second = serializableLayout()
assert.deepEqual(second, first, 'table-cell placement extraction must be deterministic')
assert.equal(first.tables.length, 2, 'nested tables must receive distinct table identities')
assert.equal(first.tables[0].rowCount, 2)
assert.equal(first.tables[0].columnCount, 3)
assert.equal(first.tables[0].rows[0][0].gridColumn, 1)
assert.equal(first.tables[0].rows[0][0].gridSpan, 2)
assert.equal(first.tables[0].rows[0][0].verticalMerge, 'restart')
assert.equal(first.tables[0].rows[0][0].rowSpan, 2)
assert.equal(first.tables[0].rows[1][0].verticalMerge, 'continue')
assert.equal(first.tables[0].rows[1][0].rowSpan, 0)

assert.equal(first.drawings.length, 3, 'non-cell floating drawings must not receive cell placement')
assert.equal(first.drawings[0].drawingIndexInCell, 1)
assert.equal(first.drawings[0].paragraphIndex, 1)
assert.equal(first.drawings[0].runIndex, 1)
assert.equal(first.drawings[1].drawingIndexInCell, 2)
assert.equal(first.drawings[1].runIndex, 2)
assert.ok(
  first.drawings[0].cellContentOrdinal < first.drawings[1].cellContentOrdinal,
  'multiple drawings must preserve source content order',
)
assert.equal(first.drawings[2].cellPath.length, 2, 'nested drawings need a full cell path')
assert.equal(first.drawings[2].cellPath[0].tableIndex, 1)
assert.equal(first.drawings[2].cellPath[1].tableIndex, 2)

const alignmentFixtureXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:tbl>
      <w:tblGrid>
        <w:gridCol/><w:gridCol/><w:gridCol/><w:gridCol/><w:gridCol/>
      </w:tblGrid>
      <w:tr>
        <w:tc><w:tcPr><w:vMerge w:val="restart"/></w:tcPr><w:p><w:r><w:t>纵向表头</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>第一列</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:gridSpan w:val="2"/></w:tcPr><w:p><w:r><w:t>跨两列</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>末列</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:tcPr><w:vMerge/></w:tcPr><w:p/></w:tc>
        <w:tc><w:p><w:r><w:t>第二行</w:t></w:r></w:p></w:tc>
        <w:tc><w:tcPr><w:gridSpan w:val="2"/></w:tcPr><w:p><w:r><w:t>尾部合并</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>第二行末列</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:trPr><w:gridBefore w:val="2"/></w:trPr>
        <w:tc><w:tcPr><w:gridSpan w:val="2"/></w:tcPr><w:p><w:r><w:t>偏移内容</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>第三行末列</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`

const alignmentDocument = parseWordprocessingXml(alignmentFixtureXml)
const alignmentBody = collectBody(alignmentDocument)
const alignmentLayouts = collectTableCellLayouts({
  assetId: 'src-bbbbbbbbbbbb',
  bodyItems: alignmentBody,
})
const alignmentHtml = renderHtmlTable(
  alignmentLayouts.tables[0].node,
  alignmentLayouts.tableLayoutByNode,
  new WeakMap(),
)

assert.doesNotMatch(
  alignmentHtml,
  /<thead>/,
  'a first-row rowspan must not cross thead/tbody row-group boundaries',
)
assert.match(
  alignmentHtml,
  /data-grid-placeholder-start="1"/,
  'gridBefore gaps not covered by an active rowspan need structural placeholders',
)
assert.doesNotMatch(
  alignmentHtml,
  /aria-hidden="true"/,
  'structural placeholders must remain in the accessible table grid',
)
assert.match(
  alignmentHtml,
  /class="docx-table-scroll"[^>]*tabindex="0"[^>]*role="region"[^>]*aria-label=/,
  'the local scroll container must be keyboard-focusable and labelled',
)
assert.equal(
  alignmentHtml.match(/data-grid-placeholder-start="1"/g)?.length,
  1,
  'active rowspans must not receive duplicate placeholder cells',
)
assert.deepEqual(
  auditDocxTableHtml(alignmentHtml).failures,
  [],
  'rendered rows must land on their declared Word grid columns',
)

console.log('docx-table-cell-placement tests passed.')

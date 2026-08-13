import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const docsRoot = path.resolve('docs')
const nonProseMarker = '<!-- article-paragraph:non-prose -->'
const knownSectionCues = new Set([
  '当前状态：',
  '已知限制：',
  '现阶段不允许：',
  '站点继续采用以下边界：',
])
const failures = []

for (const filePath of await markdownFiles(docsRoot)) {
  const lines = (await readFile(filePath, 'utf8')).split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const value = lines[index].trim()
    const requiresNonProseMarker =
      /^https?:\/\/\S+$/.test(value) ||
      /^(?:作者|原作者|制作组)[：:]/.test(value) ||
      knownSectionCues.has(value)
    if (!requiresNonProseMarker) continue

    let previousIndex = index - 1
    while (previousIndex >= 0 && lines[previousIndex].trim() === '') {
      previousIndex -= 1
    }
    if (lines[previousIndex]?.trim() !== nonProseMarker) {
      failures.push(
        `${path.relative(process.cwd(), filePath)}:${index + 1}: ${value}`,
      )
    }
  }
}

assert.deepEqual(
  failures,
  [],
  `Non-prose authoring lines require an explicit marker:\n${failures.join('\n')}`,
)

console.log('Article prose authoring checks passed.')

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      if (entry.name === '.vitepress') return []
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) return markdownFiles(target)
      return entry.isFile() && entry.name.endsWith('.md') ? [target] : []
    }),
  )
  return files.flat().sort()
}

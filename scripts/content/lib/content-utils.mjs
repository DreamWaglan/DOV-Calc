import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'

export const root = process.cwd()
export const reportsRoot = path.join(root, 'content', 'reports')

export async function listFiles(directory, predicate = () => true) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (
      entry.name.startsWith('.') ||
      entry.name === 'node_modules' ||
      entry.name === 'public'
    ) {
      continue
    }
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(absolutePath, predicate)))
    } else if (entry.isFile() && predicate(absolutePath)) {
      files.push(absolutePath)
    }
  }
  return files.sort((left, right) => left.localeCompare(right, 'en'))
}

export function relative(absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join('/')
}

export function routeFromMarkdown(absolutePath) {
  const docsRoot = path.join(root, 'docs')
  const normalized = path
    .relative(docsRoot, absolutePath)
    .split(path.sep)
    .join('/')
    .replace(/\.md$/, '')
  if (normalized === 'index') return '/'
  if (normalized.endsWith('/index')) {
    return `/${normalized.slice(0, -'/index'.length)}/`
  }
  return `/${normalized}`
}

export function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) throw new Error(`${filePath}: missing YAML frontmatter`)
  const value = parseYaml(match[1])
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${filePath}: frontmatter must be an object`)
  }
  return { data: value, body: source.slice(match[0].length) }
}

export async function loadPages() {
  const files = await listFiles(
    path.join(root, 'docs'),
    (filePath) => filePath.endsWith('.md'),
  )
  return Promise.all(
    files.map(async (absolutePath) => {
      const filePath = relative(absolutePath)
      const source = await readFile(absolutePath, 'utf8')
      const { data, body } = parseFrontmatter(source, filePath)
      return {
        absolutePath,
        filePath,
        route: routeFromMarkdown(absolutePath),
        frontmatter: data,
        body,
        source,
      }
    }),
  )
}

export async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), 'utf8'))
}

export async function writeReport(name, report) {
  await mkdir(reportsRoot, { recursive: true })
  const outputPath = path.join(reportsRoot, `${name}.json`)
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  return relative(outputPath)
}

export function printResult(label, failures, reportPath) {
  if (failures.length) {
    console.error(`${label} failed (${failures.length}); report: ${reportPath}`)
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
    return
  }
  console.log(`${label} passed; report: ${reportPath}`)
}

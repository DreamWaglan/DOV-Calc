import { writeFile as writeFileDirect } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const retryableWriteErrorCodes = new Set([
  'UNKNOWN',
  'EBUSY',
  'EPERM',
  'EACCES',
])

export async function writeFileWithRetry(filePath, data, options) {
  const maximumAttempts = process.platform === 'win32' ? 6 : 1

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      await writeFileDirect(filePath, data, options)
      return
    } catch (error) {
      const retryable =
        retryableWriteErrorCodes.has(error.code) && attempt < maximumAttempts

      if (!retryable) throw error

      const delayMs = 100 * 2 ** (attempt - 1)
      const displayPath = path.relative(process.cwd(), filePath) || filePath
      console.warn(
        `[file-write] ${displayPath} locked (${error.code}); retry ${attempt}/${maximumAttempts - 1} after ${delayMs}ms`,
      )
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}


import { readFile } from 'node:fs/promises'
import path from 'node:path'

const retryDelayMs = 100
const retryCount = 100

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function connectToRelaunchedBrowser(puppeteer, userDataDir) {
  const activePortPath = path.join(userDataDir, 'DevToolsActivePort')

  for (let attempt = 0; attempt < retryCount; attempt += 1) {
    try {
      const [port, browserPath] = (
        await readFile(activePortPath, 'utf8')
      )
        .trim()
        .split(/\r?\n/)
      if (port && browserPath) {
        return await puppeteer.connect({
          browserWSEndpoint: `ws://127.0.0.1:${port}${browserPath}`,
        })
      }
    } catch {
      // Edge can relaunch itself before Puppeteer observes its endpoint.
    }
    await sleep(retryDelayMs)
  }

  return null
}

export async function launchBrowser(
  puppeteer,
  { executablePath, userDataDir, args = [] },
) {
  try {
    return await puppeteer.launch({
      executablePath,
      headless: true,
      userDataDir,
      args,
    })
  } catch (launchError) {
    const relaunchedBrowser = await connectToRelaunchedBrowser(
      puppeteer,
      userDataDir,
    )
    if (relaunchedBrowser) return relaunchedBrowser
    throw launchError
  }
}

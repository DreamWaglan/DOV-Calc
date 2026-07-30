const benignMissingResourceMessage =
  'Failed to load resource: the server responded with a status of 404'

export async function ensureLazyToolLoaded(
  page,
  rootSelector,
  {
    buttonSelector = '.tool-loading button',
    timeout = 15_000,
  } = {},
) {
  const existingRoot = await page.$(rootSelector)
  if (existingRoot) return existingRoot

  const loadButton = await page.$(buttonSelector)
  if (!loadButton) return null

  await loadButton.click()
  await page.waitForSelector(rootSelector, { timeout })
  return page.$(rootSelector)
}

export function classifyBrowserErrors(
  messages,
  { allowSingleBenignMissingResource = false } = {},
) {
  const substantive = []
  const suppressed = []

  for (const message of messages) {
    const isBenignMissingResource = message.includes(
      benignMissingResourceMessage,
    )
    if (
      isBenignMissingResource &&
      allowSingleBenignMissingResource &&
      suppressed.length === 0
    ) {
      suppressed.push(message)
    } else {
      substantive.push(message)
    }
  }

  return {
    raw: [...messages],
    substantive,
    suppressed,
  }
}

export function parseReleaseValidationArguments(argv) {
  const options = {
    manifest: 'content/release/release-manifest.json',
    requireTagged: false,
    requireDeployed: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue

    if (argument === '--require-tagged') {
      options.requireTagged = true
      continue
    }

    if (argument === '--require-deployed') {
      options.requireDeployed = true
      continue
    }

    if (argument === '--manifest') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error('参数 --manifest 缺少取值')
      }
      options.manifest = value
      index += 1
      continue
    }

    throw new Error(`不支持的参数：${argument}`)
  }

  return options
}

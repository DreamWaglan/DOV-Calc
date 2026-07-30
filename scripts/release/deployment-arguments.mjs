export function parseDeploymentArguments(argv) {
  const options = {
    url: 'https://dreamwaglan.github.io/DOV-Calc/',
    manifest: 'content/release/release-manifest.json',
    report: 'content/release/deployment-verification.json',
    deployedCommit: '',
    workflowRunId: '',
    workflowUrl: '',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue

    const key = {
      '--url': 'url',
      '--manifest': 'manifest',
      '--report': 'report',
      '--deployed-commit': 'deployedCommit',
      '--workflow-run-id': 'workflowRunId',
      '--workflow-url': 'workflowUrl',
    }[argument]

    if (!key) throw new Error(`不支持的参数：${argument}`)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`参数 ${argument} 缺少取值`)
    }
    options[key] = value
    index += 1
  }

  return options
}

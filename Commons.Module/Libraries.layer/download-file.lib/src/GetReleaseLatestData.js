const SmartRequire = require("../../smart-require.lib/src/SmartRequire")

const fetch = SmartRequire("node-fetch")

const RequestData = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }

  return await response.json()
}

const GetReleaseLatestData = async (repoOwner, repoName) => {
  const releaseUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
  return await RequestData(releaseUrl)
}

module.exports = GetReleaseLatestData
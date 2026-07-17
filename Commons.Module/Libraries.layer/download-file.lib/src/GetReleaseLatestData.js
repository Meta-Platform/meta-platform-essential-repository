//TODO Muito especifico não deveria estar aqui
const { RunWithRetry } = require("./RunWithRetry")

const RequestData = async (url) =>
  RunWithRetry(async () => {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }, { label: "metadados da release" })

const GetReleaseLatestData = async (repoOwner, repoName) => {
  const releaseUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`
  return await RequestData(releaseUrl)
}

module.exports = GetReleaseLatestData

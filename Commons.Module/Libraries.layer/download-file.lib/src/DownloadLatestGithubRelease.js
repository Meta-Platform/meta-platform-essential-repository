const SmartRequire = require("../../smart-require.lib/src/SmartRequire")

const fetch = SmartRequire("node-fetch")
const fs = require("fs")
const path = require("path")

const DownloadBinary = async (url, localPath) => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }

    const fileName = path.basename(url)
    const filePath = path.resolve(localPath, fileName)
    const writer = fs.createWriteStream(filePath)
    
    return new Promise((resolve, reject) => {
      response.body.pipe(writer)
      writer.on("finish", () => resolve(filePath))
      writer.on("error", reject)
    })

  } catch (error) {
    console.error(error)
  }
}

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

const DownloadLatestGithubRelease = async ({
  repoOwner,
  repoName,
  localPath
}) => {
  const releaseData = await GetReleaseLatestData(repoOwner, repoName)
  const { assets: [assetData] } = releaseData
  const { browser_download_url } = assetData
  return await DownloadBinary(browser_download_url, localPath)
}

module.exports = DownloadLatestGithubRelease

const GetReleaseLatestData = require("./GetReleaseLatestData")
const DownloadBinary = require("./DownloadBinary")

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

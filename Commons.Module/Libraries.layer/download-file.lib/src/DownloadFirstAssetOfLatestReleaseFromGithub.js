const GetReleaseLatestData = require("./GetReleaseLatestData")
const DownloadBinary = require("./DownloadBinary")

const DownloadFirstAssetOfLatestReleaseFromGithub = async ({
  repoOwner,
  repoName,
  localPath
}) => {
  const releaseData = await GetReleaseLatestData(repoOwner, repoName)
  const { assets: [assetData] } = releaseData
  const { browser_download_url } = assetData
  return await DownloadBinary({
      url: browser_download_url, 
      destinationPath: localPath
  })
}

module.exports = DownloadFirstAssetOfLatestReleaseFromGithub

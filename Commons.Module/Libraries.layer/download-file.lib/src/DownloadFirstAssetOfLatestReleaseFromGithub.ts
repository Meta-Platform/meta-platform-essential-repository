import type { GithubRelease } from "./GetReleaseLatestData"

const GetReleaseLatestData = require("./GetReleaseLatestData") as (repoOwner: string, repoName: string) => Promise<GithubRelease>
const DownloadBinary = require("./DownloadBinary") as (params: { url: string, destinationPath: string, extName?: string }) => Promise<string>

const DownloadFirstAssetOfLatestReleaseFromGithub = async ({
  repoOwner,
  repoName,
  localPath
}: {
  repoOwner: string
  repoName: string
  localPath: string
}): Promise<string> => {
  const releaseData = await GetReleaseLatestData(repoOwner, repoName)
  const { assets: [assetData] } = releaseData
  const { browser_download_url } = assetData
  return await DownloadBinary({
      url: browser_download_url,
      destinationPath: localPath
  })
}

module.exports = DownloadFirstAssetOfLatestReleaseFromGithub

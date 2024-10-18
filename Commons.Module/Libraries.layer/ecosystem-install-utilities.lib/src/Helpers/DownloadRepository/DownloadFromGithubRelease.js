const GetReleaseLatestData = require("../../../../download-file.lib/src/GetReleaseLatestData")

const DownloadFromGithubRelease = async ({
    sourceData,
    destinationRepoPath
}) => {


    const releaseData = await GetReleaseLatestData(sourceData.repository.owner, sourceData.repository.name)
    releaseData
    /*return await DownloadLatestGithubRelease({
        repoName: sourceData.repository.name,
        repoOwner: sourceData.repository.owner,
        urlKeyword: "tarball_url",
        localPath: destinationRepoPath
    })*/

}

module.exports = DownloadFromGithubRelease

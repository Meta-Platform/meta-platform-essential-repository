const GetReleaseLatestData = require("../../../../download-file.lib/src/GetReleaseLatestData")

const DownloadFromGithubRelease = async (repository, destinationRepoPath) => {

    const { source } = repository
    const releaseData = await GetReleaseLatestData(source.repository.owner, source.repository.name)
    releaseData
    /*return await DownloadLatestGithubRelease({
        repoName: source.repository.name,
        repoOwner: source.repository.owner,
        urlKeyword: "tarball_url",
        localPath: destinationRepoPath
    })*/

}

module.exports = DownloadFromGithubRelease

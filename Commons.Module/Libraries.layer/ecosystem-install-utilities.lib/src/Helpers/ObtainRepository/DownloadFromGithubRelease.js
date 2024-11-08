const GetReleaseLatestData = require("../../../../download-file.lib/src/GetReleaseLatestData")
const DownloadBinary = require("../../../../download-file.lib/src/DownloadBinary")

const DownloadFromGithubRelease = async (args) => {

    const {
        sourceData,
        destinationRepoPath
    } = args

    const {
        repositoryOwner,
        repositoryName
    } = sourceData
    
    const releaseData = await GetReleaseLatestData(repositoryOwner, repositoryName)
    const {
        tarball_url
    } = releaseData

    const binaryPath = await DownloadBinary({
        url: tarball_url, 
        destinationPath: destinationRepoPath,
        extName: "tar.gz"
    })
    debugger

    return binaryPath

}

module.exports = DownloadFromGithubRelease
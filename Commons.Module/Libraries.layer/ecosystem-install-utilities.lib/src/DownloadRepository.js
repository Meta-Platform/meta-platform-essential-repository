const path = require("path")
const os = require('os')

const CopyDirectory                 = require("../../copy-directory.lib/src/CopyDirectory")
const ExtractTarGz                  = require("../../extract-tar-gz.lib/src/ExtractTarGz")
const DownloadFileFromGoogleDrive   = require("../../download-file.lib/src/DownloadFileFromGoogleDrive")
const GetReleaseLatestData          = require("../../download-file.lib/src/GetReleaseLatestData")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

const DownloadRepoFromLocalFS = (repository, destinationRepoPath) => {
    const { namespace, source } = repository
    const { path: repoPath } = source
    const destinationPath = path.join(destinationRepoPath, namespace)
    const sourcePath = ConvertPathToAbsolutPath(repoPath)
    CopyDirectory(sourcePath, destinationPath)
    return destinationPath
}

const DownloadRepoFromGoogleDrive = async (repository, destinationRepoPath) => {
    const { source } = repository
    const { fileId } = source
    const fileNamePath = await DownloadFileFromGoogleDrive(fileId, destinationRepoPath)
    const repoPathExtract = await ExtractTarGz(fileNamePath, destinationRepoPath)
    return repoPathExtract
}

const DownloadRepoFromGithubRelease = async (repository, destinationRepoPath) => {

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

const DownloadRepository = async ({
    repositoryToInstall,
    ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
}) => {

    const {
        repository
    } = repositoryToInstall

    const { source } = repository

    const REPOS_PATH = path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES)
    
    switch(source.type){
        case "LOCAL_FS":
            return DownloadRepoFromLocalFS(repository, REPOS_PATH)
        case "GOOGLE_DRIVE":
            return DownloadRepoFromGoogleDrive(repository, REPOS_PATH)
        case "GITHUB_RELEASE":
            return DownloadRepoFromGithubRelease(repository, REPOS_PATH)
    }
}


module.exports = DownloadRepository
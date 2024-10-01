const path = require("path")

const DownloadFromLocalFS       = require("./DownloadFromLocalFS")
const DownloadFromGoogleDrive   = require("./DownloadFromGoogleDrive")
const DownloadFromGithubRelease = require("./DownloadFromGithubRelease")

//TODO colocar log aqui
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
            return DownloadFromLocalFS(repository, REPOS_PATH)
        case "GOOGLE_DRIVE":
            return DownloadFromGoogleDrive(repository, REPOS_PATH)
        case "GITHUB_RELEASE":
            return DownloadFromGithubRelease(repository, REPOS_PATH)
    }
}

module.exports = DownloadRepository
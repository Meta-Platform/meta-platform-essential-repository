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

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "DownloadRepository",
        type: "info",
        message: `Inciando o download do repositório ${colors.bold(repository.namespace)}...`
    })

    const REPOS_PATH = path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES)

    const DownloadFrom = {
        "LOCAL_FS"       : (repository, REPOS_PATH) => DownloadFromLocalFS(repository, REPOS_PATH),
        "GOOGLE_DRIVE"   : (repository, REPOS_PATH) => DownloadFromGoogleDrive(repository, REPOS_PATH),
        "GITHUB_RELEASE" : (repository, REPOS_PATH) => DownloadFromGithubRelease(repository, REPOS_PATH)
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "DownloadRepository",
        type: "info",
        message: `A fonte do tipo ${colors.bold(source.type)} selecionada`
    })

    const destinationPath =  DownloadFrom[source.type](repository, REPOS_PATH)
    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "DownloadRepository",
        type: "info",
        message: `Download do repositório ${colors.bold(repository.namespace)} foi concluído!`
    })
    return destinationPath
}

module.exports = DownloadRepository
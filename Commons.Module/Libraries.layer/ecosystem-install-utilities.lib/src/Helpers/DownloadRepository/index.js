const path = require("path")
const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const DownloadFromLocalFS       = require("./DownloadFromLocalFS")
const DownloadFromGoogleDrive   = require("./DownloadFromGoogleDrive")
const DownloadFromGithubRelease = require("./DownloadFromGithubRelease")

//TODO colocar log aqui
const DownloadRepository = async ({
    repositoryNamespace,
    sourceData,
    ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
    loggerEmitter
}) => {
    
    const { 
        type: sourceType
     } = sourceData

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "DownloadRepository",
        type: "info",
        message: `Baixando repositório ${colors.bold(repositoryNamespace)}...`
    })

    const destinationRepoPath = path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES)

    const DownloadFrom = {
        "LOCAL_FS"       : (args) => DownloadFromLocalFS(args),
        "GOOGLE_DRIVE"   : (args) => DownloadFromGoogleDrive(args),
        "GITHUB_RELEASE" : (args) => DownloadFromGithubRelease(args)
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "DownloadRepository",
        type: "info",
        message: `A fonte do tipo ${colors.bold(sourceType)} selecionada`
    })

    const destinationPath =  DownloadFrom[sourceType]({ repositoryNamespace, sourceData, destinationRepoPath })
    
    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "DownloadRepository",
        type: "info",
        message: `Download do repositório ${colors.bold(repositoryNamespace)} foi concluído!`
    })
    return destinationPath
}

module.exports = DownloadRepository
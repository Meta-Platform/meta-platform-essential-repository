const path = require("path")
const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const ObtainFromLocalFS         = require("./ObtainFromLocalFS")
const DownloadFromGoogleDrive   = require("./DownloadFromGoogleDrive")
const DownloadFromGithubRelease = require("./DownloadFromGithubRelease")

//TODO colocar log aqui
const ObtainRepository = async ({
    repositoryNamespace,
    sourceData,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
    loggerEmitter
}) => {
    
    const { 
        sourceType
     } = sourceData

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "ObtainRepository",
        type: "info",
        message: `Baixando repositório ${colors.bold(repositoryNamespace)}...`
    })

    const destinationRepoPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES)

    const ObtainFrom = {
        "LOCAL_FS"       : (args) => ObtainFromLocalFS(args),
        "GOOGLE_DRIVE"   : (args) => DownloadFromGoogleDrive(args),
        "GITHUB_RELEASE" : (args) => DownloadFromGithubRelease(args)
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "ObtainRepository",
        type: "info",
        message: `A fonte do tipo ${colors.bold(sourceType)} selecionada`
    })

    const destinationPath =  ObtainFrom[sourceType]({ repositoryNamespace, sourceData, destinationRepoPath })
    
    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "ObtainRepository",
        type: "info",
        message: `Download do repositório ${colors.bold(repositoryNamespace)} foi concluído!`
    })
    return destinationPath
}

module.exports = ObtainRepository
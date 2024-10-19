const path = require("path")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const ReinstallApplication = require("./Update/ReinstallApplication")
const DownloadRepository = require("./Helpers/DownloadRepository")

const CleanOldRepository = require("./Helpers/CleanOldRepository")

const UpdateRepository = async ({
    repositoryNamespace,
    sourceData,
    appsToInstall,
    absolutInstallDataDirPath,
    ecosystemDefaults,
    loggerEmitter
}) => {

    const { 
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    } = ecosystemDefaults

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `Atualizando o repositório ${colors.bold(repositoryNamespace)}...`
    })

    await CleanOldRepository({
        namespace: repositoryNamespace,
        absolutInstallDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    const deployedRepoPath = await DownloadRepository({
        repositoryNamespace,
        sourceData,
        absolutInstallDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    if(appsToInstall){
        const supervisorSocketDirPath = path.join(absolutInstallDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)
        for (const appToInstall of appsToInstall) {
            await ReinstallApplication({
                namespace: repositoryNamespace,
                appToInstall,
                absolutInstallDataDirPath,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                supervisorSocketDirPath,
                loggerEmitter
            })
        }
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `A atualização do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.sourceType)}] foi concluída!`
    })
}

module.exports = UpdateRepository
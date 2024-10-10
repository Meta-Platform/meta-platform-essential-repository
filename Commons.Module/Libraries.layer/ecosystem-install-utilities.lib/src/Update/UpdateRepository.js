const path = require("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const ReinstallApplication = require("./ReinstallApplication")
const DownloadRepository = require("../Helpers/DownloadRepository")

const CleanOldRepository = require("../Helpers/CleanOldRepository")

const UpdateRepository = async ({
    repositoryToInstall,
    ECO_DIRPATH_INSTALL_DATA,
    ecosystemDefaults,
    loggerEmitter
}) => {


    const { 
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    } = ecosystemDefaults

    const {
        repository:repositoryData,
        appsToInstall
    } = repositoryToInstall

    const { namespace } = repositoryData

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `Atualizando o repositório ${colors.bold(namespace)}...`
    })

    await CleanOldRepository({
        repositoryData,
        ECO_DIRPATH_INSTALL_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    const deployedRepoPath = await DownloadRepository({
        repositoryToInstall,
        ECO_DIRPATH_INSTALL_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    if(appsToInstall){
        const supervisorSocketDirPath = path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)
        for (const appToInstall of appsToInstall) {
            await ReinstallApplication({
                namespace,
                appToInstall,
                ECO_DIRPATH_INSTALL_DATA,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                supervisorSocketDirPath,
                loggerEmitter
            })
        }
    }

    /*

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `A Instalação do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(source.type)}] foi concluída!`
    })*/
}

module.exports = UpdateRepository
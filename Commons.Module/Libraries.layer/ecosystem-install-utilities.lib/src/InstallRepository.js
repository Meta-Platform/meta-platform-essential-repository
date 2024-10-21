const path = require("path")
const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const RegisterRepository = require("../../repository-config-handler.lib/src/RegisterRepository")

const InstallApplication = require("./Install/InstallApplication")
const DownloadRepository = require("./Helpers/DownloadRepository")

const InstallRepository = async ({
    repositoryNamespace,
    sourceData,
    appsToInstall,
    installDataDirPath,
    ecosystemDefaults,
    loggerEmitter
}) => {

    const { 
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    } = ecosystemDefaults

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallRepository",
        type: "info",
        message: `Instalando o repositório ${colors.bold(repositoryNamespace)}...`
    })

    const deployedRepoPath = await DownloadRepository({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    await RegisterRepository({
        repositoryNamespace,
        sourceData,
        appsToInstall,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    if(appsToInstall){
        const supervisorSocketDirPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)
        for (const appToInstall of appsToInstall) {
            await InstallApplication({
                namespace: repositoryNamespace,
                appToInstall,
                installDataDirPath,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                supervisorSocketDirPath,
                loggerEmitter
            })
        }
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallRepository",
        type: "info",
        message: `A Instalação do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.sourceType)}] foi concluída!`
    })
}

module.exports = InstallRepository
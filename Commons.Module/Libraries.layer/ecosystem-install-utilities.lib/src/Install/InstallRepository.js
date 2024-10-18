const path = require("path")
const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const RegisterRepository = require("../../../register-repository.lib/src/RegisterRepository")

const InstallApplication = require("./InstallApplication")
const DownloadRepository = require("../Helpers/DownloadRepository")

const InstallRepository = async ({
    repositoryNamespace,
    sourceData,
    appsToInstall,
    absolutInstallDataDirPath,
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
        absolutInstallDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    await RegisterRepository({
        namespace: repositoryNamespace, 
        path : path.join(absolutInstallDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES, repositoryNamespace), 
        absolutInstallDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        loggerEmitter
    })

    if(appsToInstall){
        const supervisorSocketDirPath = path.join(absolutInstallDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)
        for (const appToInstall of appsToInstall) {
            await InstallApplication({
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
        sourceName: "InstallRepository",
        type: "info",
        message: `A Instalação do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.type)}] foi concluída!`
    })
}

module.exports = InstallRepository
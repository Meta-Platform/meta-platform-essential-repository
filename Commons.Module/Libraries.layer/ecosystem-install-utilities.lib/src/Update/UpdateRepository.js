const path = require("path")
const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const RegisterRepository = require("../../../register-repository.lib/src/RegisterRepository")

const InstallApplication = require("./InstallApplication")
const DownloadRepository = require("../Helpers/DownloadRepository")

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
        repository:{
            namespace,
            source
        },
        appsToInstall
    } = repositoryToInstall

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `Instalando o repositório ${colors.bold(namespace)}...`
    })

    const deployedRepoPath = await DownloadRepository({
        repositoryToInstall,
        ECO_DIRPATH_INSTALL_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    await RegisterRepository({
        namespace, 
        path : path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES, namespace), 
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA,
        loggerEmitter
    })
    
    const SUPERVISOR_SOCKET_DIR_PATH = path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)

    if(appsToInstall){
        for (const appToInstall of appsToInstall) {
            await InstallApplication({
                namespace,
                appToInstall,
                ECO_DIRPATH_INSTALL_DATA,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                SUPERVISOR_SOCKET_DIR_PATH,
                loggerEmitter
            })
        }
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `A Instalação do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(source.type)}] foi concluída!`
    })
}

module.exports = UpdateRepository
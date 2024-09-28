const path = require("path")
const os = require('os')

const InstallApplication = require("./InstallApplication")
const RegisterRepository = require("../../register-repository.lib/src/RegisterRepository")

const DownloadRepository = require("./DownloadRepository")

const UpdateRepository = async ({
    repositoryToInstall,
    ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
    ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    const {
        repository:{
            namespace
        },
        appsToInstall
    } = repositoryToInstall

    const deployedRepoPath = await DownloadRepository({
        repositoryToInstall,
        ECO_DIRPATH_INSTALL_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
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
}

module.exports = UpdateRepository
const path = require("path")
const os = require('os')

const InstallEcosystem          = require("./InstallEcosystem")
const InstallNodejsDependencies = require("./InstallNodejsDependencies")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

const InstallRepository = require("./InstallRepository")

const UpdateEcosystemByProfile = async ({
    ecosystemDefaults,
    npmDependencies,
    installationProfile,
    installationPath,
    loggerEmitter
}) => {

    const { 
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    } = ecosystemDefaults

    const {
        installationDataDir,
        repositoriesToInstall
    } = installationProfile

    const ECO_DIRPATH_INSTALL_DATA = ConvertPathToAbsolutPath(installationPath || installationDataDir)

    await InstallEcosystem({
        ecosystemDefaults,
        ECO_DIRPATH_INSTALL_DATA,
        loggerEmitter
    })

    await InstallNodejsDependencies({
        contextPath: path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES),
        dependencies: npmDependencies
    })

    if(repositoriesToInstall){
        for (const repositoryToInstall of repositoriesToInstall) {
            await InstallRepository({
                repositoryToInstall,
                ECO_DIRPATH_INSTALL_DATA,
                ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
                REPOS_CONF_FILENAME_REPOS_DATA,
                loggerEmitter
            })
        }
    }
}

module.exports = UpdateEcosystemByProfile
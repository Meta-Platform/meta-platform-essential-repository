const path = require("path")

const UpdateEcosystem          = require("./Update/UpdateEcosystem")
const UpdateNodejsDependencies = require("./Update/UpdateNodejsDependencies")
const UpdateRepository         = require("./Update/UpdateRepository")

const ConvertPathToAbsolutPath = require("./Helpers/ConvertPathToAbsolutPath")

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

    await UpdateEcosystem({
        ecosystemDefaults,
        ECO_DIRPATH_INSTALL_DATA,
        loggerEmitter
    })

    await UpdateNodejsDependencies({
        contextPath: path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES),
        dependencies: npmDependencies
    })

    if(repositoriesToInstall){
        for (const repositoryToInstall of repositoriesToInstall) {
            await UpdateRepository({
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
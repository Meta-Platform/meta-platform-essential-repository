const path = require("path")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const InstallEcosystem          = require("./Install/InstallEcosystem")
const InstallNodejsDependencies = require("./Install/InstallNodejsDependencies")
const InstallRepository         = require("./Install/InstallRepository")

const ConvertPathToAbsolutPath = require("./Helpers/ConvertPathToAbsolutPath")

const InstallEcosystemByProfile = async ({
    ecosystemDefaults,
    npmDependencies,
    installationProfile,
    installationPath,
    profile,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallEcosystemByProfile",
        type: "info",
        message: `Inicio de instalação usando o perfil ${colors.bold(path.basename(profile))}`
    })

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
        dependencies: npmDependencies,
        loggerEmitter
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

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallEcosystemByProfile",
        type: "info",
        message: `Fim da instalação do perfil ${colors.bold(path.basename(profile))}!`
    })
}

module.exports = InstallEcosystemByProfile
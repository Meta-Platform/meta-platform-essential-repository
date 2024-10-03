const path = require("path")

/*

const UpdateNodejsDependencies = require("./Update/UpdateNodejsDependencies")
const UpdateRepository         = require("./Update/UpdateRepository")*/

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const UpdateEcosystem = require("./Update/UpdateEcosystem")
const PrepareContext  = require("./Helpers/PrepareContext")

const UpdateEcosystemByProfile = async ({
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
        message: `Inicio da atualização usando o perfil ${colors.bold(path.basename(profile))}`
    })

    const context = PrepareContext({
        installationProfile,
        ecosystemDefaults,
        installationPath
    })

    const {
        absolutInstallDataDirPath,
        npmDependenciesContextPath
    } = context

    await UpdateEcosystem({
        ecosystemDefaults,
        ECO_DIRPATH_INSTALL_DATA: absolutInstallDataDirPath,
        loggerEmitter
    })

    /*await UpdateNodejsDependencies({
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
    }*/
}

module.exports = UpdateEcosystemByProfile
const path = require("path")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const UpdateEcosystem = require("./Update/UpdateEcosystem")
const UpdateRepository = require("./Update/UpdateRepository")
const PrepareContext  = require("./Helpers/PrepareContext")
const SynchronizeNodejsDependencies = require("./Helpers/SynchronizeNodejsDependencies")

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

    await SynchronizeNodejsDependencies({
        contextPath: npmDependenciesContextPath,
        dependencies: npmDependencies,
        loggerEmitter
    })

    if(installationProfile?.repositoriesToInstall){
        const {
            repositoriesToInstall
        } = installationProfile
    
        for (const repositoryToInstall of repositoriesToInstall) {
            await UpdateRepository({
                repositoryToInstall,
                ECO_DIRPATH_INSTALL_DATA: absolutInstallDataDirPath,
                ecosystemDefaults,
                loggerEmitter
            })
        }
    }
}

module.exports = UpdateEcosystemByProfile
const path = require("path")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const InstallEcosystem = require("./Install/InstallEcosystem")
const InstallRepository = require("./Install/InstallRepository")

const SynchronizeNodejsDependencies = require("./Helpers/SynchronizeNodejsDependencies")
const PrepareContext                = require("./Helpers/PrepareContext")

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
        message: `Início de instalação usando o perfil ${colors.bold(path.basename(profile))}`
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

    await InstallEcosystem({
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
            await InstallRepository({
                repositoryToInstall,
                ECO_DIRPATH_INSTALL_DATA: absolutInstallDataDirPath,
                ecosystemDefaults,
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
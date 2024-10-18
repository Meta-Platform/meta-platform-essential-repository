const path = require("path")
const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const UpdateEcosystem = require("./Update/UpdateEcosystem")
const UpdateRepository = require("./UpdateRepository")
const PrepareContext  = require("./Helpers/PrepareContext")
const SynchronizeNodejsDependencies = require("./Helpers/SynchronizeNodejsDependencies")

const VerifyIfAllRepositoriesAreRegistered = require("./Helpers/VerifyIfAllRepositoriesAreRegistered")

const UpdateEcosystemByProfile = async ({
    ecosystemDefaults,
    npmDependencies,
    installationProfile,
    installationPath,
    profile,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateEcosystemByProfile",
        type: "info",
        message: `Início da atualização usando o perfil ${colors.bold(path.basename(profile))}`
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

        const { repositoriesToInstall } = installationProfile

        const areAllRepositoriesRegistered = await VerifyIfAllRepositoriesAreRegistered({
            repositoriesToInstall,
            installationPath: absolutInstallDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA: ecosystemDefaults.REPOS_CONF_FILENAME_REPOS_DATA
        })

        if(areAllRepositoriesRegistered) {
            const {
                repositoriesToInstall
            } = installationProfile
            
            for (const repositoryToInstall of repositoriesToInstall) {

                const { 
                    repository: {
                        namespace: repositoryNamespace,
                        source: sourceData,
                    },
                    appsToInstall
                 } = repositoryToInstall

                await UpdateRepository({
                    repositoryNamespace,
                    sourceData,
                    appsToInstall,
                    absolutInstallDataDirPath,
                    ecosystemDefaults,
                    loggerEmitter
                })
            }
        } else {
            throw "Os repositórios instalados não correspondem com o perfil selecionado"
        }
    }


    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateEcosystemByProfile",
        type: "info",
        message: `Fim da atualização do perfil ${colors.bold(path.basename(profile))}!`
    })
}

module.exports = UpdateEcosystemByProfile
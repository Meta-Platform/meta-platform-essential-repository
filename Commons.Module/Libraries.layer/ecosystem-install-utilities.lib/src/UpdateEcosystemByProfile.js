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
    profileData,
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
        profileData,
        ecosystemDefaults,
        installationPath
    })

    const {
        installDataDirPath,
        npmDependenciesContextPath
    } = context

    await UpdateEcosystem({
        ecosystemDefaults,
        ECO_DIRPATH_INSTALL_DATA: installDataDirPath,
        loggerEmitter
    })

    await SynchronizeNodejsDependencies({
        contextPath: npmDependenciesContextPath,
        dependencies: npmDependencies,
        loggerEmitter
    })

    if(profileData?.repositoriesToInstall){

        const { repositoriesToInstall } = profileData

        const areAllRepositoriesRegistered = await VerifyIfAllRepositoriesAreRegistered({
            repositoriesToInstall,
            installationPath: installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA: ecosystemDefaults.REPOS_CONF_FILENAME_REPOS_DATA
        })

        if(areAllRepositoriesRegistered) {
            const {
                repositoriesToInstall
            } = profileData
            
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
                    installDataDirPath,
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
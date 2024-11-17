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
    profile,
    installationDataDir,
    repositoriesInstallData,
    installationPath,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateEcosystemByProfile",
        type: "info",
        message: `Início da atualização usando o perfil ${colors.bold(path.basename(profile))}`
    })

    const context = PrepareContext({
        installationDataDir,
        ecosystemDefaults,
        installationPath
    })

    const {
        installDataDirPath,
        npmDependenciesContextPath
    } = context

    await UpdateEcosystem({
        ecosystemDefaults,
        installDataDirPath,
        loggerEmitter
    })

    await SynchronizeNodejsDependencies({
        contextPath: npmDependenciesContextPath,
        dependencies: npmDependencies,
        loggerEmitter
    })

    if(repositoriesInstallData){

        const areAllRepositoriesRegistered = await VerifyIfAllRepositoriesAreRegistered({
            repositoriesInstallData,
            installationPath: installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA: ecosystemDefaults.REPOS_CONF_FILENAME_REPOS_DATA
        })

        if(areAllRepositoriesRegistered) {
 
            for (const repositoryInstallData of repositoriesInstallData) {

                const { 
                    namespace: repositoryNamespace,
                    sourceData,
                    executablesToInstall
                 } = repositoryInstallData

                await UpdateRepository({
                    repositoryNamespace,
                    sourceData,
                    executablesToInstall,
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
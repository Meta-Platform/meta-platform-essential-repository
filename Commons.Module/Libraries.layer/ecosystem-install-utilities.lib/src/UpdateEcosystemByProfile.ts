import type { EcosystemDefaults, RepositoryInstallData } from "./Types"

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
    installationPath
}: {
    ecosystemDefaults: EcosystemDefaults
    npmDependencies: Record<string, string>
    profile: string
    installationDataDir: string
    repositoriesInstallData?: RepositoryInstallData[]
    installationPath?: string
}) => {

    Log.info("UpdateEcosystemByProfile", `Início da atualização usando o perfil ${colors.bold(path.basename(profile))}`)

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
        installDataDirPath
    })

    await SynchronizeNodejsDependencies({
        contextPath: npmDependenciesContextPath,
        dependencies: npmDependencies
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
                    ecosystemDefaults
                })
            }
        } else {
            throw "Os repositórios instalados não correspondem com o perfil selecionado"
        }
    }


    Log.info("UpdateEcosystemByProfile", `Fim da atualização do perfil ${colors.bold(path.basename(profile))}!`)
}

module.exports = UpdateEcosystemByProfile
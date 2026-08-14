const path = require("path")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const RegisterRepositoryInstallation = require("../../repository-config-handler.lib/src/RegisterRepositoryInstallation")
const LoadMetadataDir = require("../../load-metatada-dir.lib/src/LoadMetadataDir")

const InstallApplication = require("./Install/InstallApplication")
const ObtainRepository = require("./Helpers/ObtainRepository")
const SynchronizeTaskLoaderDependencies = require("./Helpers/SynchronizeTaskLoaderDependencies")

const FilterApplicationsMetadataByExecutablesToInstall = require("./Helpers/FilterApplicationsMetadataByExecutablesToInstall")
/*
 * Ponto de entrada de instalação/atualização — garante `globalThis.Log` antes de
 * qualquer uso (VDRP-275). Esta árvore chama `Log.<nível>` direto, mas pode ser
 * carregada por um binário (mywizard, package-executor) antes de o bootstrap
 * instalar o global; sem a garantia, o primeiro log lança
 * `ReferenceError: Log is not defined` e, dentro de um `catch`, apaga a causa
 * real. O logger garantido é mínimo e o canônico o substitui depois.
 */
const EnsureGlobalLogger = require("../../logger.lib/src/EnsureGlobalLogger")

const InstallRepository = async ({
    repositoryNamespace,
    sourceData,
    executablesToInstall,
    installDataDirPath,
    ecosystemDefaults
}) => {

    EnsureGlobalLogger()

    const { 
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
        REPOS_CONF_DIRNAME_METADATA
    } = ecosystemDefaults

    Log.info("InstallRepository", `Instalando o repositório ${colors.bold(repositoryNamespace)}...`)

    const deployedRepoPath = await ObtainRepository({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })

    const metadataContent = await LoadMetadataDir({
        metadataDirName: REPOS_CONF_DIRNAME_METADATA,
        path: deployedRepoPath
    })

    const { applications: applicationsMetadata } = metadataContent || {}

    await RegisterRepositoryInstallation({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        deployedRepoPath
    })

    // Depois do registro, para que o repositório recém-instalado já entre na coleta.
    await SynchronizeTaskLoaderDependencies({ installDataDirPath, ecosystemDefaults })

    if(executablesToInstall && metadataContent){

        const supervisorSocketDirPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)

        const applicationsDataFiltered = 
            FilterApplicationsMetadataByExecutablesToInstall({
                executablesToInstall,
                applicationsMetadata
            })

        for (const applicationData of applicationsDataFiltered) {

            await InstallApplication({
                namespace: repositoryNamespace,
                deployedRepoPath,
                applicationData,
                installDataDirPath,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                REPOS_CONF_FILENAME_REPOS_DATA,
                supervisorSocketDirPath
            })
            
        }
    }

    Log.info("InstallRepository", `A Instalação do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.sourceType)}] foi concluída!`)
}

module.exports = InstallRepository
const path = require("path")
const fs = require("fs")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const LoadMetadataDir = require("../../load-metatada-dir.lib/src/LoadMetadataDir") 

const GetRepositories = require("../../repository-config-handler.lib/src/GetRepositories")
const UpdateRepositoryInstallationPath = require("../../repository-config-handler.lib/src/UpdateRepositoryInstallationPath")

const ReinstallApplication = require("./Update/ReinstallApplication")
const ObtainRepository = require("./Helpers/ObtainRepository")

const CleanOldRepository = require("./Helpers/CleanOldRepository")
/*
 * Ponto de entrada de instalação/atualização — garante `globalThis.Log` antes de
 * qualquer uso (VDRP-275). Esta árvore chama `Log.<nível>` direto, mas pode ser
 * carregada por um binário (mywizard, package-executor) antes de o bootstrap
 * instalar o global; sem a garantia, o primeiro log lança
 * `ReferenceError: Log is not defined` e, dentro de um `catch`, apaga a causa
 * real. O logger garantido é mínimo e o canônico o substitui depois.
 */
const EnsureGlobalLogger = require("../../logger.lib/src/EnsureGlobalLogger")

const UpdateRepository = async ({
    repositoryNamespace,
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

    Log.info("UpdateRepository", `Atualizando o repositório ${colors.bold(repositoryNamespace)}...`)

    await CleanOldRepository({
        namespace: repositoryNamespace,
        installDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })

    const { sourceData } = (await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    }))[repositoryNamespace]

    const deployedRepoPath = await ObtainRepository({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })

    await UpdateRepositoryInstallationPath({
        installDataDirPath,
        repositoryNamespace,
        REPOS_CONF_FILENAME_REPOS_DATA,
        deployedRepoPath
    }) 
  

    const metadataContent = await LoadMetadataDir({
        metadataDirName: REPOS_CONF_DIRNAME_METADATA,
        path: deployedRepoPath
    })

    const { applications: applicationsMetadata } = metadataContent || {}

    if(metadataContent){

        const supervisorSocketDirPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)

        for (const applicationData of applicationsMetadata) {

            const executableFullPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, applicationData.executable)
            try {
                await fs.promises.access(executableFullPath, fs.constants.F_OK)
                await ReinstallApplication({
                    namespace: repositoryNamespace,
                    applicationData,
                    deployedRepoPath,
                    installDataDirPath,
                    ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                    supervisorSocketDirPath
                })
            } catch (err) {
                Log.warn("UpdateRepository", `A aplicação não foi reinstalada: o executável ${applicationData.executable} não existe em ${executableFullPath}. É preciso estar instalado para reinstalar.`)
            }

            

        }

    }

    Log.info("UpdateRepository", `A atualização do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.sourceType)}] foi concluída!`)
}

module.exports = UpdateRepository
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

const UpdateRepository = async ({
    repositoryNamespace,
    executablesToInstall,
    installDataDirPath,
    ecosystemDefaults,
    loggerEmitter
}) => {

    const { 
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
        REPOS_CONF_DIRNAME_METADATA
    } = ecosystemDefaults

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `Atualizando o repositório ${colors.bold(repositoryNamespace)}...`
    })

    await CleanOldRepository({
        namespace: repositoryNamespace,
        installDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    const { sourceData } = (await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    }))[repositoryNamespace]

    const deployedRepoPath = await ObtainRepository({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    await UpdateRepositoryInstallationPath({
        installDataDirPath,
        repositoryNamespace,
        REPOS_CONF_FILENAME_REPOS_DATA,
        deployedRepoPath,
        loggerEmitter
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
                    supervisorSocketDirPath,
                    loggerEmitter
                })
            } catch (err) {
                loggerEmitter && loggerEmitter.emit("log", {
                    sourceName: "UpdateRepository",
                    type: "warning",
                    message: `A aplicação não foi reinstalada: o executável ${applicationData.executable} não existe em ${executableFullPath}. É preciso estar instalado para reinstalar.`
                })
            }

            

        }

    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `A atualização do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.sourceType)}] foi concluída!`
    })
}

module.exports = UpdateRepository
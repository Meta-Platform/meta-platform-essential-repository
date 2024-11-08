const path = require("path")

const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const LoadMetadataDir = require("../../load-metatada-dir.lib/src/LoadMetadataDir") 

const ReinstallApplication = require("./Update/ReinstallApplication")
const ObtainRepository = require("./Helpers/ObtainRepository")

const CleanOldRepository = require("./Helpers/CleanOldRepository")

const FilterApplicationsMetadataByExecutablesToInstall = require("./Helpers/FilterApplicationsMetadataByExecutablesToInstall")

const UpdateRepository = async ({
    repositoryNamespace,
    sourceData,
    executablesToInstall,
    installDataDirPath,
    ecosystemDefaults,
    loggerEmitter
}) => {

    const { 
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

    const deployedRepoPath = await ObtainRepository({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

    const metadataContent = await LoadMetadataDir({
        metadataDirName: REPOS_CONF_DIRNAME_METADATA,
        path: deployedRepoPath
    })

    const { applications: applicationsMetadata } = metadataContent || {}

    if(executablesToInstall && metadataContent){

        const supervisorSocketDirPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)

        const applicationsDataFiltered = 
            FilterApplicationsMetadataByExecutablesToInstall({
                executablesToInstall,
                applicationsMetadata
            })
        
        for (const applicationData of applicationsDataFiltered) {

            await ReinstallApplication({
                namespace: repositoryNamespace,
                applicationData,
                installDataDirPath,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                supervisorSocketDirPath,
                loggerEmitter
            })

        }

    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "UpdateRepository",
        type: "info",
        message: `A atualização do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.sourceType)}] foi concluída!`
    })
}

module.exports = UpdateRepository
const path = require("path")
const SmartRequire = require("../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const RegisterRepository = require("../../repository-config-handler.lib/src/RegisterRepository")
const LoadMetadataDir = require("../../load-metatada-dir.lib/src/LoadMetadataDir")

const InstallApplication = require("./Install/InstallApplication")
const DownloadRepository = require("./Helpers/DownloadRepository")


const FilterApplicationsMetadataByExecutablesToInstall = ({
    executablesToInstall,
    applicationsMetadata
}) => {
    return applicationsMetadata.filter(item => executablesToInstall.includes(item.executable))
}


const InstallRepository = async ({
    repositoryNamespace,
    sourceData,
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
        sourceName: "InstallRepository",
        type: "info",
        message: `Instalando o repositório ${colors.bold(repositoryNamespace)}...`
    })

    const deployedRepoPath = await DownloadRepository({
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

    await RegisterRepository({
        repositoryNamespace,
        sourceData,
        applicationsMetadata,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        loggerEmitter
    })

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
                applicationData,
                installDataDirPath,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                supervisorSocketDirPath,
                loggerEmitter
            })
        }
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallRepository",
        type: "info",
        message: `A Instalação do repositório ${colors.bold("namespace")} pela fonte do tipo [${colors.inverse(sourceData.sourceType)}] foi concluída!`
    })
}

module.exports = InstallRepository
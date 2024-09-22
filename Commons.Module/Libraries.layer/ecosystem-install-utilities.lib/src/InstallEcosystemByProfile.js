const path = require("path")
const os = require('os')

const CopyDirectory                 = require("../../copy-directory.lib/src/CopyDirectory")
const DownloadFileFromGoogleDrive   = require("../../download-file.lib/src/DownloadFileFromGoogleDrive")
const ExtractTarGz                  = require("../../extract-tar-gz.lib/src/ExtractTarGz")
const RegisterRepository            = require("../../register-repository.lib/src/RegisterRepository")

const InstallEcosystem              = require("./InstallEcosystem")
const InstallApplication            = require("./InstallApplication")
const InstallNodejsDependencies     = require("./InstallNodejsDependencies")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

const DeployRepository = async ({
    repositoryToInstall,
    ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
}) => {

    const {
        repositoryNamespace,
        repositorySourceType
    } = repositoryToInstall

    const REPOS_PATH = path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES)
    
    switch(repositorySourceType){
        case "LOCAL_FS":
            const { repositoryPath } = repositoryToInstall
            const destinationPath = path.join(REPOS_PATH, repositoryNamespace)
            const sourcePath = ConvertPathToAbsolutPath(repositoryPath)
            CopyDirectory(sourcePath, destinationPath)
            return destinationPath
        case "GOOGLE_DRIVE":
            const { fileId } = repositoryToInstall
            const fileNamePath = await DownloadFileFromGoogleDrive(fileId, REPOS_PATH)
            const repoPathExtract = await ExtractTarGz(fileNamePath, path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES))
            return repoPathExtract
    }
}

const InstallRepository = async ({
    repositoryToInstall,
    ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
    ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
    ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    const {
        repositoryNamespace,
        appsToInstall
    } = repositoryToInstall

    const deployedRepoPath = await DeployRepository({
        repositoryToInstall,
        ECO_DIRPATH_INSTALL_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
    })

    await RegisterRepository({
        namespace : repositoryNamespace, 
        path : path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES, repositoryNamespace), 
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA,
        loggerEmitter
    })
    
    const SUPERVISOR_SOCKET_DIR_PATH = path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR)

    if(appsToInstall){
        for (const appToInstall of appsToInstall) {

            await InstallApplication({
                repositoryNamespace,
                appToInstall,
                ECO_DIRPATH_INSTALL_DATA,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                SUPERVISOR_SOCKET_DIR_PATH
            })
        }
    }
}

const InstallEcosystemByProfile = async ({
    ecosystemDefaults,
    npmDependencies,
    installProfile,
    installationPath,
    loggerEmitter
}) => {

    const { 
        REPOS_CONF_FILENAME_REPOS_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    } = ecosystemDefaults

    const {
        installationDataDir,
        repositoriesToInstall
    } = installProfile

    const ECO_DIRPATH_INSTALL_DATA = ConvertPathToAbsolutPath(installationPath || installationDataDir)

    await InstallEcosystem({
        ecosystemDefaults,
        ECO_DIRPATH_INSTALL_DATA,
        loggerEmitter
    })

    await InstallNodejsDependencies({
        contextPath: path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES),
        dependencies: npmDependencies
    })

    if(repositoriesToInstall){
        for (const repositoryToInstall of repositoriesToInstall) {
            await InstallRepository({
                repositoryToInstall,
                ECO_DIRPATH_INSTALL_DATA,
                ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
                ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
                ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
                REPOS_CONF_FILENAME_REPOS_DATA,
                loggerEmitter
            })
        }
    }
}

module.exports = InstallEcosystemByProfile
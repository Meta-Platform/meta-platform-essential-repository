const path = require("path")
const os = require('os')

const CopyDirectory                 = require("../../copy-directory.lib/src/CopyDirectory")
const DownloadFileFromGoogleDrive   = require("../../download-file.lib/src/DownloadFileFromGoogleDrive")
const ExtractTarGz                  = require("../../extract-tar-gz.lib/src/ExtractTarGz")

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
        case "GITHUB_RELEASE":
    }
}


module.exports = DeployRepository
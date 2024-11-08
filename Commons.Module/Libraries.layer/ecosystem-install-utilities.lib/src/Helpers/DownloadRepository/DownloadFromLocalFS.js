const path = require("path")
const os = require('os')

const CopyDirectory = require("../../../../copy-directory.lib/src/CopyDirectory")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

const DownloadFromLocalFS = (args) => {

    const {
        repositoryNamespace, 
        sourceData,
        destinationRepoPath
    } = args

    const { path: repoPath } = sourceData
    const destinationPath = path.join(destinationRepoPath, repositoryNamespace)
    const sourcePath = ConvertPathToAbsolutPath(repoPath)
    CopyDirectory(sourcePath, destinationPath)
    return destinationPath
}

module.exports = DownloadFromLocalFS

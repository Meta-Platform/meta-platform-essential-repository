const path = require("path")
const os = require('os')

const CopyDirRepository = require("../../../../copy-directory.lib/src/CopyDirRepository")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

const ObtainFromLocalFS = (args) => {

    const {
        repositoryNamespace, 
        sourceData,
        destinationRepoPath
    } = args

    const { path: repoPath } = sourceData
    const destinationPath = path.join(destinationRepoPath, repositoryNamespace)
    const sourcePath = ConvertPathToAbsolutPath(repoPath)
    CopyDirRepository(sourcePath, destinationPath)
    return destinationPath
}

module.exports = ObtainFromLocalFS

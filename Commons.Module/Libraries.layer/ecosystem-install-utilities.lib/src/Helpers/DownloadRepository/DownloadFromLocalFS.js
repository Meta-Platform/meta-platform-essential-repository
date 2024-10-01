const path = require("path")
const os = require('os')

const CopyDirectory = require("../../../../copy-directory.lib/src/CopyDirectory")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

const DownloadFromLocalFS = (repository, destinationRepoPath) => {
    const { namespace, source } = repository
    const { path: repoPath } = source
    const destinationPath = path.join(destinationRepoPath, namespace)
    const sourcePath = ConvertPathToAbsolutPath(repoPath)
    CopyDirectory(sourcePath, destinationPath)
    return destinationPath
}

module.exports = DownloadFromLocalFS

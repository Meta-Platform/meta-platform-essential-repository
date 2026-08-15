import type { LocalFsSource, ObtainRepositoryArgs } from "../../Types"

const path = require("path") as typeof import("path")
const os = require('os') as typeof import('os')

const CopyDirRepository = require("../../../../copy-directory.lib/src/CopyDirRepository") as (source: string, destination: string) => void

const ConvertPathToAbsolutPath = (_path: string): string => path
    .join(_path)
    .replace('~', os.homedir())

const ObtainFromLocalFS = (args: ObtainRepositoryArgs): string => {

    const {
        repositoryNamespace, 
        sourceData,
        destinationRepoPath
    } = args

    const { path: repoPath } = sourceData as LocalFsSource
    const destinationPath = path.join(destinationRepoPath, repositoryNamespace!)
    const sourcePath = ConvertPathToAbsolutPath(repoPath)
    CopyDirRepository(sourcePath, destinationPath)
    return destinationPath
}

module.exports = ObtainFromLocalFS

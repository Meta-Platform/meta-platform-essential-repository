import type { LocalFsSource, ObtainRepositoryArgs } from "../../Types"

const path = require("path") as typeof import("path")

const CopyDirRepository = require("../../../../copy-directory.lib/src/CopyDirRepository") as (source: string, destination: string) => void

const ConvertPathToAbsolutPath = require("../../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/ConvertPathToAbsolutPath") as (path: string) => string

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

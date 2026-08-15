import type { GetRepositoriesFilePathFn } from "../Types"

const { resolve } = require("path") as typeof import("path")

const GetRepositoriesFilePath: GetRepositoriesFilePathFn = ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const filename = REPOS_CONF_FILENAME_REPOS_DATA
    const configPath = installDataDirPath
    const filePath = resolve(configPath, filename)
    return filePath
}

module.exports = GetRepositoriesFilePath

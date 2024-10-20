const { resolve } = require("path")

const GetRepositoriesFilePath = ({
    absolutInstallDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const filename = REPOS_CONF_FILENAME_REPOS_DATA
    const configPath = absolutInstallDataDirPath
    const filePath = resolve(configPath, filename)
    return filePath
}

module.exports = GetRepositoriesFilePath
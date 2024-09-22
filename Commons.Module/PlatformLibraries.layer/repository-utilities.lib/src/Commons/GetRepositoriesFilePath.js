const { resolve } = require("path")

const GetRepositoriesFilePath = ({
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const filename = REPOS_CONF_FILENAME_REPOS_DATA
    const configPath = ECO_DIRPATH_INSTALL_DATA
    const filePath = resolve(configPath, filename)
    return filePath
}

module.exports = GetRepositoriesFilePath
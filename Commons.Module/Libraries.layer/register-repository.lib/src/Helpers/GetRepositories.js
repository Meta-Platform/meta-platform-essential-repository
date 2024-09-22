const { 
    readFile 
} = require('node:fs/promises')

const GetRepositoriesFilePath = require("./GetRepositoriesFilePath")

const GetRepositories = async ({
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const filePath = GetRepositoriesFilePath({
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    const content = await readFile(filePath, { encoding: 'utf8' })
    return JSON.parse(content)
}

module.exports = GetRepositories
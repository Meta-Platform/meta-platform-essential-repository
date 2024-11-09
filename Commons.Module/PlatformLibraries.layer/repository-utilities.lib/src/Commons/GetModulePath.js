const { resolve } = require("path")

const GetRepositoriesPath = require("./GetRepositoriesPath")

const GetModulePath = async ({ 
    namespaceRepo, 
    moduleName,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR
}) => {
    const repoPath = await GetRepositoriesPath({
        namespace: namespaceRepo,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    return resolve(repoPath, `${moduleName}.${REPOS_CONF_EXT_MODULE_DIR}`)
}

module.exports = GetModulePath
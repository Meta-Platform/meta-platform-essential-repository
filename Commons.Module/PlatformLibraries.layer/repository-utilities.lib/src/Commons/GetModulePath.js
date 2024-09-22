const { resolve } = require("path")

const GetRepoPath = require("./GetRepoPath")

const GetModulePath = async ({ 
    namespaceRepo, 
    moduleName,
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA,
    REPOS_CONF_EXT_MODULE_DIR
}) => {
    const repoPath = await GetRepoPath({
        namespace: namespaceRepo,
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    return resolve(repoPath, `${moduleName}.${REPOS_CONF_EXT_MODULE_DIR}`)
}

module.exports = GetModulePath
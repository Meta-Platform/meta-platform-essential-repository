
const ListValidDir = require("./ListValidDir")
const GetRepositoriesPath = require("./GetRepositoriesPath")

const GetModuleNamesByRepo = async ({
    namespace,
    REPOS_CONF_EXT_MODULE_DIR,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const repoPath = await GetRepositoriesPath({
        namespace,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    return await ListValidDir
        .listName({ path:repoPath, ext:REPOS_CONF_EXT_MODULE_DIR})
}

module.exports = GetModuleNamesByRepo
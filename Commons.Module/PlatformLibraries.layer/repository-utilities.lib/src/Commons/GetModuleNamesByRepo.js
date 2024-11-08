
const ListValidDir = require("./ListValidDir")
const GetRepoPath = require("./GetRepoPath")

const GetModuleNamesByRepo = async ({
    namespace,
    REPOS_CONF_EXT_MODULE_DIR,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const repoPath = await GetRepoPath({
        namespace,
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    return await ListValidDir
        .listName({ path:repoPath, ext:REPOS_CONF_EXT_MODULE_DIR})
}

module.exports = GetModuleNamesByRepo
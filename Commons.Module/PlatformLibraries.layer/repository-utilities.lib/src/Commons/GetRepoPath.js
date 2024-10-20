const GetRepositories = require("./GetRepositories")

const GetRepoPath = async ({
    namespace,
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const registeredRepositories = await GetRepositories({
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    const { installationPath } = registeredRepositories[namespace]
    return installationPath
}

module.exports = GetRepoPath
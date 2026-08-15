const GetRepositories = require("../../../../Libraries.layer/repository-config-handler.lib/src/GetRepositories")

const GetRepositoriesPath = async ({
    namespace,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}: {
    namespace: string
    installDataDirPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
}) => {
    const registeredRepositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    const { installationPath } = registeredRepositories[namespace]
    return installationPath
}

module.exports = GetRepositoriesPath
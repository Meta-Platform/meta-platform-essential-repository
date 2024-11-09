const GetRepositories = require("../../../Libraries.layer/repository-config-handler.lib/src/GetRepositories")

const ListRepositories = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
}) => {
    const registeredRepositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })
    const listNamespace = Object.keys(registeredRepositories)
    const listRepositories = listNamespace
        .map(namespace => {
            return { 
                namespace, 
                ...registeredRepositories[namespace] 
            }
        })
    return listRepositories
}

module.exports = ListRepositories
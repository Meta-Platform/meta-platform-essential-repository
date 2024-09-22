const GetRepositories = require("./Commons/GetRepositories")

const ListRepositories = async ({
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA,
}) => {
    const registeredRepositories = await GetRepositories({
        ECO_DIRPATH_INSTALL_DATA,
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
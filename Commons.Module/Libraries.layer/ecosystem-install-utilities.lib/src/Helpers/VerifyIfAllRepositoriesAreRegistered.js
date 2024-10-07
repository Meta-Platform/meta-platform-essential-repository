const FetchInstalledRepositoriesInfo = require("./FetchInstalledRepositoriesInfo")

const VerifyIfAllRepositoriesAreRegistered = async ({
    repositoriesToInstall,
    installationPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {

    const repositoriesInfo = await FetchInstalledRepositoriesInfo({
        installationPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    const namespacesInstalled = Object.keys(repositoriesInfo)

    const areAllRepositoriesRegistered = repositoriesToInstall
        .reduce(async (acc, repositoryToInstall) => {
            if(acc){
                const {
                    repository: { namespace }
                } = repositoryToInstall
                
                return namespacesInstalled.includes(namespace)
            }
            return acc
        }, true)
     return areAllRepositoriesRegistered
}

module.exports = VerifyIfAllRepositoriesAreRegistered
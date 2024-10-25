const FetchInstalledRepositoriesInfo = require("./FetchInstalledRepositoriesInfo")

const VerifyIfAllRepositoriesAreRegistered = async ({
    repositoriesInstallData,
    installationPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {

    const repositoriesInfo = await FetchInstalledRepositoriesInfo({
        installationPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    const namespacesInstalled = Object.keys(repositoriesInfo)

    const areAllRepositoriesRegistered = repositoriesInstallData
        .reduce(async (acc, repositoryInstallData) => {
            if(acc){
                return namespacesInstalled.includes(repositoryInstallData.namespace)
            }
            return acc
        }, true)
     return areAllRepositoriesRegistered
}

module.exports = VerifyIfAllRepositoriesAreRegistered
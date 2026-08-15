import type { Repositories } from "../../../repository-config-handler.lib/src/Types"

const FetchInstalledRepositoriesInfo = require("./FetchInstalledRepositoriesInfo") as (params: { installationPath: string, REPOS_CONF_FILENAME_REPOS_DATA: string }) => Promise<Repositories>

const VerifyIfAllRepositoriesAreRegistered = async ({
    repositoriesInstallData,
    installationPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}: {
    repositoriesInstallData: { namespace: string }[]
    installationPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
}) => {

    const repositoriesInfo = await FetchInstalledRepositoriesInfo({
        installationPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    const namespacesInstalled = Object.keys(repositoriesInfo)

    // O acumulador deste reduce é uma Promise — e Promise é sempre truthy, de
    // modo que o `if(acc)` nunca é falso e o resultado acaba sendo apenas o do
    // ÚLTIMO repositório. Convertido como está: corrigir muda comportamento.
    const areAllRepositoriesRegistered = repositoriesInstallData
        .reduce(async (acc: any, repositoryInstallData) => {
            if(acc){
                return namespacesInstalled.includes(repositoryInstallData.namespace)
            }
            return acc
        }, true)
     return areAllRepositoriesRegistered
}

module.exports = VerifyIfAllRepositoriesAreRegistered
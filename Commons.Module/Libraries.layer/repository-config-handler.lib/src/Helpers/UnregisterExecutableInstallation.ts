import type { GetRepositoriesFn, RepositoriesFileRef, WriteRepositoriesFileJsonFn } from "../Types"

const GetRepositories = require("../GetRepositories") as GetRepositoriesFn
const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson") as WriteRepositoriesFileJsonFn

// Inverso de RegisterExecutableInstallation: remove a entrada de um executável
// da lista installedApplications do repositório no repositories.json.
const UnregisterExecutableInstallation = async ({
    installDataDirPath,
    repositoryNamespace,
    REPOS_CONF_FILENAME_REPOS_DATA,
    executable
}: RepositoriesFileRef & {
    repositoryNamespace: string
    executable: string
}): Promise<void> => {

    const repositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })

    const thisRepo = repositories[repositoryNamespace]

    if(thisRepo){

        const isRegistered =
            !!thisRepo
            .installedApplications
            .find(
                (installedApplicationData) =>
                    installedApplicationData.executable === executable
            )

        if(isRegistered){
            const newRepositories = {
                ...repositories,
                [repositoryNamespace]: {
                    ...thisRepo,
                    installedApplications: thisRepo.installedApplications
                        .filter((installedApplicationData) => installedApplicationData.executable !== executable)
                }
            }
            await WriteRepositoriesFileJson({
                content: newRepositories,
                installDataDirPath,
                REPOS_CONF_FILENAME_REPOS_DATA
            })
            Log.info("UnregisterExecutableInstallation", `O executável ${executable} foi removido do registro de [${repositoryNamespace}]`)
        } else {
            Log.warn("UnregisterExecutableInstallation", `o executável [${executable}] não está registrado em [${repositoryNamespace}]`)
        }

    } else
        throw `O repositório [${repositoryNamespace}] não esta instalado!`
}

module.exports = UnregisterExecutableInstallation

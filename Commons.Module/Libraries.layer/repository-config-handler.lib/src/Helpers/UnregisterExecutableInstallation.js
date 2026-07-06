const GetRepositories = require("../GetRepositories")
const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson")

// Inverso de RegisterExecutableInstallation: remove a entrada de um executável
// da lista installedApplications do repositório no repositories.json.
const UnregisterExecutableInstallation = async ({
    installDataDirPath,
    repositoryNamespace,
    REPOS_CONF_FILENAME_REPOS_DATA,
    executable,
    loggerEmitter
}) => {

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
                REPOS_CONF_FILENAME_REPOS_DATA,
                loggerEmitter
            })
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "UnregisterExecutableInstallation",
                type: "info",
                message: `O executável ${executable} foi removido do registro de [${repositoryNamespace}]`
            })
        } else {
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "UnregisterExecutableInstallation",
                type: "warning",
                message: `o executável [${executable}] não está registrado em [${repositoryNamespace}]`
            })
        }

    } else
        throw `O repositório [${repositoryNamespace}] não esta instalado!`
}

module.exports = UnregisterExecutableInstallation

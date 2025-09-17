const GetRepositories = require("./GetRepositories")
const WriteRepositoriesFileJson = require("./Helpers/WriteRepositoriesFileJson")

const UpdateRepositoryInstallationPath = async ({
    installDataDirPath,
    repositoryNamespace,
    REPOS_CONF_FILENAME_REPOS_DATA,
    deployedRepoPath,
    loggerEmitter
}) => {

    const repositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })

    const thisRepo = repositories[repositoryNamespace]

    if(thisRepo){

        if(deployedRepoPath){
            const newRepositories = {
                ...repositories,
                [repositoryNamespace]: { 
                    ...thisRepo,
                    installationPath: deployedRepoPath
                }
            }
            await WriteRepositoriesFileJson({ 
                content: newRepositories,
                installDataDirPath,
                REPOS_CONF_FILENAME_REPOS_DATA,
                loggerEmitter
            })
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "UpdateRepositoryInstallationPath",
                type: "info",
                message: `O installDataDirPath foi atualizado para [${deployedRepoPath}]`
            })
        } else {
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "UpdateRepositoryInstallationPath",
                type: "error",
                message: `o parâmetro [deployedRepoPath] é inválido [${deployedRepoPath}]`
            })
        }
        
    } else 
        throw `O repositório [${repositoryNamespace}] não esta instalado!`
}

module.exports = UpdateRepositoryInstallationPath
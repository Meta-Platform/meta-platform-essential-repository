const GetRepositories = require("../GetRepositories")
const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson")

const AddNewRepositoryRecordToFile = async ({
    repositoryNamespace,
    sourceData,
    deployedRepoPath, 
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {

    const repositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })

    if(!repositories[repositoryNamespace]){
        const newRepositories = {
            ...repositories,
            [repositoryNamespace]: { 
                installationPath: deployedRepoPath,
                sourceData,
                installedApplications: []
            }
        }
        await WriteRepositoriesFileJson({ 
            content: newRepositories,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "AddNewRepositoryRecordToFile",
            type: "info",
            message: `arquivo de repositórios atualizado com [${repositoryNamespace}] => [${deployedRepoPath}]`
        })
    } else 
        throw `ATENÇÃO: a instalação do repositório [${repositoryNamespace}] já está registrada!`

}

module.exports = AddNewRepositoryRecordToFile
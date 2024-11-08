const GetRepositories = require("./GetRepositories")
const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson")

const UpdateRepositoriesFile = async ({
    repositoryNamespace,
    sourceData,
    deployedRepoPath, 
    installDataDirPath,
    applicationsMetadata,
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
                    installedApplications: applicationsMetadata
                 }
            }
            await WriteRepositoriesFileJson({ 
                content: newRepositories,
                installDataDirPath,
                REPOS_CONF_FILENAME_REPOS_DATA,
                loggerEmitter
            })
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "UpdateRepositoriesFile",
                type: "info",
                message: `arquivo de repositório atualizado com [${repositoryNamespace}] => [${deployedRepoPath}]`
            })
        } else {
            throw `ATENÇÃO: repositório [${repositoryNamespace}] já está registrado!`
        }
}

module.exports = UpdateRepositoriesFile
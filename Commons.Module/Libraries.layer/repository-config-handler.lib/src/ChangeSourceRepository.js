const GetRepositories = require("./GetRepositories")
const WriteRepositoriesFileJson = require("./Helpers/WriteRepositoriesFileJson")

const ChangeSourceRepository = async ({
    repositoryNamespace,
    sourceData,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {

    const repositories = await GetRepositories({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })

    if(repositories[repositoryNamespace]){

        const sourceTypeOld = repositories[repositoryNamespace]?.sourceData?.sourceType

        const newRepositories = {
            ...repositories,
            [repositoryNamespace]: { 
                ...repositories[repositoryNamespace],
                sourceData
            }
        }
        await WriteRepositoriesFileJson({ 
            content: newRepositories,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ChangeSourceRepository",
            type: "info",
            message: `a fonte do repositório [${repositoryNamespace}] foi alterada de [${sourceTypeOld}] para [${sourceData.sourceType}]`
        })
    } else 
        throw `ATENÇÃO: o repositório [${repositoryNamespace}] não esta instalado!`

}

module.exports = ChangeSourceRepository
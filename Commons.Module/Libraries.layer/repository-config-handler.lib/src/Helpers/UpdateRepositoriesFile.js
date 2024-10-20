const GetRepositories = require("./GetRepositories")
const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson")

const UpdateRepositoriesFile = async ({
    namespace, 
    path, 
    absolutInstallDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    const repositories = await GetRepositories({
        absolutInstallDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
    })
        if(!repositories[namespace]){
            const newRepositories = {
                ...repositories,
                [namespace]: { path }
            }
            await WriteRepositoriesFileJson({ 
                content: newRepositories,
                absolutInstallDataDirPath,
                REPOS_CONF_FILENAME_REPOS_DATA,
                loggerEmitter
            })
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "UpdateRepositoriesFile",
                type: "info",
                message: `arquivo de repositório atualizado com [${namespace}] => [${path}]`
            })
        } else {
            throw `ATENÇÃO: repositório [${namespace}] já está registrado!`
        }
}

module.exports = UpdateRepositoriesFile
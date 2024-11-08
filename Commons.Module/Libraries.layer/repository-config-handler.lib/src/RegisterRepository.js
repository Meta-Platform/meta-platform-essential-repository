const PrepareRepositoriesFileJson = require("./PrepareRepositoriesFileJson")
const UpdateRepositoriesFile = require("./Helpers/UpdateRepositoriesFile")

const RegisterRepository = async ({
    repositoryNamespace,
    sourceData,
    applicationsMetadata,
    installDataDirPath,
    deployedRepoPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    try{
        await PrepareRepositoriesFileJson({
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        await UpdateRepositoriesFile({
            repositoryNamespace,
            sourceData,
            deployedRepoPath, 
            applicationsMetadata,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RegisterRepository",
            type: "info",
            message: `repositório [${repositoryNamespace}] registrado com sucesso!`
        })
    } catch(e) {
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RegisterRepository",
            type: "error",
            message: e
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RegisterRepository",
            type: "error",
            message: `Erro ao registrar repositório`
        })
    }
}

module.exports = RegisterRepository
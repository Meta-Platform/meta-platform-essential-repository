const PrepareRepositoriesFileJson = require("./PrepareRepositoriesFileJson")
const AddNewRepositoryRecordToFile = require("./Helpers/AddNewRepositoryRecordToFile")

const RegisterRepositoryInstallation = async ({
    repositoryNamespace,
    sourceData,
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
        await AddNewRepositoryRecordToFile({
            repositoryNamespace,
            sourceData,
            deployedRepoPath,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RegisterRepositoryInstallation",
            type: "info",
            message: `a instalação do repositório [${repositoryNamespace}] registrada com sucesso!`
        })
    } catch(e) {
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RegisterRepositoryInstallation",
            type: "error",
            message: e
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RegisterRepositoryInstallation",
            type: "error",
            message: `Erro ao registrar repositório`
        })
    }
}

module.exports = RegisterRepositoryInstallation
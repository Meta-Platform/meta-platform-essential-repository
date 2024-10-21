const path = require("path")
const PrepareRepositoriesFileJson = require("./PrepareRepositoriesFileJson")
const UpdateRepositoriesFile = require("./Helpers/UpdateRepositoriesFile")

const RegisterRepository = async ({
    repositoryNamespace,
    sourceData,
    appsToInstall,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
    loggerEmitter
}) => {

    const repositoryInstallationPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES, repositoryNamespace)

    try{
        await PrepareRepositoriesFileJson({
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        await UpdateRepositoriesFile({
            repositoryNamespace,
            sourceData,
            repositoryInstallationPath, 
            appsToInstall,
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
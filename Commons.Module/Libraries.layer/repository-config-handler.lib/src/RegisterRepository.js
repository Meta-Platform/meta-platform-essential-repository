
const PrepareRepositoriesFileJson = require("./PrepareRepositoriesFileJson")
const UpdateRepositoriesFile = require("./Helpers/UpdateRepositoriesFile")

const RegisterRepository = async ({
    namespace, 
    //path, 
    installDataDirPath,
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
            namespace, 
            path, 
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RegisterRepository",
            type: "info",
            message: `repositório [${namespace}] registrado com sucesso!`
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
const GetRepositoriesFilePath = require("./GetRepositoriesFilePath")

const WriteObjectToFile = require("../../../json-file-utilities.lib/src/WriteObjectToFile")

const WriteRepositoriesFileJson = async ({ 
    content,
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    const filePath = GetRepositoriesFilePath({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    try{
        await WriteObjectToFile(filePath, content)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "WriteRepositoriesFileJson",
            type: "info",
            message: `Repositórios atualizado com sucesso!`
        })
    } catch(e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "WriteRepositoriesFileJson",
            type: "error",
            message: e
        })
        throw `erro ao escrever arquivo de repositórios ${filePath}!`
    }
}

module.exports = WriteRepositoriesFileJson
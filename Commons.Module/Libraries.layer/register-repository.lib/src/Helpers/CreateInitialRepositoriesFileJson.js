const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson")

const CreateInitialRepositoriesFileJson = async ({
    absolutInstallDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    const initialContent = {} 
    try{
        await WriteRepositoriesFileJson({ 
            content:initialContent,
            absolutInstallDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })

        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "CreateInitialRepositoriesFileJson",
            type: "info",
            message: `arquivo inicial de repositórios criado com sucesso!`
        })
        
    } catch(e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "CreateInitialRepositoriesFileJson",
            type: "error",
            message: e
        })
        thorw `erro ao criar arquivo ${filePath}!`
    }
}

module.exports = CreateInitialRepositoriesFileJson
const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson")

const CreateInitialRepositoriesFileJson = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    const initialContent = {} 
    try{
        await WriteRepositoriesFileJson({ 
            content:initialContent,
            installDataDirPath,
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
    }
}

module.exports = CreateInitialRepositoriesFileJson
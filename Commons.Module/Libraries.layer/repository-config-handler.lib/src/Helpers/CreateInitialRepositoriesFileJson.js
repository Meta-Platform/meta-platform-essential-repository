const WriteRepositoriesFileJson = require("./WriteRepositoriesFileJson")

const CreateInitialRepositoriesFileJson = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const initialContent = {} 
    try{
        await WriteRepositoriesFileJson({ 
            content:initialContent,
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA
        })

        Log.info("CreateInitialRepositoriesFileJson", `arquivo inicial de repositórios criado com sucesso!`)
        
    } catch(e){
        Log.error("CreateInitialRepositoriesFileJson", e)
    }
}

module.exports = CreateInitialRepositoriesFileJson
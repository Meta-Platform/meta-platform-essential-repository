const { 
    stat
} = require('node:fs/promises')

const GetRepositoriesFilePath = require("./GetRepositoriesFilePath")

const VerifyRepoFile = async ({
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA, 
    loggerEmitter
}) => {
    const filePath = GetRepositoriesFilePath({
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    try{
        const stats = await stat(filePath)
        if(stats.isFile()){
            return true
        } else {
            const messageError = `${REPOS_CONF_FILENAME_REPOS_DATA} não é um aquivo`
            reject(messageError)
        }
    } catch (e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "VerifyRepoFile",
            type: "warning",
            message: `${REPOS_CONF_FILENAME_REPOS_DATA} não existe`
        })
        return false
    }
}
module.exports = VerifyRepoFile
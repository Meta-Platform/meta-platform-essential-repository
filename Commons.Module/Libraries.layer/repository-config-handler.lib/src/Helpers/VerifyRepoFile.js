const { 
    stat
} = require('node:fs/promises')

const GetRepositoriesFilePath = require("./GetRepositoriesFilePath")

const VerifyRepoFile = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA, 
    loggerEmitter
}) => {
    const filePath = GetRepositoriesFilePath({
        installDataDirPath,
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
            type: "info",
            message: `${REPOS_CONF_FILENAME_REPOS_DATA} não existe`
        })
        return false
    }
}
module.exports = VerifyRepoFile
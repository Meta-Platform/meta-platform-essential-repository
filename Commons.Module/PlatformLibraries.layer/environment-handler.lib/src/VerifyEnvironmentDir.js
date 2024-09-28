const { stat } = require('node:fs/promises')

const GetEnvironmentPath = require("./GetEnvironmentPath")

const VerifyEnvironmentDir = async ({
    environmentName, 
    localPath,
    loggerEmitter
}) => {
    try{
        const stats = await stat(GetEnvironmentPath(environmentName, localPath))
        if(stats.isDirectory()){
            return true
        } else {
            const messageError = `${environmentName} não é um diretório`
            reject(messageError)
        }
    } catch(e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "VerifyEnvironmentDir",
            type: "info",
            message: `${environmentName} environment não existe`
        })
        return false
    }
}

module.exports = VerifyEnvironmentDir
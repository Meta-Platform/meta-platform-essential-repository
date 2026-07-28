const { stat } = require('node:fs/promises')

const GetEnvironmentPath = require("./GetEnvironmentPath")

const VerifyEnvironmentDir = async ({
    environmentName, 
    localPath
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
        Log.info("VerifyEnvironmentDir", `${environmentName} environment não existe`)
        return false
    }
}

module.exports = VerifyEnvironmentDir
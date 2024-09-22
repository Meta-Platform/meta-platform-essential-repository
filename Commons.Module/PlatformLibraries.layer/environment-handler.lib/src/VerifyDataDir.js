const { stat } = require('node:fs/promises')

const { join } = require("path")

const VerifyDataDir = async ({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, loggerEmitter}) => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES)
    try{
        const stats = await stat(dirpath)
        if(stats.isDirectory()){
            return true
        } else {
            const messageError = `${dirpath} não é um diretório`
            reject(messageError)
        }
    } catch (e){
        if(e.code === "ENOENT"){
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "VerifyDataDir",
                type: "info",
                message: `${dirpath} não existe`
            })
            return false
        } else {
            throw e
        }
    }
}

module.exports = VerifyDataDir
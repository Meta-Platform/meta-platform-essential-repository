const { stat } = require('node:fs/promises')

const { join } = require("path")

const VerifyPackageDependenciesDir = async ({
    environmentPath, 
    packageName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
    loggerEmitter
}) => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, packageName)
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
                sourceName: "VerifyPackageDependenciesDir",
                type: "warning",
                message: `${dirpath} não existe`
            })
            return false
        } else {
            throw e
        }
    }
}

module.exports = VerifyPackageDependenciesDir
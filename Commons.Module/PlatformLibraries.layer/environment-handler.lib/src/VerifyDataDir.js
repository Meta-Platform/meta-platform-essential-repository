const { stat } = require('node:fs/promises')

const { join } = require("path")

const VerifyDataDir = async ({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES}) => {
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
            Log.info("VerifyDataDir", `${dirpath} não existe`)
            return false
        } else {
            throw e
        }
    }
}

module.exports = VerifyDataDir
const { stat } = require('node:fs/promises')

const VerifyDirExit = async (dirpath) => {
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
            return false
        } else {
            throw e
        }
    }
}

module.exports = VerifyDirExit
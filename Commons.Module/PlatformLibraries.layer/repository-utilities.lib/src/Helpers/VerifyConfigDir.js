const { 
    stat
} = require('node:fs/promises')


const VerifyConfigDir = async ({ECO_DIRPATH_INSTALL_DATA, loggerEmitter}) => {
    const [ filename ] = ECO_DIRPATH_INSTALL_DATA.split("/").slice(-1)
    try{
        const stats = await stat(ECO_DIRPATH_INSTALL_DATA)
        if(stats.isDirectory()){
            return true
        } else {
            const messageError = `${filename} não é um diretório`
            reject(messageError)
        }
    } catch (e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "VerifyConfigDir",
            type: "warning",
            message: `${filename} não existe`
        })
        return false
    }
}

module.exports = VerifyConfigDir
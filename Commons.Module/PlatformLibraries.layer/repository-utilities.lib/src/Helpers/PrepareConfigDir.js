const VerifyConfigDir = require("./VerifyConfigDir")
const CreateConfigDir = require("./CreateConfigDir")

const PrepareConfigDir = async ({ECO_DIRPATH_INSTALL_DATA, loggerEmitter}) =>{
    const configDirExit = await VerifyConfigDir({ECO_DIRPATH_INSTALL_DATA, loggerEmitter})
    if(configDirExit){
        return
    } else {
        await CreateConfigDir({ECO_DIRPATH_INSTALL_DATA, loggerEmitter})
        await PrepareConfigDir({ECO_DIRPATH_INSTALL_DATA, loggerEmitter})
    }
}

module.exports = PrepareConfigDir
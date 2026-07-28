const VerifyConfigDir = require("./VerifyConfigDir")
const CreateConfigDir = require("./CreateConfigDir")

const PrepareConfigDir = async ({ECO_DIRPATH_INSTALL_DATA}) =>{
    const configDirExit = await VerifyConfigDir({ECO_DIRPATH_INSTALL_DATA})
    if(configDirExit){
        return
    } else {
        await CreateConfigDir({ECO_DIRPATH_INSTALL_DATA})
        await PrepareConfigDir({ECO_DIRPATH_INSTALL_DATA})
    }
}

module.exports = PrepareConfigDir
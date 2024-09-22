const VerifyDataDir = require("./VerifyDataDir")
const CreateDataDir = require("./CreateDataDir")

const PrepareDataDir = async ({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, loggerEmitter}) => {
    const configDirExit = await VerifyDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
    if(configDirExit){
        return
    } else {
        await CreateDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, loggerEmitter})
        await PrepareDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, loggerEmitter})
    }
}

module.exports = PrepareDataDir
const VerifyDataDir = require("./VerifyDataDir")
const CreateDataDir = require("./CreateDataDir")

const PrepareDataDir = async ({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES}) => {
    const configDirExit = await VerifyDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
    if(configDirExit){
        return
    } else {
        await CreateDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
        await PrepareDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
    }
}

module.exports = PrepareDataDir
type DataDirRef = { environmentPath: string, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: string }

const VerifyDataDir = require("./VerifyDataDir") as (ref: DataDirRef) => Promise<boolean>
const CreateDataDir = require("./CreateDataDir") as (ref: DataDirRef) => Promise<void>

const PrepareDataDir = async ({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES}: DataDirRef): Promise<void> => {
    const configDirExit = await VerifyDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
    if(configDirExit){
        return
    } else {
        await CreateDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
        await PrepareDataDir({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
    }
}

module.exports = PrepareDataDir
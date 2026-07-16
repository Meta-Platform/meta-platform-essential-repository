const CreatePackageDependenciesDir = require("./CreatePackageDependenciesDir")
const VerifyPackageDependenciesDir = require("./VerifyPackageDependenciesDir")

const PreparePackageDependenciesDir = async ({
    environmentPath, 
    packageName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
    loggerEmitter
}) => {
    const configDirExit = await VerifyPackageDependenciesDir({
        environmentPath, 
        packageName,
        EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
        loggerEmitter
    })
    if(configDirExit){
        return
    } else {
        await CreatePackageDependenciesDir({
            environmentPath, 
            packageName,
            EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
            loggerEmitter
        })
        await PreparePackageDependenciesDir({
            environmentPath, 
            packageName,
            EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
            loggerEmitter
        })
    }
}

module.exports = PreparePackageDependenciesDir
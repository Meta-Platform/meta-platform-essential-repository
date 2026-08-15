const CreatePackageDependenciesDir = require("./CreatePackageDependenciesDir")
const VerifyPackageDependenciesDir = require("./VerifyPackageDependenciesDir")

const PreparePackageDependenciesDir = async ({
    environmentPath, 
    packageName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}: {
    environmentPath: string
    packageName: any
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: any
}) => {
    const configDirExit = await VerifyPackageDependenciesDir({
        environmentPath, 
        packageName,
        EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
    })
    if(configDirExit){
        return
    } else {
        await CreatePackageDependenciesDir({
            environmentPath, 
            packageName,
            EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
        })
        await PreparePackageDependenciesDir({
            environmentPath, 
            packageName,
            EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
        })
    }
}

module.exports = PreparePackageDependenciesDir
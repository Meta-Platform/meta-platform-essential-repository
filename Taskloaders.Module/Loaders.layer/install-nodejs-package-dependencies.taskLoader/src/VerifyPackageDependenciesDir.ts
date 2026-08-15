const { join } = require("path") as typeof import("path")

const DirectoryExists = require("../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/DirectoryExists") as (dirPath: string) => Promise<boolean>

const VerifyPackageDependenciesDir = async ({
    environmentPath, 
    packageName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}: {
    environmentPath: string
    packageName: string
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: string
}): Promise<boolean> => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, packageName)

    const exists = await DirectoryExists(dirpath)

    if(!exists)
        Log.info("VerifyPackageDependenciesDir", `${dirpath} não existe`)

    return exists
}

module.exports = VerifyPackageDependenciesDir

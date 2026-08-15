const GetEnvironmentPath = require("./GetEnvironmentPath") as (environmentName: string, localPath: string) => string
const DirectoryExists = require("../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/DirectoryExists") as (dirPath: string) => Promise<boolean>

const VerifyEnvironmentDir = async ({
    environmentName, 
    localPath
}: {
    environmentName: string
    localPath: string
}): Promise<boolean> => {
    const exists = await DirectoryExists(GetEnvironmentPath(environmentName, localPath))

    if(!exists)
        Log.info("VerifyEnvironmentDir", `${environmentName} environment não existe`)

    return exists
}

module.exports = VerifyEnvironmentDir

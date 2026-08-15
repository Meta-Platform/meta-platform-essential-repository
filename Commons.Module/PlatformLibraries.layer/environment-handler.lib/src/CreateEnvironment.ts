const PrepareEnvironmentDir = require("./PrepareEnvironmentDir") as (params: { environmentName: string, localPath: string, LOG_CONF_DIRNAME_LOGS?: string }) => Promise<void>
const GetEnvironmentPath = require("./GetEnvironmentPath") as (environmentName: string, localPath: string) => string

const CreateEnvironment = async ({
    environmentName, 
    localPath
}: {
    environmentName: string
    localPath: string
}): Promise<string> => {
    try{
        await PrepareEnvironmentDir({
            environmentName, 
            localPath
        })
        return GetEnvironmentPath(environmentName, localPath)
    }catch(e){
        Log.error("CreateEnvironment", e)
        Log.error("CreateEnvironment", e)
        Log.error("CreateEnvironment", `Erro ao criar ${environmentName} environment`)
        throw e
    }
}

module.exports = CreateEnvironment
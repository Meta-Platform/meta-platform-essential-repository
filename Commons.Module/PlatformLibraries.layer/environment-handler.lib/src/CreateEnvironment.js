const PrepareEnvironmentDir = require("./PrepareEnvironmentDir")
const GetEnvironmentPath = require("./GetEnvironmentPath")

const CreateEnvironment = async ({
    environmentName, 
    localPath
}) => {
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
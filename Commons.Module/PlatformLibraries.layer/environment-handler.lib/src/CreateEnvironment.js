const PrepareEnvironmentDir = require("./PrepareEnvironmentDir")
const GetEnvironmentPath = require("./GetEnvironmentPath")

const CreateEnvironment = async ({
    environmentName, 
    localPath,
    loggerEmitter
}) => {
    try{
        await PrepareEnvironmentDir({
            environmentName, 
            localPath,
            loggerEmitter
        })
        return GetEnvironmentPath(environmentName, localPath)
    }catch(e){
        console.log(e)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "CreateEnvironment",
            type: "error",
            message: e
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "CreateEnvironment",
            type: "error",
            message: `Erro ao criar ${environmentName} environment`
        })
        throw e
    }
}

module.exports = CreateEnvironment
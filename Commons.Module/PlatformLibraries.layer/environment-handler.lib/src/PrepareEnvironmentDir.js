const VerifyEnvironmentDir = require("./VerifyEnvironmentDir")
const CreateEnvironmentDir = require("./CreateEnvironmentDir")

const PrepareEnvironmentDir = async ({
    environmentName, 
    localPath,
    loggerEmitter
}) => {
    const environmentDirExit = await VerifyEnvironmentDir({
        environmentName, 
        localPath,
        loggerEmitter
    })
    if(environmentDirExit){
        return
    } else {
        await CreateEnvironmentDir({
            environmentName, 
            localPath,
            loggerEmitter
        })
    }
}

module.exports = PrepareEnvironmentDir
const VerifyEnvironmentDir = require("./VerifyEnvironmentDir")
const CreateEnvironmentDir = require("./CreateEnvironmentDir")

const PrepareEnvironmentDir = async ({
    environmentName, 
    localPath
}) => {
    const environmentDirExit = await VerifyEnvironmentDir({
        environmentName, 
        localPath
    })
    if(environmentDirExit){
        return
    } else {
        await CreateEnvironmentDir({
            environmentName, 
            localPath
        })
    }
}

module.exports = PrepareEnvironmentDir
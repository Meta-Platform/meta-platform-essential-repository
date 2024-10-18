
const VerifyRepoFile = require("./Helpers/VerifyRepoFile")
const CreateInitialRepositoriesFileJson = require("./Helpers/CreateInitialRepositoriesFileJson")

const PrepareRepositoriesFileJson = async ({
    absolutInstallDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    
    const repofileExit = await VerifyRepoFile({
        absolutInstallDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        loggerEmitter
    })
    if(repofileExit){
        return
    } else {
        await CreateInitialRepositoriesFileJson({
            absolutInstallDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        await PrepareRepositoriesFileJson({
            absolutInstallDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
    }
}

module.exports = PrepareRepositoriesFileJson
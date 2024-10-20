
const VerifyRepoFile = require("./Helpers/VerifyRepoFile")
const CreateInitialRepositoriesFileJson = require("./Helpers/CreateInitialRepositoriesFileJson")

const PrepareRepositoriesFileJson = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    
    const repofileExit = await VerifyRepoFile({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA,
        loggerEmitter
    })
    if(repofileExit){
        return
    } else {
        await CreateInitialRepositoriesFileJson({
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        await PrepareRepositoriesFileJson({
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
    }
}

module.exports = PrepareRepositoriesFileJson
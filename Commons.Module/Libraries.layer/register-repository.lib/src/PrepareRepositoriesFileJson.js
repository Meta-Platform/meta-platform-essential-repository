
const VerifyRepoFile = require("./Helpers/VerifyRepoFile")
const CreateInitialRepositoriesFileJson = require("./Helpers/CreateInitialRepositoriesFileJson")

const PrepareRepositoriesFileJson = async ({
    ECO_DIRPATH_INSTALL_DATA,
    REPOS_CONF_FILENAME_REPOS_DATA,
    loggerEmitter
}) => {
    
    const repofileExit = await VerifyRepoFile({
        ECO_DIRPATH_INSTALL_DATA,
        REPOS_CONF_FILENAME_REPOS_DATA,
        loggerEmitter
    })
    if(repofileExit){
        return
    } else {
        await CreateInitialRepositoriesFileJson({
            ECO_DIRPATH_INSTALL_DATA,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
        await PrepareRepositoriesFileJson({
            ECO_DIRPATH_INSTALL_DATA,
            REPOS_CONF_FILENAME_REPOS_DATA,
            loggerEmitter
        })
    }
}

module.exports = PrepareRepositoriesFileJson
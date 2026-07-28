
const VerifyRepoFile = require("./Helpers/VerifyRepoFile")
const CreateInitialRepositoriesFileJson = require("./Helpers/CreateInitialRepositoriesFileJson")

const PrepareRepositoriesFileJson = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    
    const repofileExit = await VerifyRepoFile({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    if(repofileExit){
        return
    } else {
        await CreateInitialRepositoriesFileJson({
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA
        })
        await PrepareRepositoriesFileJson({
            installDataDirPath,
            REPOS_CONF_FILENAME_REPOS_DATA
        })
    }
}

module.exports = PrepareRepositoriesFileJson
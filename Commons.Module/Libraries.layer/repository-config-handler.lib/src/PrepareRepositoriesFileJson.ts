import type { PrepareRepositoriesFileJsonFn, VerifyRepoFileFn } from "./Types"

const VerifyRepoFile = require("./Helpers/VerifyRepoFile") as VerifyRepoFileFn
const CreateInitialRepositoriesFileJson = require("./Helpers/CreateInitialRepositoriesFileJson") as PrepareRepositoriesFileJsonFn

const PrepareRepositoriesFileJson: PrepareRepositoriesFileJsonFn = async ({
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

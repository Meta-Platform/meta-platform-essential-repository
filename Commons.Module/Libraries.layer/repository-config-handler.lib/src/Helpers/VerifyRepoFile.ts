import type { GetRepositoriesFilePathFn, VerifyRepoFileFn } from "../Types"

const GetRepositoriesFilePath = require("./GetRepositoriesFilePath") as GetRepositoriesFilePathFn
const FileExists = require("../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/FileExists") as (filePath: string) => Promise<boolean>

const VerifyRepoFile: VerifyRepoFileFn = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const filePath = GetRepositoriesFilePath({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    const exists = await FileExists(filePath)

    if(!exists)
        Log.info("VerifyRepoFile", `${REPOS_CONF_FILENAME_REPOS_DATA} não existe`)

    return exists
}
module.exports = VerifyRepoFile

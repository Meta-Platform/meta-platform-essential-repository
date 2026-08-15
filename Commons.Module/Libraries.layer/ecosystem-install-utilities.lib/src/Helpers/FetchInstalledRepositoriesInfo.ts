import type { Repositories } from "../../../repository-config-handler.lib/src/Types"

const path = require("path") as typeof import("path")

const ReadJsonFile = require("../../../json-file-utilities.lib/src/ReadJsonFile") as (path: string) => any

const FetchInstalledRepositoriesInfo = async ({
    installationPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}: {
    installationPath: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
}): Promise<Repositories> => {
    const filePath = path.resolve(installationPath, REPOS_CONF_FILENAME_REPOS_DATA)
    const repositoriesData = await ReadJsonFile(filePath)
    return repositoriesData
}

module.exports = FetchInstalledRepositoriesInfo
const path = require("path")

const ReadJsonFile = require("../../../json-file-utilities.lib/src/ReadJsonFile")

const FetchInstalledRepositoriesInfo = async ({
    installationPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const filePath = path.resolve(installationPath, REPOS_CONF_FILENAME_REPOS_DATA)
    const repositoriesData = await ReadJsonFile(filePath)
    return repositoriesData
}

module.exports = FetchInstalledRepositoriesInfo
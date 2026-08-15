const colors = require("colors")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const ListInstalledRepositoriesCommand = async ({
    startupParams,
    params 
}: {
    startupParams: any
    params: any
}) => {
    
    const {
        ecosystemInstallUtilitiesLib
    } = params

    const FetchInstalledRepositoriesInfo = ecosystemInstallUtilitiesLib.require("Helpers/FetchInstalledRepositoriesInfo")
    
    const { REPOS_CONF_FILENAME_REPOS_DATA } = ECOSYSTEM_DEFAULTS

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const repositoriesInfo = await FetchInstalledRepositoriesInfo({
        installationPath: installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    let count = 1
    Object.keys(repositoriesInfo)
    .forEach((repositoryNamespace: string) => {
        Log.message("ListInstalledRepositories", `\t${count++}. ${colors.bold(repositoryNamespace)}`) 
    })
}

module.exports = ListInstalledRepositoriesCommand
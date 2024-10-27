const colors = require("colors")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ListInstalledRepositoriesCommand = async ({ 
    startupParams,
    params 
}) => {
    
    const {
        ecosystemInstallUtilitiesLib
    } = params

    const FetchInstalledRepositoriesInfo = ecosystemInstallUtilitiesLib.require("Helpers/FetchInstalledRepositoriesInfo")
    
    const { REPOS_CONF_FILENAME_REPOS_DATA } = ECOSYSTEM_DEFAULTS

    const { installDataDirPath } = startupParams

    const repositoriesInfo = await FetchInstalledRepositoriesInfo({
        installationPath: installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    let count = 1
    Object.keys(repositoriesInfo)
    .forEach((repositoryNamespace) => {
        console.log(`\t${count++}. ${colors.bold(repositoryNamespace)}`) 
    })
}

module.exports = ListInstalledRepositoriesCommand
const colors = require("colors")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ShowRepositoryDetailsCommand = async ({ 
    args, 
    startupParams,
    params
 }) => {
    
    const {
        ecosystemInstallUtilitiesLib
    } = params

    const FetchInstalledRepositoriesInfo = ecosystemInstallUtilitiesLib.require("Helpers/FetchInstalledRepositoriesInfo")

    const { REPOS_CONF_FILENAME_REPOS_DATA } = ECOSYSTEM_DEFAULTS

    const { repositoryNamespace } = args

    const { installDataDirPath } = startupParams

    const repositoriesInfo = await FetchInstalledRepositoriesInfo({
        installationPath: installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    const infoDetails = repositoriesInfo[repositoryNamespace]
    const { sourceData } = infoDetails
    console.log(` ${colors.underline.bold(repositoryNamespace)}\n`)

    const paramsNameList = Object.keys(sourceData)

    paramsNameList.forEach((paramName) => {
        const paramValueRender = paramName !== "sourceType" ? colors.dim(sourceData[paramName]) : colors.bold(sourceData[paramName])
        console.log(`\t${colors.italic(paramName.padEnd(15))} ${colors.bold("->")} ${paramValueRender}`)
    })
}

module.exports = ShowRepositoryDetailsCommand
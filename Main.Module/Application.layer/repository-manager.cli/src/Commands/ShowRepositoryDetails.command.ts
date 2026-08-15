const colors = require("colors")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const ShowRepositoryDetailsCommand = async ({ 
    args, 
    startupParams,
    params
 }: {
    args: any
    startupParams: any
    params: any
 }) => {
    
    const {
        ecosystemInstallUtilitiesLib
    } = params

    const FetchInstalledRepositoriesInfo = ecosystemInstallUtilitiesLib.require("Helpers/FetchInstalledRepositoriesInfo")

    const { REPOS_CONF_FILENAME_REPOS_DATA } = ECOSYSTEM_DEFAULTS

    const { repositoryNamespace } = args

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const repositoriesInfo = await FetchInstalledRepositoriesInfo({
        installationPath: installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })

    const infoDetails = repositoriesInfo[repositoryNamespace]
    const { sourceData } = infoDetails
    Log.message("ShowRepositoryDetails", `${colors.underline.bold(repositoryNamespace)}`)

    const paramsNameList = Object.keys(sourceData)

    paramsNameList.forEach((paramName: any) => {
        const paramValueRender = paramName !== "sourceType" ? colors.dim(sourceData[paramName]) : colors.bold(sourceData[paramName])
        Log.message("ShowRepositoryDetails", `  ${colors.italic(paramName.padEnd(15))} ${colors.bold("->")} ${paramValueRender}`)
    })
}

module.exports = ShowRepositoryDetailsCommand
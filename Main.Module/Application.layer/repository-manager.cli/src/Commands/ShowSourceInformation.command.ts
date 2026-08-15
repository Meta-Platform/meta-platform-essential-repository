const colors = require("colors")
const { resolve } = require("path")
const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const ShowSourceInformationCommand = async ({
    startupParams,
    params
}: {
    startupParams: any
    params: any
}) => {  

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ECOSYSTEM_DEFAULTS

    const {
        jsonFileUtilitiesLib
    } = params

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const ReadJsonFile = jsonFileUtilitiesLib.require("ReadJsonFile")

    const sourcePath = resolve(installDataDirPath, REPOS_CONF_FILENAME_SOURCE_DATA)
    const sourcesDataInformation = await ReadJsonFile(sourcePath)

    Object.entries(sourcesDataInformation)
        .forEach(([repositoryNamespace, sources]: [string, any]) => {

            Log.message("ShowSourceInformation", `${colors.underline.bold(repositoryNamespace)}`)

            sources.forEach((source: any, index: any) => {
                const paramsNameList = Object.keys(source)
                paramsNameList.forEach((paramName: any) => {

                    if(paramName === "sourceType" )
                        Log.message("ShowSourceInformation", `   ${colors.bold(source[paramName])}`)

                    if(paramName !== "sourceType" )
                        Log.message("ShowSourceInformation", `\t${colors.dim(paramName.padEnd(15))} -> ${colors.dim.italic(source[paramName])}`)

                })
            })
            Log.message("ShowSourceInformation", "")

        })
}

module.exports = ShowSourceInformationCommand
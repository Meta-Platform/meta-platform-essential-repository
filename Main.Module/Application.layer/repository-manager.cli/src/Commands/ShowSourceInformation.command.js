const colors = require("colors")
const { resolve } = require("path")
const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const ShowSourceInformationCommand = async ({
    startupParams,
    params
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
        .forEach(([repositoryNamespace, sources]) => {

            console.log(`${colors.underline.bold(repositoryNamespace)}`)

            sources.forEach((source, index) => {
                const paramsNameList = Object.keys(source)
                paramsNameList.forEach((paramName) => {

                    if(paramName === "sourceType" )
                        console.log(`   ${colors.bold(source[paramName])}`)

                    if(paramName !== "sourceType" )
                        console.log(`\t${colors.dim(paramName.padEnd(15))} -> ${colors.dim.italic(source[paramName])}`)

                })
            })
            console.log("")

        })
}

module.exports = ShowSourceInformationCommand
const colors = require("colors")
const { resolve } = require("path")
const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const ListSourcesCommand = async ({
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

    let count = 1
    Object.entries(sourcesDataInformation)
    .forEach(([repositoryNamespace, sources]) => {
        sources.forEach((source) => {
            console.log(`\t${count++}. ${colors.bold(repositoryNamespace.padEnd(15))} ${colors.bold("->")} ${source["sourceType"]}`) 
        })  
    })
}

module.exports = ListSourcesCommand
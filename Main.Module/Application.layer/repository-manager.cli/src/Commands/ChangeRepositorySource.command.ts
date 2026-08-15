const path = require("path")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const ExtractSourceData = require("../Helpers/ExtractSourceData")

const ChangeRepositorySourceCommand = async ({
    args, 
    startupParams,
    params
}: {
    args: any
    startupParams: any
    params: any
}) => {

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ECOSYSTEM_DEFAULTS

    const {
        ecosystemInstallUtilitiesLib,
        jsonFileUtilitiesLib
    } = params

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const ChangeRepositorySource = ecosystemInstallUtilitiesLib.require("ChangeRepositorySource")
    const ReadJsonFile = jsonFileUtilitiesLib.require("ReadJsonFile")

    const { 
        repositoryNamespace,
        sourceType
    } = args
    
    const sourcePath = path.resolve(installDataDirPath, REPOS_CONF_FILENAME_SOURCE_DATA)
    const sourcesDataInformation = await ReadJsonFile(sourcePath)

    const sourceData = ExtractSourceData({
        repositoryNamespace,
        sourceType,
        sourcesDataInformation
    })

    await ChangeRepositorySource({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        ecosystemDefaults: ECOSYSTEM_DEFAULTS
    })


}

module.exports = ChangeRepositorySourceCommand
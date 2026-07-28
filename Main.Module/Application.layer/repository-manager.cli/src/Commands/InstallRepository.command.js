const path = require("path")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const ExtractSourceData = require("../Helpers/ExtractSourceData")

const InstallRepositoryCommand = async ({ 
    args, 
    startupParams,
    params
}) => {

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ECOSYSTEM_DEFAULTS

    const {
        ecosystemInstallUtilitiesLib,
        jsonFileUtilitiesLib
    } = params

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const InstallRepository = ecosystemInstallUtilitiesLib.require("InstallRepository")
    const ReadJsonFile = jsonFileUtilitiesLib.require("ReadJsonFile")

    const { 
        repositoryNamespace,
        sourceType,
        executables
    } = args
    
    const sourcePath = path.resolve(installDataDirPath, REPOS_CONF_FILENAME_SOURCE_DATA)
    const sourcesDataInformation = await ReadJsonFile(sourcePath)

    const sourceData = ExtractSourceData({
        repositoryNamespace,
        sourceType,
        sourcesDataInformation
    })

    await InstallRepository({
        repositoryNamespace,
        sourceData,
        executablesToInstall: executables,
        installDataDirPath,
        ecosystemDefaults: ECOSYSTEM_DEFAULTS
    })
    
}

module.exports = InstallRepositoryCommand
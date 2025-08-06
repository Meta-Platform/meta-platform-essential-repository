const EventEmitter = require('node:events')
const path = require("path")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const InstallRepositoryCommand = async ({ 
    args, 
    startupParams,
    params
}) => {

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ECOSYSTEM_DEFAULTS

    const {
        ecosystemInstallUtilitiesLib,
        jsonFileUtilitiesLib,
        printDataLogLib
    } = params

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const InstallRepository = ecosystemInstallUtilitiesLib.require("InstallRepository")
    const PrintDataLog = printDataLogLib.require("PrintDataLog")
    const ReadJsonFile = jsonFileUtilitiesLib.require("ReadJsonFile")

    const { 
        repositoryNamespace,
        sourceType,
        executables
    } = args
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "InstallRepositoryCommand"))

    const sourcePath = path.resolve(installDataDirPath, REPOS_CONF_FILENAME_SOURCE_DATA)
    const sourcesDataInformation = await ReadJsonFile(sourcePath)

    const sourcesList = sourcesDataInformation[repositoryNamespace]
    const sourceData = sourcesList.find((sourceData) => sourceData.sourceType === sourceType)

    await InstallRepository({
        repositoryNamespace,
        sourceData,
        executablesToInstall: executables,
        installDataDirPath,
        ecosystemDefaults: ECOSYSTEM_DEFAULTS,
        loggerEmitter
    })
    
}

module.exports = InstallRepositoryCommand
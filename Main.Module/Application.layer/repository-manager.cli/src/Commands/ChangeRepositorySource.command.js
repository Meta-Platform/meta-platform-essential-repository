const EventEmitter = require('node:events')
const path = require("path")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const ExtractSourceData = require("../Helpers/ExtractSourceData")

const ChangeRepositorySourceCommand = async ({ 
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

    const ChangeRepositorySource = ecosystemInstallUtilitiesLib.require("ChangeRepositorySource")
    const PrintDataLog = printDataLogLib.require("PrintDataLog")
    const ReadJsonFile = jsonFileUtilitiesLib.require("ReadJsonFile")

    const { 
        repositoryNamespace,
        sourceType
    } = args
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "ChangeRepositorySourceCommand"))

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
        ecosystemDefaults: ECOSYSTEM_DEFAULTS,
        loggerEmitter
    })


}

module.exports = ChangeRepositorySourceCommand
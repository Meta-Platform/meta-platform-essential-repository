const os = require('os')
const { resolve } = require("path")
const EventEmitter = require('node:events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

const UpdateRepositoryCommand = async ({ args, startupParams, params }) => {

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ECOSYSTEM_DEFAULTS

    const {
        ecosystemInstallUtilitiesLib,
        jsonFileUtilitiesLib,
        printDataLogLib
    } = params

    const UpdateRepository = ecosystemInstallUtilitiesLib.require("UpdateRepository")
    const PrintDataLog = printDataLogLib.require("PrintDataLog")   
    const ReadJsonFile = jsonFileUtilitiesLib.require("ReadJsonFile") 

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const sourcePath = resolve(installDataDirPath, REPOS_CONF_FILENAME_SOURCE_DATA)
    const sourcesDataInformation = await ReadJsonFile(sourcePath)

    const { 
        repositoryNamespace,
        sourceType 
    } = args
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "UpdateRepositoryCommand"))

    const sourcesList = sourcesDataInformation[repositoryNamespace]
    const sourceData = sourcesList.find((sourceData) => sourceData.sourceType === sourceType)

    await UpdateRepository({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        ecosystemDefaults: ECOSYSTEM_DEFAULTS,
        loggerEmitter
    })
    
}

module.exports = UpdateRepositoryCommand
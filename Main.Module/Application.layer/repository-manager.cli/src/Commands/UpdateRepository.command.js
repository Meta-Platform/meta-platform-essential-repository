const EventEmitter = require('node:events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const REPOSITORY_SOURCES = require("../Configs/repository-sources.json")

const UpdateRepositoryCommand = async ({ args, startupParams  }) => {

    const {
        ecosystemInstallUtilitiesLib,
        printDataLogLib
    } = params

    const UpdateRepository = ecosystemInstallUtilitiesLib.require("UpdateRepository")
    const PrintDataLog = printDataLogLib.require("PrintDataLog")    

    const { installDataDirPath } = startupParams

    const { 
        repositoryNamespace,
        sourceType 
    } = args
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "UpdateRepositoryCommand"))

    const sourcesList = REPOSITORY_SOURCES[repositoryNamespace]
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
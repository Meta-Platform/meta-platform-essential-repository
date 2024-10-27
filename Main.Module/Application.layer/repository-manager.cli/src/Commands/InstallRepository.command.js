const EventEmitter = require('node:events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const REPOSITORY_SOURCES = require("../Configs/repository-sources.json")

const InstallRepositoryCommand = async ({ 
    args, 
    startupParams,
    params
}) => {

    const {
        ecosystemInstallUtilitiesLib,
        printDataLogLib
    } = params

    const InstallRepository = ecosystemInstallUtilitiesLib.require("InstallRepository")
    const PrintDataLog = printDataLogLib.require("PrintDataLog")    

    const { installDataDirPath } = startupParams

    const { 
        repositoryNamespace,
        sourceType 
    } = args
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "InstallRepositoryCommand"))

    const sourcesList = REPOSITORY_SOURCES[repositoryNamespace]
    const sourceData = sourcesList.find((sourceData) => sourceData.sourceType === sourceType)

    await InstallRepository({
        repositoryNamespace,
        sourceData,
        installDataDirPath,
        ecosystemDefaults: ECOSYSTEM_DEFAULTS,
        loggerEmitter
    })
    
}

module.exports = InstallRepositoryCommand
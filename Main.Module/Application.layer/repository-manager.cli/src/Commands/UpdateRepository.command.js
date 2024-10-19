const EventEmitter = require('node:events')

const UpdateRepository = require("../../../../../Commons.Module/Libraries.layer/ecosystem-install-utilities.lib/src/UpdateRepository")
const PrintDataLog = require("../../../../../Commons.Module/Libraries.layer/print-data-log.lib/src/PrintDataLog")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const REPOSITORY_SOURCES = require("../Configs/repository-sources.json")

const UpdateRepositoryCommand = async ({ args, startupParams  }) => {

    const { absolutInstallDataDirPath } = startupParams

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
        absolutInstallDataDirPath,
        ecosystemDefaults: ECOSYSTEM_DEFAULTS,
        loggerEmitter
    })
    
}

module.exports = UpdateRepositoryCommand
const EventEmitter = require('node:events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const UpdateRepositoryCommand = async ({ args, startupParams, params }) => {

    const {
        ecosystemInstallUtilitiesLib,
        printDataLogLib
    } = params

    const UpdateRepository = ecosystemInstallUtilitiesLib.require("UpdateRepository")
    const PrintDataLog = printDataLogLib.require("PrintDataLog")   

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const { 
        repositoryNamespace
    } = args
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "UpdateRepositoryCommand"))

    await UpdateRepository({
        repositoryNamespace,
        installDataDirPath,
        ecosystemDefaults: ECOSYSTEM_DEFAULTS,
        loggerEmitter
    })
    
}

module.exports = UpdateRepositoryCommand
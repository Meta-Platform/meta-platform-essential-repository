const EventEmitter = require('node:events')
const { resolve } = require("path")
const colors = require("colors")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const VerifySourceIsRegistered = require("../Helpers/VerifySourceIsRegistered")

const RemoveSourceCommand = async ({ 
    args, 
    startupParams,
    params
}) => {

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ECOSYSTEM_DEFAULTS

    const { installDataDirPath } = startupParams

    const {
        jsonFileUtilitiesLib,
        printDataLogLib
    } = params

    const loggerEmitter = new EventEmitter()

    const PrintDataLog = printDataLogLib.require("PrintDataLog")
        loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "RemoveSourceCommand"))
    try{

        const WriteObjectToFile = jsonFileUtilitiesLib.require("WriteObjectToFile")
        const ReadJsonFile = jsonFileUtilitiesLib.require("ReadJsonFile")
        const {
            repositoryNamespace,
            sourceType
        } = args
    
        const sourceFilePath = resolve(installDataDirPath, REPOS_CONF_FILENAME_SOURCE_DATA)
        const sourcesDataInformation = await ReadJsonFile(sourceFilePath)

        const isSourceRegistered = VerifySourceIsRegistered({ repositoryNamespace, sourceType, sourcesDataInformation })

        if(isSourceRegistered){

            const filteredSources = sourcesDataInformation[repositoryNamespace]
             .filter(({sourceType:_sourceType}) => sourceType !== _sourceType)

            const newSourcesDataInformation = {
                ...sourcesDataInformation,
                [repositoryNamespace]: filteredSources
            }
            await WriteObjectToFile(sourceFilePath, newSourcesDataInformation)
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "RemoveSourceCommand",
                type: "warning",
                message: `A fonte ${colors.bold(sourceType)} foi removida do namespace ${colors.bold(repositoryNamespace)}!`
            })
        } else {
            throw `A fonte ${sourceType} não foi encontrada no repositório ${repositoryNamespace}`
        }

    }catch(e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RemoveSourceCommand",
            type: "error",
            message: e
        })
        throw e
    }

}

module.exports = RemoveSourceCommand
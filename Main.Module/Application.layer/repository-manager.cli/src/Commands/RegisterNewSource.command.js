const path = require("path")
const os = require('os')

const EventEmitter = require('node:events')
const { resolve } = require("path")
const colors = require("colors")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const VerifySourceIsRegistered = require("../Helpers/VerifySourceIsRegistered")


const ConvertPathToAbsolutPath = (_path) => path
    .join(_path)
    .replace('~', os.homedir())

const GetNewSource = (args) => {
    const {
        sourceType,
        localPath,
        repoName,
        repoOwner,
        fileId
    } = args


    switch(sourceType){
        case "LOCAL_FS":
            return {
                sourceType,
                path:localPath
            }
        case "GITHUB_RELEASE":
            return {
                sourceType,
                repositoryName: repoName,
                repositoryOwner: repoOwner
            }
        case "GOOGLE_DRIVE":
            return {
                sourceType,
                fileId
            }

        default:
            throw `A fonte do tipo ${sourceType} não existe`
    }
}

const RegisterNewSourceCommand = async ({ 
    args, 
    startupParams,
    params
}) => {

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ECOSYSTEM_DEFAULTS

    const { installDataDirPath } = startupParams

    const installDataDirAbsolutPath = ConvertPathToAbsolutPath(installDataDirPath)

    const {
        jsonFileUtilitiesLib,
        printDataLogLib
    } = params

    const loggerEmitter = new EventEmitter()

    const PrintDataLog = printDataLogLib.require("PrintDataLog")
        loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "RegisterNewSourceCommand"))
	
    try {
        
        const WriteObjectToFile = jsonFileUtilitiesLib.require("WriteObjectToFile")
        const ReadJsonFile = jsonFileUtilitiesLib.require("ReadJsonFile")
        const {
            repositoryNamespace,
            sourceType
        } = args
    
        const sourceFilePath = resolve(installDataDirAbsolutPath, REPOS_CONF_FILENAME_SOURCE_DATA)
        const sourcesDataInformation = await ReadJsonFile(sourceFilePath)
    
        const isSourceRegistered = VerifySourceIsRegistered({ repositoryNamespace, sourceType, sourcesDataInformation })
    
        if(isSourceRegistered){
            throw `Já existe uma fonte do tipo ${colors.bold(sourceType)} para o repositório ${colors.bold(repositoryNamespace)}`
        } else {
            const newSourcesDataInformation = {
                ...sourcesDataInformation,
                [repositoryNamespace]: [
                    ...sourcesDataInformation[repositoryNamespace] || [],
                    GetNewSource(args)
                ]
            }
            await WriteObjectToFile(sourceFilePath, newSourcesDataInformation)
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "RegisterNewSourceCommand",
                type: "warning",
                message: `Uma nova fonte foi registrada de namespace ${colors.bold(repositoryNamespace)} de tipo ${colors.bold(sourceType)}.`
            })
        }
    }catch(e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RegisterNewSourceCommand",
            type: "error",
            message: e
        })
        throw e
    }

}

module.exports = RegisterNewSourceCommand
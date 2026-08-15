const { resolve } = require("path")
const colors = require("colors")

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const VerifySourceIsRegistered = require("../Helpers/VerifySourceIsRegistered")

const ConvertPathToAbsolutPath = require("../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/ConvertPathToAbsolutPath")

const RemoveSourceCommand = async ({
    args, 
    startupParams,
    params
}: {
    args: any
    startupParams: any
    params: any
}) => {

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ECOSYSTEM_DEFAULTS

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const {
        jsonFileUtilitiesLib
    } = params

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
             .filter(({sourceType:_sourceType}: { sourceType: string }) => sourceType !== _sourceType)

            const newSourcesDataInformation = {
                ...sourcesDataInformation,
                [repositoryNamespace]: filteredSources
            }
            await WriteObjectToFile(sourceFilePath, newSourcesDataInformation)
            Log.warn("RemoveSourceCommand", `A fonte ${colors.bold(sourceType)} foi removida do namespace ${colors.bold(repositoryNamespace)}!`)
        } else {
            throw `A fonte ${sourceType} não foi encontrada no repositório ${repositoryNamespace}`
        }

    }catch(e: any){
        Log.error("RemoveSourceCommand", e)
        throw e
    }

}

module.exports = RemoveSourceCommand
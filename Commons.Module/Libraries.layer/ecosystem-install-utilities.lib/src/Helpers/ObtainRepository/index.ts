import type { ObtainRepositoryArgs, SourceData } from "../../Types"

const path = require("path") as typeof import("path")
const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const ObtainFromLocalFS         = require("./ObtainFromLocalFS") as (args: ObtainRepositoryArgs) => string
const DownloadFromGoogleDrive   = require("./DownloadFromGoogleDrive") as (args: ObtainRepositoryArgs) => Promise<string>
const DownloadFromGithubRelease = require("./DownloadFromGithubRelease") as (args: ObtainRepositoryArgs) => Promise<string>

//TODO colocar log aqui
const ObtainRepository = async ({
    repositoryNamespace,
    sourceData,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES
}: {
    repositoryNamespace: string
    sourceData: SourceData
    installDataDirPath: string
    ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES: string
}): Promise<string> => {
    
    const { 
        sourceType
     } = sourceData

    Log.info("ObtainRepository", `Baixando repositório ${colors.bold(repositoryNamespace)}...`)

    const destinationRepoPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES)

    const ObtainFrom: Record<string, (args: ObtainRepositoryArgs) => string | Promise<string>> = {
        "LOCAL_FS"       : (args) => ObtainFromLocalFS(args),
        "GOOGLE_DRIVE"   : (args) => DownloadFromGoogleDrive(args),
        "GITHUB_RELEASE" : (args) => DownloadFromGithubRelease(args)
    }

    Log.info("ObtainRepository", `A fonte do tipo ${colors.bold(sourceType)} selecionada`)

    const destinationPath =  ObtainFrom[sourceType]({ repositoryNamespace, sourceData, destinationRepoPath })
    
    Log.info("ObtainRepository", `Download do repositório ${colors.bold(repositoryNamespace)} foi concluído!`)
    return destinationPath
}

module.exports = ObtainRepository
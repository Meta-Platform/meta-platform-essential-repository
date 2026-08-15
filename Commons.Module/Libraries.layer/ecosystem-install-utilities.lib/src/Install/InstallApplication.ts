import type { InstalledApplication } from "../Types"

const path = require("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const CreateExecutableScript = require("../../../script-file-utilities.lib/src/CreateExecutableScript")
const BuildApplicationScriptContent = require("../Helpers/BuildApplicationScriptContent")
const BuildCommandLineApplicationScriptContent = require("../Helpers/BuildCommandLineApplicationScriptContent")
const BuildDesktopAppScriptContent = require("../Helpers/BuildDesktopAppScriptContent")
const RegisterExecutableInstallation = require("../../../repository-config-handler.lib/src/Helpers/RegisterExecutableInstallation")

const InstallApplication = async ({
    namespace,
    deployedRepoPath,
    applicationData,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
    REPOS_CONF_FILENAME_REPOS_DATA,
    supervisorSocketDirPath
}: {
    namespace: string
    deployedRepoPath: string
    applicationData: InstalledApplication
    installDataDirPath: string
    ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR: string
    REPOS_CONF_FILENAME_REPOS_DATA: string
    supervisorSocketDirPath: string
}) => {

    const {
        appType,
        executable,
        packageNamespace,
        supervisorSocketFileName
    } = applicationData

    Log.info("InstallApplication", `Início da instalação de uma aplicação do pacote ${colors.bold(path.basename(packageNamespace))}`)

    if(!appType) {
        Log.error("InstallApplication", `applicationData.appType é obrigatório`)
        throw "applicationData.appType é obrigatório"
    }


    await RegisterExecutableInstallation({
        installDataDirPath,
        repositoryNamespace:namespace,
        REPOS_CONF_FILENAME_REPOS_DATA,
        applicationData
    })

    Log.info("InstallApplication", `Instalando do executável ${colors.bold(executable)} do tipo ${appType}`)

    const supervisorSocketFilePath = path.join(supervisorSocketDirPath, supervisorSocketFileName)

    const _CreateScriptContent = ({debugMode=false}) => {
        switch(appType.toUpperCase()){
            case "CLI":
                return BuildCommandLineApplicationScriptContent({
                    PACKAGE_REPO_PATH: packageNamespace,
                    REPOSITORY_PATH: deployedRepoPath,
                    EXEC_NAME: executable,
                    supervisorSocketFilePath,
                    debugMode
                })
            case "APP":
                return BuildApplicationScriptContent({
                    PACKAGE_REPO_PATH: packageNamespace,
                    REPOSITORY_PATH: deployedRepoPath,
                    supervisorSocketFilePath,
                    debugMode
                })
            case "DESKTOP":
                return BuildDesktopAppScriptContent({
                    PACKAGE_REPO_PATH: packageNamespace,
                    REPOSITORY_PATH: deployedRepoPath,
                    supervisorSocketFilePath,
                    debugMode
                })
            default:
                throw `applicationData.appType inválido: ${appType}`
        }
    }

    const fullScriptPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, executable)
    await CreateExecutableScript(fullScriptPath, _CreateScriptContent({ debugMode:false }))

    const fullScriptDbgPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, executable+"-dbg")
    await CreateExecutableScript(fullScriptDbgPath, _CreateScriptContent({ debugMode:true }))

    Log.info("InstallApplication", `O executável ${colors.inverse(executable)} do pacote ${colors.inverse(path.basename(packageNamespace))} foi instalado!`)

    return fullScriptPath
}

module.exports = InstallApplication
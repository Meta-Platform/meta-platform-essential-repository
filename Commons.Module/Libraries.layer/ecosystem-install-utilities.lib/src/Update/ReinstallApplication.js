const path = require("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const RecreateExecutableScript = require("../../../script-file-utilities.lib/src/RecreateExecutableScript")
const BuildApplicationScriptContent = require("../Helpers/BuildApplicationScriptContent")
const BuildCommandLineApplicationScriptContent = require("../Helpers/BuildCommandLineApplicationScriptContent")
const BuildDesktopAppScriptContent = require("../Helpers/BuildDesktopAppScriptContent")

const ReinstallApplication = async ({
    namespace,
    applicationData,
    deployedRepoPath,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
    supervisorSocketDirPath
}) => {

    const {
        appType,
        executable,
        packageNamespace,
        supervisorSocketFileName
    } = applicationData

    Log.info("ReinstallApplication", `Início da reinstalação de uma aplicação do pacote ${colors.bold(path.basename(packageNamespace))}`)

    if(!appType) {
        Log.error("ReinstallApplication", `applicationData.appType é obrigatório`)
        throw "applicationData.appType é obrigatório"
    }

    Log.info("ReinstallApplication", `Reinstalando executável ${colors.bold(executable)} do tipo ${appType}`)

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
    await RecreateExecutableScript(fullScriptPath, _CreateScriptContent({ debugMode:false }))

    const fullScriptDbgPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, executable+"-dbg")
    await RecreateExecutableScript(fullScriptDbgPath, _CreateScriptContent({ debugMode:true }))

    Log.info("ReinstallApplication", `O executável ${colors.inverse(executable)} do pacote ${colors.inverse(path.basename(packageNamespace))} foi reinstalado!`)

    return fullScriptPath
}

module.exports = ReinstallApplication

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
    supervisorSocketDirPath,
    loggerEmitter
}) => {

    const {
        appType,
        executable,
        packageNamespace,
        supervisorSocketFileName
    } = applicationData

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallApplication",
        type: "info",
        message: `Início da instalação de uma aplicação do pacote ${colors.bold(path.basename(packageNamespace))}`
    })

    if(!appType) {
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "InstallApplication",
            type: "error",
            message: `applicationData.appType é obrigatório`
        })
        throw "applicationData.appType é obrigatório"
    }


    await RegisterExecutableInstallation({
        installDataDirPath,
        repositoryNamespace:namespace,
        REPOS_CONF_FILENAME_REPOS_DATA,
        applicationData,
        loggerEmitter
    })

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallApplication",
        type: "info",
        message: `Instalando do executável ${colors.bold(executable)} do tipo ${appType}`
    })

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
    await CreateExecutableScript(fullScriptPath, _CreateScriptContent({ debugMode:false }), loggerEmitter)

    const fullScriptDbgPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, executable+"-dbg")
    await CreateExecutableScript(fullScriptDbgPath, _CreateScriptContent({ debugMode:true }), loggerEmitter)

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallApplication",
        type: "info",
        message: `O executável ${colors.inverse(executable)} do pacote ${colors.inverse(path.basename(packageNamespace))} foi instalado!`
    })

    return fullScriptPath
}

module.exports = InstallApplication
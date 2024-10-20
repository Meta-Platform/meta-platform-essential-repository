const path = require("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const RecreateExecutableScript = require("../../../script-file-utilities.lib/src/RecreateExecutableScript")
const BuildApplicationScriptContent = require("../Helpers/BuildApplicationScriptContent")
const BuildCommandLineApplicationScriptContent = require("../Helpers/BuildCommandLineApplicationScriptContent")

const ReinstallApplication = async ({
    namespace,
    appToInstall,
    installDataDirPath,
    ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
    supervisorSocketDirPath,
    loggerEmitter
}) => {

    const {
        appType,
        executable,
        packageNamespace,
        supervisorSocketFileName
    } = appToInstall

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "ReinstallApplication",
        type: "info",
        message: `Início da reinstalação de uma aplicação do pacote ${colors.bold(path.basename(packageNamespace))}`
    })

    if(!appType) {
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ReinstallApplication",
            type: "error",
            message: `appToInstall.appType é obrigatório`
        })
        throw "appToInstall.appType é obrigatório"
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "ReinstallApplication",
        type: "info",
        message: `Reinstalando executável ${colors.bold(executable)} do tipo ${appType}`
    })

    const supervisorSocketFilePath = path.join(supervisorSocketDirPath, supervisorSocketFileName)

    const scriptContent = appType.toUpperCase() === "CLI" 
        ? BuildCommandLineApplicationScriptContent({
            PACKAGE_REPO_PATH: packageNamespace,
            REPOSITORY_NAMESPACE: namespace,
            EXEC_NAME: executable,
            supervisorSocketFilePath
        })
        : appType.toUpperCase() === "APP" && BuildApplicationScriptContent({
            PACKAGE_REPO_PATH: packageNamespace,
            REPOSITORY_NAMESPACE: namespace,
            supervisorSocketFilePath
        })
    
        const fullScriptPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, executable)
        await RecreateExecutableScript(fullScriptPath, scriptContent, loggerEmitter)

        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ReinstallApplication",
            type: "info",
            message: `O executável ${colors.inverse(executable)} do pacote ${colors.inverse(path.basename(packageNamespace))} foi reinstalado!`
        })

        return fullScriptPath
}

module.exports = ReinstallApplication
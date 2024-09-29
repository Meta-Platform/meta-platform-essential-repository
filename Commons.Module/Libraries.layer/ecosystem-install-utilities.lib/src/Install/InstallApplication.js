const path = require("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const CreateExecutableScript = require("../../../script-file-utilities.lib/src/CreateExecutableScript")
const BuildApplicationScriptContent = require("../Helpers/BuildApplicationScriptContent")
const BuildCommandLineApplicationScriptContent = require("../Helpers/BuildCommandLineApplicationScriptContent")

const InstallApplication = async ({
    namespace,
    appToInstall,
    ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
    SUPERVISOR_SOCKET_DIR_PATH,
    loggerEmitter
}) => {

    const {
        appType,
        executable,
        packageNamespace,
        supervisorSocketFileName
    } = appToInstall

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallApplication",
        type: "info",
        message: `Inicio da instalação de uma aplicação do pacote ${colors.bold(path.basename(packageNamespace))}`
    })

    if(!appType) {
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "InstallApplication",
            type: "error",
            message: `appToInstall.appType é obrigatório`
        })
        throw "appToInstall.appType é obrigatório"
    }

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallApplication",
        type: "info",
        message: `Instalando do executável ${colors.bold(executable)} do tipo ${appType}`
    })

    const SUPERVISOR_SOCKET_FILE_PATH = path.join(SUPERVISOR_SOCKET_DIR_PATH, supervisorSocketFileName)

    const scriptContent = appType.toUpperCase() === "CLI" 
        ? BuildCommandLineApplicationScriptContent({
            PACKAGE_REPO_PATH: packageNamespace,
            REPOSITORY_NAMESPACE: namespace,
            EXEC_NAME: executable,
            SUPERVISOR_SOCKET_FILE_PATH
        })
        : appType.toUpperCase() === "APP" && BuildApplicationScriptContent({
            PACKAGE_REPO_PATH: packageNamespace,
            REPOSITORY_NAMESPACE: namespace,
            SUPERVISOR_SOCKET_FILE_PATH
        })
    
    const fullScriptPath = path.join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, executable)
    await CreateExecutableScript(fullScriptPath, scriptContent, loggerEmitter)

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallApplication",
        type: "info",
        message: `O executável ${colors.bold(executable)} do pacote ${colors.bold(path.basename(packageNamespace))} foi instalado!`
    })

    return fullScriptPath
}

module.exports = InstallApplication
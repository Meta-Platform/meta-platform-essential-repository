const path = require("path")

const CreateExecutableScript = require("../../script-file-utilities.lib/src/CreateExecutableScript")
const BuildApplicationScriptContent = require("./BuildApplicationScriptContent")
const BuildCommandLineApplicationScriptContent = require("./BuildCommandLineApplicationScriptContent")

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

    if(!appType) throw "appToInstall.appType é obrigatório"

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
    return fullScriptPath
}

module.exports = InstallApplication
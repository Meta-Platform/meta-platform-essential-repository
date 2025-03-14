const path = require("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const CreateExecutableScript = require("../../../script-file-utilities.lib/src/CreateExecutableScript")
const BuildApplicationScriptContent = require("../Helpers/BuildApplicationScriptContent")
const BuildCommandLineApplicationScriptContent = require("../Helpers/BuildCommandLineApplicationScriptContent")
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

    const scriptContent = appType.toUpperCase() === "CLI" 
        ? BuildCommandLineApplicationScriptContent({
            PACKAGE_REPO_PATH: packageNamespace,
            REPOSITORY_PATH: deployedRepoPath,
            EXEC_NAME: executable,
            supervisorSocketFilePath
        })
        : appType.toUpperCase() === "APP" && BuildApplicationScriptContent({
            PACKAGE_REPO_PATH: packageNamespace,
            REPOSITORY_PATH: deployedRepoPath,
            supervisorSocketFilePath
        })
    
    const fullScriptPath = path.join(installDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR, executable)
    await CreateExecutableScript(fullScriptPath, scriptContent, loggerEmitter)

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallApplication",
        type: "info",
        message: `O executável ${colors.inverse(executable)} do pacote ${colors.inverse(path.basename(packageNamespace))} foi instalado!`
    })

    return fullScriptPath
}

module.exports = InstallApplication
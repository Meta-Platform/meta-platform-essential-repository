const path = require("path")

const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const CreatePackageExecutableScript             = require("../../../../script-file-utilities.lib/src/CreatePackageExecutableScript")
const GetApplicationExecutionContent            = require("../../../../script-file-utilities.lib/src/GetApplicationExecutionContent")
const GetCommandLineApplicationExecutionContent = require("../../../../script-file-utilities.lib/src/GetCommandLineApplicationExecutionContent")

const ConstructEcosystemStructure     = require("../../Domains/ConstructEcosystemStructure")
const InstallPackageExecutor          = require("./InstallPackageExecutor")
const CreateEcosystemDefaultsJsonFile = require("./CreateEcosystemDefaultsJsonFile")
const CreateRepositorySource          = require("./CreateRepositorySource")

const Install = async ({
    ecosystemDefaults,
    installationDataDir,
    initialRepositorySource,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallEcosystem",
        type: "info",
        message: `Iniciando a instalação do ecosistema...`
    })

    await ConstructEcosystemStructure({
        installationDataDir,
        ecosystemDefaults,
        loggerEmitter
    })

    await CreateEcosystemDefaultsJsonFile({
        installationDataDir, 
        ecosystemDefaults,
        loggerEmitter
    })

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ecosystemDefaults

    await CreateRepositorySource({
        installationDataDir,
        loggerEmitter,
        sourceData: initialRepositorySource,
        REPOS_CONF_FILENAME_SOURCE_DATA
    })

    const {
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
    } = ecosystemDefaults

    const packageExecutorBinFilePath = await InstallPackageExecutor({
        installationDataDir,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
        loggerEmitter
    })

    const packageExecutorBinaryName = path.basename(packageExecutorBinFilePath)

    await CreatePackageExecutableScript({
        installationDataDir,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetApplicationExecutionContent,
        executableScriptFilename:"execute-application",
        loggerEmitter
    })

    await CreatePackageExecutableScript({
        installationDataDir,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetCommandLineApplicationExecutionContent,
        executableScriptFilename:"execute-command-line-application",
        loggerEmitter
    })


    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallEcosystem",
        type: "info",
        message: `Ecosistema instalado com sucesso em ${colors.bold(installationDataDir)}`
    })
    

}


module.exports = Install
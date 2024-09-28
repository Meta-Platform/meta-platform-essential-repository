const path = require("path")

const ConstructEcosystemStructure = require("../ConstructEcosystemStructure")
const InstallPackageExecutor = require("./InstallPackageExecutor")
const CreateEcosystemDefaultsJsonFile = require("./CreateEcosystemDefaultsJsonFile")

const CreatePackageExecutableScript = require("../../../script-file-utilities.lib/src/CreatePackageExecutableScript")
const GetApplicationExecutionContent = require("../../../script-file-utilities.lib/src/GetApplicationExecutionContent")
const GetCommandLineApplicationExecutionContent = require("../../../script-file-utilities.lib/src/GetCommandLineApplicationExecutionContent")

const Install = async ({
    ecosystemDefaults,
    ECO_DIRPATH_INSTALL_DATA,
    loggerEmitter
}) => {

    await ConstructEcosystemStructure({
        ECO_DIRPATH_INSTALL_DATA,
        ecosystemDefaults,
        loggerEmitter
    })

    await CreateEcosystemDefaultsJsonFile({
        ECO_DIRPATH_INSTALL_DATA, 
        ecosystemDefaults
    })

    const {
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
    } = ecosystemDefaults

    const packageExecutorBinFilePath = await InstallPackageExecutor({
        ECO_DIRPATH_INSTALL_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
        loggerEmitter
    })

    const packageExecutorBinaryName = path.basename(packageExecutorBinFilePath)

    await CreatePackageExecutableScript({
        ECO_DIRPATH_INSTALL_DATA,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetApplicationExecutionContent,
        executableScriptFilename:"execute-application"
    })

    await CreatePackageExecutableScript({
        ECO_DIRPATH_INSTALL_DATA,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetCommandLineApplicationExecutionContent,
        executableScriptFilename:"execute-command-line-application"
    })

    //const executablesDirPath = join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR)
    //await AddPathToUserBashrc(executablesDirPath)

}


module.exports = Install
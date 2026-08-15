import type { EcosystemDefaults, SourceData } from "../../Types"

const path = require("path")

const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const CreatePackageExecutableScript             = require("../../../../script-file-utilities.lib/src/CreatePackageExecutableScript")
const GetApplicationExecutionContent            = require("../../../../script-file-utilities.lib/src/GetApplicationExecutionContent")
const GetCommandLineApplicationExecutionContent = require("../../../../script-file-utilities.lib/src/GetCommandLineApplicationExecutionContent")
const GetDesktopApplicationExecutionContent     = require("../../../../script-file-utilities.lib/src/GetDesktopApplicationExecutionContent")

const ConstructEcosystemStructure     = require("../../Domains/ConstructEcosystemStructure")
const InstallPackageExecutor          = require("./InstallPackageExecutor")
const CreateEcosystemDefaultsJsonFile = require("./CreateEcosystemDefaultsJsonFile")
const CreateRepositorySource          = require("./CreateRepositorySource")

const Install = async ({
    ecosystemDefaults,
    installationDataDir,
    initialRepositorySource
}: {
    ecosystemDefaults: EcosystemDefaults
    installationDataDir: string
    initialRepositorySource: SourceData
}) => {

    Log.info("InstallEcosystem", `Iniciando a instalação do ecosistema...`)

    await ConstructEcosystemStructure({
        installationDataDir,
        ecosystemDefaults
    })

    await CreateEcosystemDefaultsJsonFile({
        installationDataDir, 
        ecosystemDefaults
    })

    const { REPOS_CONF_FILENAME_SOURCE_DATA } = ecosystemDefaults

    await CreateRepositorySource({
        installationDataDir,
        sourceData: initialRepositorySource,
        REPOS_CONF_FILENAME_SOURCE_DATA
    })

    const {
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
    } = ecosystemDefaults

    const packageExecutorBinFilePath = await InstallPackageExecutor({
        installationDataDir,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
    })

    const packageExecutorBinaryName = path.basename(packageExecutorBinFilePath)

    await CreatePackageExecutableScript({
        installationDataDir,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetApplicationExecutionContent,
        executableScriptFilename:"execute-application"
    })

    await CreatePackageExecutableScript({
        installationDataDir,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetApplicationExecutionContent,
        executableScriptFilename:"execute-application-dbg",
        debugMode:true
    })

    await CreatePackageExecutableScript({
        installationDataDir,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetCommandLineApplicationExecutionContent,
        executableScriptFilename:"execute-command-line-application"
    })

    await CreatePackageExecutableScript({
        installationDataDir,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetCommandLineApplicationExecutionContent,
        executableScriptFilename:"execute-command-line-application-dbg",
        debugMode:true
    })

    await CreatePackageExecutableScript({
        installationDataDir,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetDesktopApplicationExecutionContent,
        executableScriptFilename:"execute-desktop-application"
    })

    await CreatePackageExecutableScript({
        installationDataDir,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetDesktopApplicationExecutionContent,
        executableScriptFilename:"execute-desktop-application-dbg",
        debugMode:true
    })


    Log.info("InstallEcosystem", `Ecosistema instalado com sucesso em ${colors.bold(installationDataDir)}`)
    

}


module.exports = Install
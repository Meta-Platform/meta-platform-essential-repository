import type { EcosystemDefaults } from "../../Types"

const path = require("path")

const RestoreEcosystemStructure = require("../../Domains/RestoreEcosystemStructure")
/*
 * O corpo da atualização do ecossistema está DESATIVADO: hoje `Update` apenas
 * restaura a estrutura de diretórios. O binário do Package Executor, o
 * ecosystem-defaults.json e os scripts executáveis não são atualizados por
 * aqui — quem os atualiza é a instalação.
 *
 * O bloco abaixo é a intenção registrada de reativar isso. Foi mantido, mas
 * corrigido: apontava para módulos que já não existem (eram cópias do fluxo de
 * instalação, agora unificadas em Helpers/) e usava um `ECO_DIRPATH_INSTALL_DATA`
 * que não existe neste escopo — descomentá-lo como estava não compilaria.
 */
/*const SetupPackageExecutor = require("../../Helpers/PackageExecutor/SetupPackageExecutor")
const CreateEcosystemDefaultsJsonFile = require("../../Helpers/CreateEcosystemDefaultsJsonFile")

const CreatePackageExecutableScript             = require("../../../../script-file-utilities.lib/src/CreatePackageExecutableScript")
const GetApplicationExecutionContent            = require("../../../../script-file-utilities.lib/src/GetApplicationExecutionContent")
const GetCommandLineApplicationExecutionContent = require("../../../../script-file-utilities.lib/src/GetCommandLineApplicationExecutionContent")*/

const Update = async ({
    ecosystemDefaults,
    installDataDirPath
}: {
    ecosystemDefaults: EcosystemDefaults
    installDataDirPath: string
}) => {

    Log.info("InstallEcosystem", `Atualizando o ecosistema...`)

    await RestoreEcosystemStructure({
        installDataDirPath,
        ecosystemDefaults
    })
/*
    await CreateEcosystemDefaultsJsonFile({
        installationDataDir: installDataDirPath,
        ecosystemDefaults
    })

    const {
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
    } = ecosystemDefaults

    const packageExecutorBinFilePath = await SetupPackageExecutor({
        installationDataDir: installDataDirPath,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
    })

    const packageExecutorBinaryName = path.basename(packageExecutorBinFilePath)

    await CreatePackageExecutableScript({
        installationDataDir: installDataDirPath,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetApplicationExecutionContent,
        executableScriptFilename:"execute-application"
    })

    await CreatePackageExecutableScript({
        installationDataDir: installDataDirPath,
        ecosystemDefaults,
        packageExecutorBinaryName,
        buildContentFunction: GetCommandLineApplicationExecutionContent,
        executableScriptFilename:"execute-command-line-application"
    })*/

}


module.exports = Update
const { basename } = require("path") as typeof import("path")

const DownloadPackageExecutorBin = require("./DownloadPackageExecutorBin") as (params: { installationDataDir: string, ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR: string }) => Promise<string>
const MakeFileExecutable         = require("../../../../script-file-utilities.lib/src/MakeFileExecutable") as (filePath: string) => Promise<void>

const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

/*
 * Põe o binário do Package Executor no lugar e o torna executável.
 *
 * Chamava-se `InstallPackageExecutor`, e havia um `UpdatePackageExecutor` ao
 * lado — idêntico, exceto pelo nome do MESMO parâmetro e por não escrever log.
 * Instalar e atualizar o binário são a mesma operação: baixar a última release e
 * dar permissão. O nome agora diz isso.
 */
const SetupPackageExecutor = async ({
    installationDataDir,
    ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
}: {
    installationDataDir: string
    ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR: string
}): Promise<string> => {

    Log.info("SetupPackageExecutor", `Instalando o ${colors.bold("Package Executor")}...`)

    const packageExecutorBinFilePath = await DownloadPackageExecutorBin({
        installationDataDir,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
    })

    await MakeFileExecutable(packageExecutorBinFilePath)

    Log.info("SetupPackageExecutor", `${colors.bold(basename(packageExecutorBinFilePath))} instalado do sucesso!`)

    return packageExecutorBinFilePath

}

module.exports = SetupPackageExecutor

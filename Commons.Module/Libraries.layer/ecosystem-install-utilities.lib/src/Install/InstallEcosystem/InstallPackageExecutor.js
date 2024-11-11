const { basename } = require("path")
const DownloadPackageExecutorBin = require("./DownloadPackageExecutorBin")
const MakeFileExecutable         = require("../../../../script-file-utilities.lib/src/MakeFileExecutable")

const SmartRequire = require("../../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const InstallPackageExecutor = async ({
    installationDataDir,
    ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallPackageExecutor",
        type: "info",
        message: `Instalando o ${colors.bold("Package Executor")}...`
    })
    const packageExecutorBinFilePath = await DownloadPackageExecutorBin({
        installationDataDir,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
    })
    await MakeFileExecutable(packageExecutorBinFilePath, loggerEmitter)
    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallPackageExecutor",
        type: "info",
        message: `${colors.bold(basename(packageExecutorBinFilePath))} instalado do sucesso!`
    })

    return packageExecutorBinFilePath
    
}

module.exports = InstallPackageExecutor
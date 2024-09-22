const DownloadPackageExecutorBin = require("./DownloadPackageExecutorBin")
const MakeFileExecutable         = require("../../../script-file-utilities.lib/src/MakeFileExecutable")

const InstallPackageExecutor = async ({
    ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
}) => {

    const packageExecutorBinFilePath = await DownloadPackageExecutorBin({
        ECO_DIRPATH_INSTALL_DATA,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
    })
    await MakeFileExecutable(packageExecutorBinFilePath)
    return packageExecutorBinFilePath
    
}

module.exports = InstallPackageExecutor
const { join } = require("path")

const DownloadFirstAssetOfLatestReleaseFromGithub = require("../../../../download-file.lib/src/DownloadFirstAssetOfLatestReleaseFromGithub")

const DownloadPackageExecutorBin = async ({
    ECO_DIRPATH_INSTALL_DATA,
    ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
}) => {

    const path = join(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR)

    const REPO_OWNER = "Meta-Platform"
    const REPO_NAME = "meta-platform-package-executor-command-line"

    return await DownloadFirstAssetOfLatestReleaseFromGithub({
        repoOwner: REPO_OWNER,
        repoName: REPO_NAME,
        localPath:path
      })
    
}

module.exports = DownloadPackageExecutorBin
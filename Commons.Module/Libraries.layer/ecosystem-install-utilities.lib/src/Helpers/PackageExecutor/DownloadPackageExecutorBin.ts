const { join } = require("path") as typeof import("path")

const DownloadFirstAssetOfLatestReleaseFromGithub = require("../../../../download-file.lib/src/DownloadFirstAssetOfLatestReleaseFromGithub") as (params: { repoOwner: string, repoName: string, localPath: string }) => Promise<string>

const REPO_OWNER = "Meta-Platform"
const REPO_NAME  = "meta-platform-package-executor-command-line"

/** Traz o binário do Package Executor da última release para o EcosystemData. */
const DownloadPackageExecutorBin = async ({
    installationDataDir,
    ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR
}: {
    installationDataDir: string
    ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR: string
}): Promise<string> => {

    const path = join(installationDataDir, ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR)

    return await DownloadFirstAssetOfLatestReleaseFromGithub({
        repoOwner: REPO_OWNER,
        repoName: REPO_NAME,
        localPath: path
      })

}

module.exports = DownloadPackageExecutorBin

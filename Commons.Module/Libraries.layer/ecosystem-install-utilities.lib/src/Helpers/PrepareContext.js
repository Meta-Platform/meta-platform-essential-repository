const path = require("path")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const PrepareContext = ({
    installationProfile,
    ecosystemDefaults,
    installationPath
}) => {
    const { 
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    } = ecosystemDefaults

    const {
        installationDataDir,
    } = installationProfile

    const absolutInstallDataDirPath = ConvertPathToAbsolutPath(installationPath || installationDataDir)

    const npmDependenciesContextPath = path.join(absolutInstallDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES)

    return {
        absolutInstallDataDirPath,
        npmDependenciesContextPath
    }
}

module.exports = PrepareContext
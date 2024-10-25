const path = require("path")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const PrepareContext = ({
    installationDataDir,
    ecosystemDefaults,
    installationPath
}) => {
    const { 
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    } = ecosystemDefaults

    const absolutInstallDataDirPath = ConvertPathToAbsolutPath(installationPath || installationDataDir)

    const npmDependenciesContextPath = path.join(absolutInstallDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES)

    return {
        installDataDirPath: absolutInstallDataDirPath,
        npmDependenciesContextPath
    }
}

module.exports = PrepareContext
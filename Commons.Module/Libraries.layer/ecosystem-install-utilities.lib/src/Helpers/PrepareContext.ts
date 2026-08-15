import type { EcosystemDefaults, InstallationContext } from "../Types"

const path = require("path") as typeof import("path")

const ConvertPathToAbsolutPath = require("../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/ConvertPathToAbsolutPath") as (path: string) => string

const PrepareContext = ({
    installationDataDir,
    ecosystemDefaults,
    installationPath
}: {
    installationDataDir?: string
    ecosystemDefaults: EcosystemDefaults
    installationPath?: string
}): InstallationContext => {
    const { 
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    } = ecosystemDefaults

    const absolutInstallDataDirPath = ConvertPathToAbsolutPath((installationPath || installationDataDir)!)

    const npmDependenciesContextPath = path.join(absolutInstallDataDirPath, ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES)

    return {
        installDataDirPath: absolutInstallDataDirPath,
        npmDependenciesContextPath
    }
}

module.exports = PrepareContext
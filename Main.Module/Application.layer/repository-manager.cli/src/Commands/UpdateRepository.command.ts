const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")

const ConvertPathToAbsolutPath = require("../Helpers/ConvertPathToAbsolutPath")

const UpdateRepositoryCommand = async ({ args, startupParams, params }: { args: any, startupParams: any, params: any }) => {

    const {
        ecosystemInstallUtilitiesLib
    } = params

    const UpdateRepository = ecosystemInstallUtilitiesLib.require("UpdateRepository")

    const { installDataDirPath:installDataDirPathRaw } = startupParams
    const installDataDirPath = ConvertPathToAbsolutPath(installDataDirPathRaw)

    const { 
        repositoryNamespace
    } = args
    
    await UpdateRepository({
        repositoryNamespace,
        installDataDirPath,
        ecosystemDefaults: ECOSYSTEM_DEFAULTS
    })
    
}

module.exports = UpdateRepositoryCommand
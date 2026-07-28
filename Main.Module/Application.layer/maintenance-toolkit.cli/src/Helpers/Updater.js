const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const REPOSITORY_SOURCES = require("../Configs/repository-sources.json")

const LoadAllInstalationProfiles = require("../Helpers/LoadAllInstalationProfiles")

const BuildRepositoriesInstallData = require("./BuildRepositoriesInstallData")

const Updater = async ({ 
    profile, 
    installationPath,
    ecosystemInstallUtilitiesLib
}) => {

    const UpdateEcosystemByProfile = ecosystemInstallUtilitiesLib.require("UpdateEcosystemByProfile")
    
    const installationProfiles = LoadAllInstalationProfiles()
    const instalationData = installationProfiles[profile]
    const { repositoriesToInstall, installationDataDir } = instalationData

    const repositoriesInstallData = 
        BuildRepositoriesInstallData({ repositoriesToInstall, sources: REPOSITORY_SOURCES}) 

    try{
        await UpdateEcosystemByProfile({
            ecosystemDefaults : ECOSYSTEM_DEFAULTS,
            npmDependencies : NPM_DEPENDENCIES,
            profile,
            installationDataDir,
            repositoriesInstallData,
            installationPath
        })
    } catch(e){
       
        Log.error("Updater", e)

        Log.error("Updater", `A atualização cancelada!`)

        throw e
    }
}

module.exports = Updater
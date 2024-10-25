const EventEmitter = require('events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")

const LoadAllInstalationProfiles = require("../Helpers/LoadAllInstalationProfiles")

const PrintDataLog = require("../../../../../Commons.Module/Libraries.layer/print-data-log.lib/src/PrintDataLog")
const InstallEcosystemByProfile = require("../../../../../Commons.Module/Libraries.layer/ecosystem-install-utilities.lib/src/InstallEcosystemByProfile")

const BuildRepositoriesInstallData = require("./BuildRepositoriesInstallData")

const Installer = async ({ 
    profile, 
    installationPath
}) => {

    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "maintenance-toolkit|Installer"))

    const installationProfiles = LoadAllInstalationProfiles()
    const instalationData = installationProfiles[profile]
    const { repositoriesToInstall, installationDataDir } = instalationData

    const repositoriesInstallData = 
        BuildRepositoriesInstallData({ repositoriesToInstall, sources: REPOSITORY_SOURCES}) 
    
    try{
        await InstallEcosystemByProfile({
            ecosystemDefaults : ECOSYSTEM_DEFAULTS,
            npmDependencies : NPM_DEPENDENCIES,
            profile,
            installationDataDir,
            repositoriesInstallData,
            installationPath,
            loggerEmitter
        })
    } catch(e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "Installer",
            type: "error",
            message: `A instalação cancelada!`
        })
        console.error(e)
    }
    
}

module.exports = Installer
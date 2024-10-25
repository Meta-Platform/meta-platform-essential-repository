const EventEmitter = require('events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const REPOSITORY_SOURCES = require("../Configs/repository-sources.json")

const LoadAllInstalationProfiles = require("../Helpers/LoadAllInstalationProfiles")

const PrintDataLog = require("../../../../../Commons.Module/Libraries.layer/print-data-log.lib/src/PrintDataLog")
const UpdateEcosystemByProfile = require("../../../../../Commons.Module/Libraries.layer/ecosystem-install-utilities.lib/src/UpdateEcosystemByProfile")

const BuildRepositoriesInstallData = require("./BuildRepositoriesInstallData")

const Updater = async ({ 
    profile, 
    installationPath
}) => {
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "maintenance-toolkit|Updater"))

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
            installationPath,
            loggerEmitter
        })
    } catch(e){
       
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "Updater",
            type: "error",
            message: e
        })

        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "Updater",
            type: "error",
            message: `A atualização cancelada!`
        })

        throw e
    }
}

module.exports = Updater
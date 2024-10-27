const EventEmitter = require('events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const REPOSITORY_SOURCES = require("../Configs/repository-sources.json")

const LoadAllInstalationProfiles = require("../Helpers/LoadAllInstalationProfiles")

const BuildRepositoriesInstallData = require("./BuildRepositoriesInstallData")

const Updater = async ({ 
    profile, 
    installationPath,
    ecosystemInstallUtilitiesLib,
    printDataLogLib
}) => {

    const UpdateEcosystemByProfile = ecosystemInstallUtilitiesLib.require("UpdateEcosystemByProfile")
    const PrintDataLog = printDataLogLib.require("PrintDataLog")  
    
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
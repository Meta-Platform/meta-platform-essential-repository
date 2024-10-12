const EventEmitter = require('events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")

const LoadAllInstalationProfiles = require("../Helpers/LoadAllInstalationProfiles")

const Updater = async ({ 
    profile, 
    installationPath,
    LoaderScript
}) => {
    
    const PrintDataLog = LoaderScript("print-data-log.lib/src/PrintDataLog")
    const UpdateEcosystemByProfile = LoaderScript("ecosystem-install-utilities.lib/src/UpdateEcosystemByProfile")

    const installationProfiles = LoadAllInstalationProfiles()
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog, "setup-wizard - Updater"))

    try{
        await UpdateEcosystemByProfile({
            ecosystemDefaults : ECOSYSTEM_DEFAULTS,
            npmDependencies : NPM_DEPENDENCIES,
            installationProfile : installationProfiles[profile],
            profile,
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
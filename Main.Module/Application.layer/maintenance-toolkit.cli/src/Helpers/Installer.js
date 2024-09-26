const EventEmitter = require('events')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")

const LoadAllInstalationProfiles = require("../Helpers/LoadAllInstalationProfiles")

const Installer = async ({ 
    profile, 
    installationPath,
    LoaderScript
}) => {
    
    const PrintDataLog = LoaderScript("print-data-log.lib/src/PrintDataLog")
    const InstallEcosystemByProfile = LoaderScript("ecosystem-install-utilities.lib/src/InstallEcosystemByProfile")

    const installationProfiles = LoadAllInstalationProfiles()
    
    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog))

    await InstallEcosystemByProfile({
        ecosystemDefaults : ECOSYSTEM_DEFAULTS,
        npmDependencies : NPM_DEPENDENCIES,
        installationProfile : installationProfiles[profile],
        installationPath,
        loggerEmitter
    })
}

module.exports = Installer
//const path = require("path")
const EventEmitter = require('events')

const PrintDataLog = require("../../../../../Commons.Module/Libraries.layer/print-data-log.lib/src/PrintDataLog")
const InstallEcosystemByProfile = require("../../../../../Commons.Module/Libraries.layer/ecosystem-install-utilities.lib/src/InstallEcosystemByProfile")

const os = require('os')
const { mkdir } = require('node:fs/promises')

const ECOSYSTEM_DEFAULTS = require("../Configs/ecosystem-defaults.json")
const WIZARD_NODEJS_DEPENDENCIES = require("../Configs/NodeJsDependencies/wizard.nodejsDependencies.json") 
const MINIMAL_NODEJS_DEPENDENCIES =  require("../Configs/NodeJsDependencies/minimal.nodejsDependencies.json")
const PROVISIONAL_NODEJS_DEPENDENCIES =  require("../Configs/NodeJsDependencies/provisional.nodejsDependencies.json")

//const CreateScriptLoader = require("./CreateScriptLoader")
const InstallNodejsDependencies = require("./InstallNodejsDependencies")

const INSTALL_PROFILES = require("./InstallProfiles.mapper")

const Installer = async ({ profile, installationPath }) => {
    
    /*const { 
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    } = ECOSYSTEM_DEFAULTS*/

    
    //const TEMP_NODEJS_DEPENDENCIES_DIRPATH = path.join(os.tmpdir(), ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES)
    //process.env.EXTERNAL_NODE_MODULES_PATH = path.resolve(TEMP_NODEJS_DEPENDENCIES_DIRPATH, "node_modules")

    //await mkdir(TEMP_NODEJS_DEPENDENCIES_DIRPATH, {recursive:true})
    /*await InstallNodejsDependencies({
        contextPath: TEMP_NODEJS_DEPENDENCIES_DIRPATH,
        dependencies: WIZARD_NODEJS_DEPENDENCIES
    })*/
        

    //const LoaderScript = CreateScriptLoader({ ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES })
    /*const PrintDataLog              = LoaderScript("print-data-log.lib/src/PrintDataLog")
    const InstallEcosystemByProfile = LoaderScript("ecosystem-install-utilities.lib/src/InstallEcosystemByProfile")*/

    const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", (dataLog) => PrintDataLog(dataLog))

    await InstallEcosystemByProfile({
        ecosystemDefaults  : ECOSYSTEM_DEFAULTS,
        npmDependencies : PROVISIONAL_NODEJS_DEPENDENCIES,
        installationProfile : INSTALL_PROFILES[profile],
        installationPath,
        loggerEmitter
    })
}

module.exports = Installer
const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const BuildObjectFromPrefix = require("../Helpers/BuildObjectFromPrefix")
const VerifyDirExit = require("../Helpers/VerifyDirExit")
const RestoreDir = require("../Helpers/RestoreDir")

const RestoreEcosystemStructure = async ({
    installDataDirPath,
    ecosystemDefaults,
    loggerEmitter
}) => {

    if(await VerifyDirExit(installDataDirPath)){
        const ecosystemDefaultsConfDirname = BuildObjectFromPrefix(ecosystemDefaults, "ECOSYSTEMDATA_CONF_DIRNAME_")
        try{
        
            for (const configKey of Object.keys(ecosystemDefaultsConfDirname)) {
               const dirname = ecosystemDefaultsConfDirname[configKey]
               
               loggerEmitter && loggerEmitter.emit("log", {
                    sourceName: "RestoreEcosystemStructure",
                    type: "info",
                    message: `Verificando configuração ${colors.bold(configKey)}`
                })
                
                await RestoreDir({
                    installDataDirPath,
                    dirname,
                    loggerEmitter
                })
            }
    
        } catch (e){
            console.log(e)
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "RestoreEcosystemStructure",
                type: "error",
                message: `erro ao criar diretório de dados do ecosistema ${installDataDirPath}`
            })
            throw e
        }
    } else {
        throw "Ecosistema não esta instalado!"
    }
}

module.exports = RestoreEcosystemStructure
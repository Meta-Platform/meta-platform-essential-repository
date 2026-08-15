import type { EcosystemDefaults } from "../Types"

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const BuildObjectFromPrefix = require("../Helpers/BuildObjectFromPrefix")
const VerifyDirExit = require("../Helpers/VerifyDirExit")
const RestoreDir = require("../Helpers/RestoreDir")

const RestoreEcosystemStructure = async ({
    installDataDirPath,
    ecosystemDefaults
}: {
    installDataDirPath: string
    ecosystemDefaults: EcosystemDefaults
}) => {

    if(await VerifyDirExit(installDataDirPath)){
        const ecosystemDefaultsConfDirname = BuildObjectFromPrefix(ecosystemDefaults, "ECOSYSTEMDATA_CONF_DIRNAME_")
        try{
        
            for (const configKey of Object.keys(ecosystemDefaultsConfDirname)) {
               const dirname = ecosystemDefaultsConfDirname[configKey]
               
               Log.info("RestoreEcosystemStructure", `Verificando configuração ${colors.bold(configKey)}`)
                
                await RestoreDir({
                    installDataDirPath,
                    dirname
                })
            }
    
        } catch (e){
            Log.error("RestoreEcosystemStructure", e)
            Log.error("RestoreEcosystemStructure", `erro ao criar diretório de dados do ecosistema ${installDataDirPath}`)
            throw e
        }
    } else {
        throw "Ecosistema não esta instalado!"
    }
}

module.exports = RestoreEcosystemStructure
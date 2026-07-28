const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const { resolve } = require("path")
const { 
    mkdir
} = require('node:fs/promises')

const BuildObjectFromPrefix = require("../Helpers/BuildObjectFromPrefix")

const ConstructEcosystemStructure = async ({
    installationDataDir,
    ecosystemDefaults
}) => {

    const ecosystemDefaultsConfDirname = BuildObjectFromPrefix(ecosystemDefaults, "ECOSYSTEMDATA_CONF_DIRNAME_")

    try{
        await mkdir(installationDataDir, { recursive: true })
        Log.info("ConstructEcosystemStructure", `O diretório de dados do ecosistema criado com sucesso em ${colors.bold(installationDataDir)}`)

        for (const configKey of Object.keys(ecosystemDefaultsConfDirname)) {

            Log.info("ConstructEcosystemStructure", `Verificando configuração ${colors.bold(configKey)}`)
            
           const dirname = ecosystemDefaultsConfDirname[configKey]
           await mkdir(resolve(installationDataDir, dirname))
           Log.info("ConstructEcosystemStructure", `Configuração ${ colors.bold(configKey)}: o subdiretório ${ colors.bold(dirname)} criado com sucesso!`)
        }

    } catch (e){
        Log.error("ConstructEcosystemStructure", `erro ao criar diretório de dados do ecosistema ${colors.bold(installationDataDir)}`)
        Log.warn("ConstructEcosystemStructure", `Verifique se o ecosistema já esta instalado.`)
        throw e
    }
}

module.exports = ConstructEcosystemStructure
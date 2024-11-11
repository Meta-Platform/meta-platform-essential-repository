const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const { resolve } = require("path")
const { 
    mkdir
} = require('node:fs/promises')

const BuildObjectFromPrefix = require("../Helpers/BuildObjectFromPrefix")

const ConstructEcosystemStructure = async ({
    installationDataDir,
    ecosystemDefaults,
    loggerEmitter
}) => {

    const ecosystemDefaultsConfDirname = BuildObjectFromPrefix(ecosystemDefaults, "ECOSYSTEMDATA_CONF_DIRNAME_")

    try{
        await mkdir(installationDataDir, { recursive: true })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ConstructEcosystemStructure",
            type: "info",
            message: `O diretório de dados do ecosistema criado com sucesso em ${colors.bold(installationDataDir)}`
        })

        for (const configKey of Object.keys(ecosystemDefaultsConfDirname)) {

            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "ConstructEcosystemStructure",
                type: "info",
                message: `Verificando configuração ${colors.bold(configKey)}`
            })
            
           const dirname = ecosystemDefaultsConfDirname[configKey]
           await mkdir(resolve(installationDataDir, dirname))
           loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "ConstructEcosystemStructure",
                type: "info",
                message: `Configuração ${ colors.bold(configKey)}: o subdiretório ${ colors.bold(dirname)} criado com sucesso!`
            })
        }

    } catch (e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ConstructEcosystemStructure",
            type: "error",
            message: `erro ao criar diretório de dados do ecosistema ${colors.bold(installationDataDir)}`
        })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ConstructEcosystemStructure",
            type: "warning",
            message: `Verifique se o ecosistema já esta instalado.`
        })
        throw e
    }
}

module.exports = ConstructEcosystemStructure
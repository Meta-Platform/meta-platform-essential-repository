const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const { resolve } = require("path")
const { 
    mkdir
} = require('node:fs/promises')

const BuildObjectFromPrefix = require("../Helpers/BuildObjectFromPrefix")

const ConstructEcosystemStructure = async ({
    ECO_DIRPATH_INSTALL_DATA,
    ecosystemDefaults,
    loggerEmitter
}) => {

    const ecosystemDefaultsConfDirname = BuildObjectFromPrefix(ecosystemDefaults, "ECOSYSTEMDATA_CONF_DIRNAME_")

    try{
        await mkdir(ECO_DIRPATH_INSTALL_DATA, { recursive: true })
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ConstructEcosystemStructure",
            type: "info",
            message: `o diretório de dados do ecosistema criado com sucesso em ${colors.bold(ECO_DIRPATH_INSTALL_DATA)}`
        })

        for (const configKey of Object.keys(ecosystemDefaultsConfDirname)) {
           const dirname = ecosystemDefaultsConfDirname[configKey]
           await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, dirname))
           loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "ConstructEcosystemStructure",
                type: "info",
                message: `configuração ${ colors.bold(configKey)}: o subdiretório ${ colors.bold(dirname)} criado com sucesso!`
            })
        }

    } catch (e){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ConstructEcosystemStructure",
            type: "error",
            message: `erro ao criar diretório de dados do ecosistema ${colors.bold(ECO_DIRPATH_INSTALL_DATA)}`
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
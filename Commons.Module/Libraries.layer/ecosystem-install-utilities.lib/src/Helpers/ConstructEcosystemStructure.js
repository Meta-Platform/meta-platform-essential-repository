const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const { resolve } = require("path")
const { 
    mkdir
} = require('node:fs/promises')

const FilterStringsWithPrefix = (array, prefix) => 
    array.filter(str => str.startsWith(prefix))

const BuildObjectFromPrefix = (object, prefixAttribute) => {
    const allKeys = Object.keys(object)
    const filteredKeys = FilterStringsWithPrefix(allKeys, prefixAttribute)
    const newObject = filteredKeys.reduce((acc, key) => {
        return {...acc, [key]: object[key]}
    }, {})

    return newObject
}

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
            message: `o diretório de dados do ecosistema criado com sucesso em ${ECO_DIRPATH_INSTALL_DATA}`
        })

        for (const configKey of Object.keys(ecosystemDefaultsConfDirname)) {
           const dirname = ecosystemDefaultsConfDirname[configKey]
           await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, dirname))
           loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "ConstructEcosystemStructure",
                type: "info",
                message: `configuração ${ colors.bold(configKey)} : o subdiretório ${ colors.bold(dirname)} criado com sucesso!`
            })
        }

    } catch (e){
        console.log(e)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ConstructEcosystemStructure",
            type: "error",
            message: `erro ao criar diretório de dados do ecosistema ${ECO_DIRPATH_INSTALL_DATA}`
        })
        throw e
    }
}

module.exports = ConstructEcosystemStructure
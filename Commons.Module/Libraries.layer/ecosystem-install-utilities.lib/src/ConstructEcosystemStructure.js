
const { resolve } = require("path")
const { 
    mkdir
} = require('node:fs/promises')

const ConstructEcosystemStructure = async ({
    ECO_DIRPATH_INSTALL_DATA,
    ecosystemDefaults,
    loggerEmitter
}) => {

    const {
        ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES,
        ECOSYSTEMDATA_CONF_DIRNAME_EXECUTION_DATA_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR,
        ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES
    } = ecosystemDefaults


    try{
        await mkdir(ECO_DIRPATH_INSTALL_DATA, { recursive: true })
        await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_DOWNLOADED_REPOSITORIES))
        await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_EXECUTION_DATA_DIR))
        await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_UNIX_SOCKET_DIR))
        await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_SUPERVISOR_UNIX_SOCKET_DIR))
        await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_ESSENTIAL_BINARY_DIR))
        await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_GLOBAL_EXECUTABLES_DIR))
        await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_CONFIGURATIONS_DIR))
        await mkdir(resolve(ECO_DIRPATH_INSTALL_DATA, ECOSYSTEMDATA_CONF_DIRNAME_NPM_DEPENDENCIES))

        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "ConstructEcosystemStructure",
            type: "info",
            message: `o diretório de dados do ecosistema criado com sucesso em ${ECO_DIRPATH_INSTALL_DATA}`
        })
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
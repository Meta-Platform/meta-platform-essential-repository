const { mkdir } = require('node:fs/promises')

const { join } = require("path")

const CreateDataDir = async ({ 
    environmentPath, 
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
    loggerEmitter
}) => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES)
    try{
        await mkdir(dirpath)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "CreateDataDir",
            type: "info",
            message: `o diretório de dados criado com sucesso em ${dirpath}`
        })
    } catch (e){
        if(e.code === "EEXIST"){
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "CreateDataDir",
                type: "info",
                message: `diretório ${dirpath} já existe`
            })
        }else {
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "CreateDataDir",
                type: "error",
                message: `erro ao criar diretório de dados ${dirpath}`
            })
            throw e
        }
    }
}

module.exports = CreateDataDir
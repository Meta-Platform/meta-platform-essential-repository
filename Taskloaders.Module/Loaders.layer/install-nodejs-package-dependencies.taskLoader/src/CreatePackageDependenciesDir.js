const { mkdir } = require('node:fs/promises')

const { join } = require("path")

const CreatePackageDependenciesDir = async ({
    environmentPath, 
    packageName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
    loggerEmitter
}) => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, packageName)
    try{
        await mkdir(dirpath)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "CreatePackageDependenciesDir",
            type: "info",
            message: `o diretório de dependencia de pacote criado com sucesso em ${dirpath}`
        })
    } catch (e){
        if(e.code === "EEXIST"){
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "CreatePackageDependenciesDir",
                type: "info",
                message: `diretório ${dirpath} já existe`
            })
        }else {
            loggerEmitter && loggerEmitter.emit("log", {
                sourceName: "CreatePackageDependenciesDir",
                type: "error",
                message: `erro ao criar diretório de dependencia de pacote ${dirpath}`
            })
            throw e
        }
    }
}

module.exports = CreatePackageDependenciesDir
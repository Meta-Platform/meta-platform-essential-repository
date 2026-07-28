const { mkdir } = require('node:fs/promises')

const { join } = require("path")

const CreatePackageDependenciesDir = async ({
    environmentPath, 
    packageName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}) => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, packageName)
    try{
        await mkdir(dirpath)
        Log.info("CreatePackageDependenciesDir", `o diretório de dependencia de pacote criado com sucesso em ${dirpath}`)
    } catch (e){
        if(e.code === "EEXIST"){
            Log.info("CreatePackageDependenciesDir", `diretório ${dirpath} já existe`)
        }else {
            Log.error("CreatePackageDependenciesDir", `erro ao criar diretório de dependencia de pacote ${dirpath}`)
            throw e
        }
    }
}

module.exports = CreatePackageDependenciesDir
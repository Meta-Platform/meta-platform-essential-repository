const { mkdir } = require('node:fs/promises')

const { join } = require("path")

const CreateDataDir = async ({ 
    environmentPath, 
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}) => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES)
    try{
        await mkdir(dirpath)
        Log.info("CreateDataDir", `o diretório de dados criado com sucesso em ${dirpath}`)
    } catch (e){
        if(e.code === "EEXIST"){
            Log.info("CreateDataDir", `diretório ${dirpath} já existe`)
        }else {
            Log.error("CreateDataDir", `erro ao criar diretório de dados ${dirpath}`)
            throw e
        }
    }
}

module.exports = CreateDataDir
const { mkdir } = require('node:fs/promises') as typeof import('node:fs/promises')

const { join } = require("path") as typeof import("path")

const CreateDataDir = async ({ 
    environmentPath, 
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}: {
    environmentPath: string
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: string
}): Promise<void> => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES)
    try{
        await mkdir(dirpath)
        Log.info("CreateDataDir", `o diretório de dados criado com sucesso em ${dirpath}`)
    } catch (e: any){
        if(e.code === "EEXIST"){
            Log.info("CreateDataDir", `diretório ${dirpath} já existe`)
        }else {
            Log.error("CreateDataDir", `erro ao criar diretório de dados ${dirpath}`)
            throw e
        }
    }
}

module.exports = CreateDataDir
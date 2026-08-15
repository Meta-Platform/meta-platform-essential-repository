const { stat } = require('node:fs/promises') as typeof import('node:fs/promises')

const { join } = require("path") as typeof import("path")

const VerifyDataDir = async ({ environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES}: {
    environmentPath: string
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: string
}): Promise<boolean> => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES)
    try{
        const stats = await stat(dirpath)
        if(stats.isDirectory()){
            return true
        } else {
            // Este ramo chamava `reject`, que não existe aqui — ver a mesma
            // cópia em VerifyRepoFile e VerifyDirExit. O `throw` preserva o
            // efeito que sempre valeu, sem fingir ser uma Promise.
            throw `${dirpath} não é um diretório`
        }
    } catch (e: any){
        if(e.code === "ENOENT"){
            Log.info("VerifyDataDir", `${dirpath} não existe`)
            return false
        } else {
            throw e
        }
    }
}

module.exports = VerifyDataDir
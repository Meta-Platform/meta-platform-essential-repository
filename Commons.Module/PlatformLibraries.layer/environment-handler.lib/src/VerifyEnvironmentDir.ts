const { stat } = require('node:fs/promises') as typeof import('node:fs/promises')

const GetEnvironmentPath = require("./GetEnvironmentPath") as (environmentName: string, localPath: string) => string

const VerifyEnvironmentDir = async ({
    environmentName, 
    localPath
}: {
    environmentName: string
    localPath: string
}): Promise<boolean> => {
    try{
        const stats = await stat(GetEnvironmentPath(environmentName, localPath))
        if(stats.isDirectory()){
            return true
        } else {
            // Este ramo chamava `reject`, que não existe aqui — ver a mesma
            // cópia em VerifyRepoFile e VerifyDirExit. O `throw` preserva o
            // efeito que sempre valeu, sem fingir ser uma Promise.
            throw `${environmentName} não é um diretório`
        }
    } catch(e){
        Log.info("VerifyEnvironmentDir", `${environmentName} environment não existe`)
        return false
    }
}

module.exports = VerifyEnvironmentDir
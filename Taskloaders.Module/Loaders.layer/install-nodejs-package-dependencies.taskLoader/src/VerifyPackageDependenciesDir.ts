const { stat } = require('node:fs/promises')

const { join } = require("path")

const VerifyPackageDependenciesDir = async ({
    environmentPath, 
    packageName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}: {
    environmentPath: string
    packageName: any
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: any
}) => {
    const dirpath = join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, packageName)
    try{
        const stats = await stat(dirpath)
        if(stats.isDirectory()){
            return true
        } else {
            // Quinta cópia do `reject` inexistente no repositório — ver
            // VerifyRepoFile, VerifyDirExit, VerifyDataDir e VerifyConfigDir.
            throw `${dirpath} não é um diretório`
        }
    } catch (e: any){
        if(e.code === "ENOENT"){
            Log.info("VerifyPackageDependenciesDir", `${dirpath} não existe`)
            return false
        } else {
            throw e
        }
    }
}

module.exports = VerifyPackageDependenciesDir
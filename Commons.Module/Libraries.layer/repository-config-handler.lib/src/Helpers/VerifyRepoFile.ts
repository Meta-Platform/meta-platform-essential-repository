import type { GetRepositoriesFilePathFn, VerifyRepoFileFn } from "../Types"

const {
    stat
} = require('node:fs/promises') as typeof import('node:fs/promises')

const GetRepositoriesFilePath = require("./GetRepositoriesFilePath") as GetRepositoriesFilePathFn

const VerifyRepoFile: VerifyRepoFileFn = async ({
    installDataDirPath,
    REPOS_CONF_FILENAME_REPOS_DATA
}) => {
    const filePath = GetRepositoriesFilePath({
        installDataDirPath,
        REPOS_CONF_FILENAME_REPOS_DATA
    })
    try{
        const stats = await stat(filePath)
        if(stats.isFile()){
            return true
        } else {
            // O caminho existe e não é arquivo. Este ramo chamava `reject`, que
            // não existe aqui — o ReferenceError caía no catch abaixo e virava
            // "não existe". O `throw` preserva esse mesmo efeito sem fingir ser
            // uma Promise; tratar o caso de verdade é assunto de outra mudança.
            throw `${REPOS_CONF_FILENAME_REPOS_DATA} não é um aquivo`
        }
    } catch (e){
        Log.info("VerifyRepoFile", `${REPOS_CONF_FILENAME_REPOS_DATA} não existe`)
        return false
    }
}
module.exports = VerifyRepoFile

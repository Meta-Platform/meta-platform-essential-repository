const { 
    stat
} = require('node:fs/promises') as typeof import('node:fs/promises')


const VerifyConfigDir = async ({ECO_DIRPATH_INSTALL_DATA}: { ECO_DIRPATH_INSTALL_DATA: string }): Promise<boolean> => {
    const [ filename ] = ECO_DIRPATH_INSTALL_DATA.split("/").slice(-1)
    try{
        const stats = await stat(ECO_DIRPATH_INSTALL_DATA)
        if(stats.isDirectory()){
            return true
        } else {
            // Quarta cópia do mesmo `reject` inexistente — ver VerifyRepoFile,
            // VerifyDirExit e VerifyDataDir. O `throw` preserva o efeito.
            throw `${filename} não é um diretório`
        }
    } catch (e){
        Log.info("VerifyConfigDir", `${filename} não existe`)
        return false
    }
}

module.exports = VerifyConfigDir
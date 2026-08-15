const { stat } = require('node:fs/promises') as typeof import('node:fs/promises')

const VerifyDirExit = async (dirpath: string): Promise<boolean> => {
    try{
        const stats = await stat(dirpath)
        if(stats.isDirectory()){
            return true
        } else {
            // O caminho existe e não é diretório. Este ramo chamava `reject`,
            // que não existe aqui: o ReferenceError escapava pelo `throw e`
            // abaixo. O `throw` direto lança a mesma coisa que sempre chegou a
            // quem chamou — um erro —, agora com a mensagem certa.
            throw `${dirpath} não é um diretório`
        }
    } catch (e: any){
        if(e.code === "ENOENT"){
            return false
        } else {
            throw e
        }
    }
}

module.exports = VerifyDirExit
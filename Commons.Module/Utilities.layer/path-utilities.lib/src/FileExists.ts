const { stat } = require('node:fs/promises') as typeof import('node:fs/promises')

/**
 * Responde se há um arquivo neste caminho — o par do `DirectoryExists`, com a
 * mesma regra de três respostas: ausente é `false`, arquivo é `true`, e
 * qualquer outra coisa (um diretório com o nome do arquivo, uma falha de
 * leitura) lança em vez de se disfarçar de ausência.
 */
const FileExists = async (filePath: string): Promise<boolean> => {

    try{
        const stats = await stat(filePath)

        if(stats.isFile()) return true

        throw new Error(`${filePath} existe e não é um arquivo`)

    }catch(error: any){

        if(error && error.code === "ENOENT") return false

        throw error
    }
}

module.exports = FileExists

const { stat } = require('node:fs/promises') as typeof import('node:fs/promises')

/**
 * Responde se há um diretório neste caminho.
 *
 * Três respostas possíveis, e a distinção entre elas é o ponto:
 *
 *   - não existe   → `false`
 *   - é diretório  → `true`
 *   - existe e **não** é diretório, ou não deu para olhar → lança
 *
 * O último caso é o que cinco cópias deste código erravam de cinco jeitos: umas
 * chamavam um `reject` que não existia no escopo, outras devolviam "não existe"
 * para qualquer falha. Um diretório sem permissão de leitura não é um diretório
 * ausente — e responder que está ausente faz quem chamou tentar criá-lo por
 * cima, falhando longe da causa.
 *
 * Não escreve log: quem chama é que sabe o que a ausência significa ali.
 */
const DirectoryExists = async (dirPath: string): Promise<boolean> => {

    try{
        const stats = await stat(dirPath)

        if(stats.isDirectory()) return true

        throw new Error(`${dirPath} existe e não é um diretório`)

    }catch(error: any){

        if(error && error.code === "ENOENT") return false

        throw error
    }
}

module.exports = DirectoryExists

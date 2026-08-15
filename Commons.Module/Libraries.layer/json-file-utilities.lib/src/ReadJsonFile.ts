const fs = require("fs") as typeof import("fs")

/**
 * Lê e desserializa um arquivo JSON.
 *
 * Devolve `undefined` tanto para arquivo ausente quanto para conteúdo inválido:
 * quem chama trata os dois casos como "não há configuração aqui".
 */
const ReadJsonFile = <T = any>(path: string): T | undefined => {
    try {
        const jsonString = fs.readFileSync(path, {encoding:'utf8'})
        return JSON.parse(jsonString)
      } catch (err) {
        return undefined
      }
}

module.exports = ReadJsonFile

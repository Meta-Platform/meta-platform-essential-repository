const fs = require("node:fs") as typeof import("node:fs")
const path = require("node:path") as typeof import("node:path")

/**
 * Variáveis de configuração do ecossistema, como estão no arquivo: nomes de
 * diretório, extensões, níveis de log. O conjunto é aberto — cada versão do
 * ecosystem-defaults pode trazer chaves novas — e por isso não se fecha aqui.
 */
export type EcosystemDefaults = Record<string, any>

/**
 * Acessador único do arquivo `ecosystem-defaults.json`.
 *
 * Resolve o caminho absoluto do arquivo de defaults a partir do diretório do
 * EcosystemData e do caminho relativo informado, lê o JSON e retorna o objeto
 * com as variáveis de configuração do ecossistema.
 *
 * Não há fallback embutido nem cópia das variáveis no código: se o arquivo não
 * existir, o ecossistema não está instalado e um erro explícito é lançado.
 */
const Get = (ecosystemDataPath: string, ecosystemDefaultsFileRelativePath: string): EcosystemDefaults => {
    const fullPath = path.resolve(ecosystemDataPath, ecosystemDefaultsFileRelativePath)

    if (!fs.existsSync(fullPath))
        throw new Error(`ecosystem-defaults.json não encontrado em ${fullPath} — o ecossistema não está instalado`)

    const jsonString = fs.readFileSync(fullPath, { encoding: "utf8" })
    return JSON.parse(jsonString)
}

module.exports = Get

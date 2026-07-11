const fs = require("node:fs")
const path = require("node:path")

/**
 * Acessador único do arquivo `ecosystem-defaults.json`.
 *
 * Resolve o caminho absoluto do arquivo de defaults a partir do diretório do
 * EcosystemData e do caminho relativo informado, lê o JSON e retorna o objeto
 * com as variáveis de configuração do ecossistema.
 *
 * Não há fallback embutido nem cópia das variáveis no código: se o arquivo não
 * existir, o ecossistema não está instalado e um erro explícito é lançado.
 *
 * @param {string} ecosystemDataPath - Diretório raiz do EcosystemData.
 * @param {string} ecosystemDefaultsFileRelativePath - Caminho relativo do arquivo de defaults.
 * @returns {object} Objeto com as variáveis de configuração do ecossistema.
 * @throws {Error} Se o arquivo não for encontrado.
 */
const Get = (ecosystemDataPath, ecosystemDefaultsFileRelativePath) => {
    const fullPath = path.resolve(ecosystemDataPath, ecosystemDefaultsFileRelativePath)

    if (!fs.existsSync(fullPath))
        throw new Error(`ecosystem-defaults.json não encontrado em ${fullPath} — o ecossistema não está instalado`)

    const jsonString = fs.readFileSync(fullPath, { encoding: "utf8" })
    return JSON.parse(jsonString)
}

module.exports = Get

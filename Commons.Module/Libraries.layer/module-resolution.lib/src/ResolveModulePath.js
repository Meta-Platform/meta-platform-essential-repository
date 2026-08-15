/* Deliberadamente JavaScript, e permanentemente — ver ResolveTypeScriptPath.js. */

const { existsSync } = require("fs")
const { join } = require("path")

// Ordem de precedência da plataforma: o JavaScript vence, como na resolução do
// próprio Node. Ver source-language-standard.md.
const MODULE_EXTENSIONS = [".js", ".ts"]

const INDEX_MODULE_NAME = "index"

/**
 * Encontra o arquivo de um módulo a partir do caminho **sem extensão**,
 * independente do dialeto em que ele esteja escrito.
 *
 * Existe para quem precisa saber se um módulo está lá antes de requerê-lo —
 * checagem que, escrita como `existsSync(caminho + ".js")`, passa a mentir no
 * instante em que aquele módulo é convertido para TypeScript: o arquivo existe,
 * a checagem diz que não, e o recurso some sem erro.
 *
 * @returns {string|undefined} caminho do arquivo existente, ou `undefined`
 */
const ResolveModulePath = (basePath, extensions = MODULE_EXTENSIONS) => {

    const candidates = extensions.flatMap((extension) => [
        `${basePath}${extension}`,
        join(basePath, `${INDEX_MODULE_NAME}${extension}`)
    ])

    return candidates.find(existsSync)

}

module.exports = ResolveModulePath

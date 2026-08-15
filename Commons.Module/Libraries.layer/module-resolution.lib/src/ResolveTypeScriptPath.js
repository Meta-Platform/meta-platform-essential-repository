/* Deliberadamente JavaScript, e permanentemente: este arquivo faz parte do
 * mecanismo que ensina o Node a carregar `.ts`. Escrito em TypeScript, não
 * haveria quem o carregasse. Ver source-language-standard.md. */

const { resolve, dirname, isAbsolute } = require("path")
const { fileURLToPath } = require("url")

const ResolveModulePath = require("./ResolveModulePath")

const TYPESCRIPT_ONLY = [".ts"]

const IsPathSpecifier = (specifier) =>
    isAbsolute(specifier) || specifier.startsWith(".")

// O `parentURL` é `undefined` no ponto de entrada e pode não ser `file:` (ex.:
// `data:`). Nenhum dos dois casos impede resolver um specifier absoluto.
const GetParentDirectory = (parentURL) => {
    if(!parentURL) return undefined
    try{
        return dirname(fileURLToPath(parentURL))
    }catch(e){
        return undefined
    }
}

/**
 * Traduz um specifier de módulo para o arquivo `.ts` correspondente, quando ele
 * existe. Só entra em ação depois que a resolução nativa do Node falhou — por
 * isso o JavaScript sempre vence: `Foo.js` é encontrado antes de chegar aqui,
 * e só os candidatos `.ts` interessam neste ponto.
 *
 * @returns {string|undefined} caminho absoluto do arquivo, ou `undefined`
 */
const ResolveTypeScriptPath = (specifier, parentURL) => {

    if(!IsPathSpecifier(specifier)) return undefined

    const parentDirectory = GetParentDirectory(parentURL)

    // Um specifier relativo sem pai não tem a partir de onde ser resolvido.
    if(!isAbsolute(specifier) && !parentDirectory) return undefined

    const basePath = isAbsolute(specifier)
        ? specifier
        : resolve(parentDirectory, specifier)

    return ResolveModulePath(basePath, TYPESCRIPT_ONLY)

}

module.exports = ResolveTypeScriptPath

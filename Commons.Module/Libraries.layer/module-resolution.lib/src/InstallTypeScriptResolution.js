/* Deliberadamente JavaScript, e permanentemente — ver ResolveTypeScriptPath.js. */

const { registerHooks } = require("module")
const { pathToFileURL } = require("url")

const AssertTypeScriptRuntime = require("./AssertTypeScriptRuntime")
const ResolveTypeScriptPath   = require("./ResolveTypeScriptPath")

// Vários pontos de entrada podem instalar no mesmo processo — o GUI-host carrega
// o executor, que carrega libs. Sem a marca, cada chamada empilharia um hook.
const INSTALLED_MARK = Symbol.for("metaplatform.typescript-resolution")

/*
 * `require(...)` — a via oficial. O hook recebe a resolução que falhou e oferece
 * os candidatos `.ts`.
 */
const InstallRequireHook = () =>
    registerHooks({
        resolve: (specifier, context, nextResolve) => {
            try{
                return nextResolve(specifier, context)
            }catch(resolutionError){
                const typeScriptPath = ResolveTypeScriptPath(specifier, context.parentURL)

                if(!typeScriptPath) throw resolutionError

                return { url: pathToFileURL(typeScriptPath).href, shortCircuit: true }
            }
        }
    })

/*
 * `require.resolve(...)` — que os hooks NÃO alcançam. Quem só quer o caminho de
 * um módulo, sem carregá-lo, passa por outra porta: é o caso de quem precisa
 * entregar um caminho absoluto a um subprocesso (o `electron-main` recebe assim
 * o instalador do logger). Sem este trecho, `require.resolve` continuaria
 * respondendo "não existe" para um módulo `.ts` que está lá.
 *
 * Aqui se usa `Module._resolveFilename`, que é API interna do Node — por isso
 * fica RESTRITO a este caso. O caminho principal segue pelo hook oficial acima,
 * de modo que uma mudança do Node degradaria só o `require.resolve`.
 */
const InstallResolveFilenameFallback = () => {

    const Module = require("module")
    const OriginalResolveFilename = Module._resolveFilename

    Module._resolveFilename = function(request, parent, ...remainingArguments){
        try{
            return OriginalResolveFilename.call(this, request, parent, ...remainingArguments)
        }catch(resolutionError){
            const parentURL = parent && parent.filename
                ? pathToFileURL(parent.filename).href
                : undefined

            const typeScriptPath = ResolveTypeScriptPath(request, parentURL)

            if(!typeScriptPath) throw resolutionError

            return typeScriptPath
        }
    }
}

/**
 * Ensina o processo a resolver `.ts` em `require` sem extensão.
 *
 * Instala-se uma vez, no ponto de entrada do processo, como o logger global e
 * pelo mesmo motivo: a partir daí todo arquivo carregado já nasce coberto.
 *
 * O caminho feliz não paga nada — só quando a resolução nativa falha é que os
 * candidatos `.ts` são procurados.
 */
const InstallTypeScriptResolution = () => {

    if(globalThis[INSTALLED_MARK]) return false

    AssertTypeScriptRuntime()

    InstallRequireHook()
    InstallResolveFilenameFallback()

    globalThis[INSTALLED_MARK] = true

    return true

}

module.exports = InstallTypeScriptResolution

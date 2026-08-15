/* Deliberadamente JavaScript, e permanentemente — ver ResolveTypeScriptPath.js. */

const { registerHooks } = require("module")
const { pathToFileURL } = require("url")

const AssertTypeScriptRuntime = require("./AssertTypeScriptRuntime")
const ResolveTypeScriptPath   = require("./ResolveTypeScriptPath")

// Vários pontos de entrada podem instalar no mesmo processo — o GUI-host carrega
// o executor, que carrega libs. Sem a marca, cada chamada empilharia um hook.
const INSTALLED_MARK = Symbol.for("metaplatform.typescript-resolution")

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

    globalThis[INSTALLED_MARK] = true

    return true

}

module.exports = InstallTypeScriptResolution

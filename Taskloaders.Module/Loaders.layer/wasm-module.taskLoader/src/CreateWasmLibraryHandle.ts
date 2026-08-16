const CreateCoreInstance = require("./CreateCoreInstance")
const CreateWasiInstance = require("./CreateWasiInstance")

const WASI_COMMAND_MODE = "command"

// Monta o handle que o consumidor recebe pelo `bound-params`, do mesmo modo que
// uma `.uilib` entrega o seu. O handle é congelado: quem depende do módulo pode
// chamá-lo, não remontá-lo.
const CreateWasmLibraryHandle = ({ manifest, rootPath, compiledModule }: {
    manifest: any
    rootPath: string
    compiledModule: WebAssembly.Module
}) => {

    const _Instantiate = (imports?: Record<string, any>) =>
        manifest.abi === "wasi"
            ? CreateWasiInstance({ compiledModule, manifest, imports })
            : CreateCoreInstance({ compiledModule, manifest, imports })

    // Um módulo `command` é um programa, não uma biblioteca: ele não tem estado
    // útil antes de rodar, e cada execução quer a sua própria memória limpa. Por
    // isso não existe instância padrão aqui — `Run()` cria, executa e larga.
    const isCommand = manifest.abi === "wasi" && manifest.wasi.mode === WASI_COMMAND_MODE

    const defaultInstance = isCommand ? undefined : _Instantiate()

    return Object.freeze({
        getAlias: () => manifest.alias,
        getManifest: () => ({ ...manifest }),
        getRootPath: () => rootPath,

        // O caminho do binário é o que atravessa fronteiras de processo: é assim
        // que o `.wasm` chega ao bundle de um `.webgui` e a um subprocesso, que
        // não podem receber um `WebAssembly.Module` já compilado.
        getBinaryPath: () => manifest.binaryPath,

        // O módulo compilado, para quem quiser instanciar por conta própria
        // (num worker, por exemplo) sem pagar a compilação de novo.
        getModule: () => compiledModule,

        getExports: () => defaultInstance && defaultInstance.exports,
        getMemory: () => defaultInstance && defaultInstance.memory,

        // Instância nova e isolada. É o caminho para trabalho pesado em lotes:
        // a memória linear morre junto com a instância, em vez de ficar no pico
        // do maior lote pelo resto da vida do processo.
        Instantiate: (imports?: Record<string, any>) => _Instantiate(imports),

        Run: (imports?: Record<string, any>) => {
            if (!isCommand)
                throw new Error(`O módulo ${manifest.alias} não é um \`command\` WASI: use getExports() ou Instantiate()`)
            return _Instantiate(imports).Run()
        }
    })
}

module.exports = CreateWasmLibraryHandle

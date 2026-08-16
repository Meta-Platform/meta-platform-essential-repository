// Instancia um módulo de ABI `wasi` (preview1): código compilado com biblioteca
// padrão — C, C++ ou Rust em `wasm32-wasip1` — que espera argumentos, variáveis
// de ambiente e descritores de arquivo.
//
// `node:wasi` é um módulo EMBUTIDO do Node, e por isso o `require` fica aqui
// dentro e não no topo: quem usa um `.wasmlib` de ABI `core` não deve pagar o
// ExperimentalWarning de um recurso que não vai tocar. A regra que proíbe
// `require` adiado vale para dependências npm — elas dependem do `NODE_PATH`
// montado na carga do módulo; um builtin não passa por essa resolução.

// Sem `preopens`, o módulo não recebe diretório nenhum e qualquer caminho que
// tentar abrir falha. A sandbox de WASI é fechada por padrão e o pacote declara
// no manifesto exatamente o que precisa — que é o motivo de WASI ser aceitável
// aqui apesar de dar acesso a filesystem.
const CreateWasiInstance = ({ compiledModule, manifest, imports = {} }: {
    compiledModule: WebAssembly.Module
    manifest: any
    imports?: Record<string, any>
}) => {

    const { WASI } = require("node:wasi") as typeof import("node:wasi")

    const { args, env, preopens, mode } = manifest.wasi

    const wasi = new WASI({ version: "preview1", args, env, preopens })

    const instance = new WebAssembly.Instance(compiledModule, {
        ...imports,
        ...wasi.getImportObject()
    })

    // `reactor` prepara o módulo e devolve os exports vivos; `command` não é
    // iniciado aqui — subir a task não pode disparar o programa. O handle
    // devolve `Run`, e quem chama decide quando.
    if (mode === "reactor")
        wasi.initialize(instance)

    return {
        instance,
        exports: instance.exports,
        memory: instance.exports.memory as WebAssembly.Memory | undefined,
        // Só faz sentido em `command`, e roda UMA vez: `_start` termina com a
        // saída do programa, e a instância não é reutilizável depois disso.
        Run: () => wasi.start(instance)
    }
}

module.exports = CreateWasiInstance

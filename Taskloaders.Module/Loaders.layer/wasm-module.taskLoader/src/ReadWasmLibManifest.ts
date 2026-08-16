const fs = require("fs") as typeof import("fs")
const { join, isAbsolute } = require("path") as typeof import("path")

// O nome do manifesto acompanha o nome do tipo de pacote: `.wasmlib` traz
// `metadata/wasmlib.json`. Mesma convenção do `.uilib`.
const MANIFEST_PATH = join("metadata", "wasmlib.json")

const SUPPORTED_ABIS = ["core", "wasi"]

// `reactor` mantém o módulo VIVO: `_initialize` prepara o estado e os exports
// seguem chamáveis pelo consumidor — é o formato de uma biblioteca.
// `command` é um programa que roda uma vez e termina em `_start`; o loader não o
// executa na ativação, porque uma task que sobe não pode ter efeito colateral de
// processo. Quem chama decide quando, por `Run()`.
const SUPPORTED_WASI_MODES = ["reactor", "command"]

const DEFAULT_WASI_MODE = "reactor"

const Invalid = (manifestPath: string, reason: string) =>
    new Error(`Manifesto de módulo WebAssembly inválido em ${manifestPath}: ${reason}`)

// O binário é declarado por caminho RELATIVO à raiz do pacote e resolvido aqui.
// Caminho absoluto é recusado de propósito: um `.wasmlib` que aponte para fora
// da própria pasta deixa de ser distribuível — o pacote viaja, o caminho não.
const ResolveBinaryPath = (rootPath: string, manifestPath: string, binary: unknown) => {
    if (typeof binary !== "string" || binary.length === 0)
        throw Invalid(manifestPath, "`binary` é obrigatório e deve ser o caminho do .wasm")

    if (isAbsolute(binary))
        throw Invalid(manifestPath, "`binary` deve ser relativo à raiz do pacote")

    const binaryPath = join(rootPath, binary)

    // O artefato é versionado junto do pacote (não é compilado na instalação):
    // se ele não está aqui, o pacote foi publicado incompleto, e falhar agora
    // diz isso — falhar na primeira chamada diria outra coisa.
    if (!fs.existsSync(binaryPath))
        throw Invalid(manifestPath, `binário não encontrado: ${binaryPath}`)

    return binaryPath
}

const ResolveWasiSection = (manifestPath: string, abi: string, wasi: any) => {
    if (abi !== "wasi") return undefined

    const section = wasi || {}
    const mode = section.mode || DEFAULT_WASI_MODE

    if (!SUPPORTED_WASI_MODES.includes(mode))
        throw Invalid(manifestPath, `\`wasi.mode\` deve ser um de ${SUPPORTED_WASI_MODES.join(", ")}`)

    return {
        mode,
        args: Array.isArray(section.args) ? section.args : [],
        env: section.env || {},
        // Sem `preopens`, o módulo WASI não enxerga diretório nenhum — a sandbox
        // fecha por padrão e o pacote abre só o que declarar.
        preopens: section.preopens || {}
    }
}

// A memória só é criada pelo loader quando o manifesto pede. Módulos compilados
// para `wasm32-unknown-unknown` (o caminho normal do Rust) EXPORTAM a própria
// memória; importar uma criada aqui quebraria a instanciação. Declarar `memory`
// é para o caso oposto — módulo que espera `env.memory` vindo de fora.
const ResolveMemorySection = (manifestPath: string, memory: any) => {
    if (!memory) return undefined

    const { initialPages, maximumPages } = memory

    if (!Number.isInteger(initialPages) || initialPages < 0)
        throw Invalid(manifestPath, "`memory.initialPages` deve ser um inteiro não negativo")

    if (maximumPages !== undefined && (!Number.isInteger(maximumPages) || maximumPages < initialPages))
        throw Invalid(manifestPath, "`memory.maximumPages` deve ser um inteiro >= initialPages")

    return { initialPages, maximumPages }
}

const ReadWasmLibManifest = (rootPath: string) => {

    const manifestPath = join(rootPath, MANIFEST_PATH)

    if (!fs.existsSync(manifestPath))
        throw new Error(`Módulo WebAssembly sem ${MANIFEST_PATH}: ${rootPath}`)

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))

    if (!manifest.alias)
        throw Invalid(manifestPath, "`alias` é obrigatório")

    if (!SUPPORTED_ABIS.includes(manifest.abi))
        throw Invalid(manifestPath, `\`abi\` deve ser um de ${SUPPORTED_ABIS.join(", ")}`)

    return {
        alias: manifest.alias,
        abi: manifest.abi,
        binaryPath: ResolveBinaryPath(rootPath, manifestPath, manifest.binary),
        memory: ResolveMemorySection(manifestPath, manifest.memory),
        wasi: ResolveWasiSection(manifestPath, manifest.abi, manifest.wasi),
        // Presença do módulo no bundle web. O loader não builda nada: ele só
        // carrega o campo adiante, para quem monta a interface web decidir.
        web: manifest.web || {}
    }
}

ReadWasmLibManifest.MANIFEST_PATH = MANIFEST_PATH

module.exports = ReadWasmLibManifest

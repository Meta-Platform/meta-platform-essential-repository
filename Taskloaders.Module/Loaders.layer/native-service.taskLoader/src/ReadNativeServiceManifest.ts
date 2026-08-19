const fs = require("fs") as typeof import("fs")
const { join, isAbsolute } = require("path") as typeof import("path")

// O nome do manifesto acompanha o nome do tipo de pacote: `.nativeservice` traz
// `metadata/nativeservice.json`. Mesma convenção do `.uilib` e do `.wasmlib`.
const MANIFEST_PATH = join("metadata", "nativeservice.json")

// Os quatro símbolos que o Native Service Manifest Standard lista como o mínimo
// que o host precisa para governar o ciclo de vida do serviço-folha. A ordem é a
// da norma, e é ela que aparece na mensagem de erro.
//
// `nativeservice_abi_version` é o primeiro por um motivo de contrato: o host o
// chama ANTES de qualquer outro, para recusar um artefato que não fale a versão
// de ABI que ele espera. A assinatura de `nativeservice_handle` é livre — o que
// a norma fixa é que o símbolo exista.
const REQUIRED_SYMBOLS = [
    "nativeservice_abi_version",
    "nativeservice_init",
    "nativeservice_handle",
    "nativeservice_shutdown"
]

// Chave da matriz `binary`: `<plataforma>-<arquitetura>`, nos mesmos valores que
// o Node reporta (`process.platform`/`process.arch`) — `linux-x64`,
// `linux-arm64`. Um `cdylib` compilado para uma combinação não roda na outra: é
// a diferença registrada no ADR-0002 entre o `.wasm` (um arquivo para todo
// lugar) e o nativo (um artefato por combinação declarada).
const PLATFORM_KEY_FORMAT = /^[a-z0-9]+-[a-z0-9]+$/

const Invalid = (manifestPath: string, reason: string) =>
    new Error(`Manifesto de serviço nativo inválido em ${manifestPath}: ${reason}`)

// Cada artefato é declarado por caminho RELATIVO à raiz do pacote e resolvido
// aqui. Caminho absoluto é recusado de propósito, pela mesma razão do
// `.wasmlib`: um pacote que aponte para fora da própria pasta deixa de ser
// distribuível — o pacote viaja, o caminho não.
const ResolveBinaryMatrix = (rootPath: string, manifestPath: string, binary: any) => {

    if (!binary || typeof binary !== "object" || Array.isArray(binary))
        throw Invalid(manifestPath, "`binary` é obrigatório e deve ser um mapa `plataforma-arquitetura` → caminho")

    const platformKeys = Object.keys(binary)

    if (platformKeys.length === 0)
        throw Invalid(manifestPath, "`binary` deve declarar ao menos uma combinação `plataforma-arquitetura`")

    const matrix: Record<string, string> = {}

    for (const platformKey of platformKeys) {

        if (!PLATFORM_KEY_FORMAT.test(platformKey))
            throw Invalid(manifestPath, `\`binary.${platformKey}\` não tem o formato \`plataforma-arquitetura\` (ex.: linux-x64)`)

        const declaredPath = binary[platformKey]

        if (typeof declaredPath !== "string" || declaredPath.length === 0)
            throw Invalid(manifestPath, `\`binary.${platformKey}\` deve ser o caminho da biblioteca dinâmica`)

        if (isAbsolute(declaredPath))
            throw Invalid(manifestPath, `\`binary.${platformKey}\` deve ser relativo à raiz do pacote`)

        const binaryPath = join(rootPath, declaredPath)

        // O artefato é versionado junto do pacote (não é compilado na
        // instalação): um caminho declarado que não existe é pacote publicado
        // incompleto. Faltar a combinação DESTA máquina é outra coisa — não é
        // erro de manifesto, é `binário não encontrado` na ativação da task, e
        // quem responde por isso é o ResolveBinaryForPlatform.
        if (!fs.existsSync(binaryPath))
            throw Invalid(manifestPath, `\`binary.${platformKey}\` aponta para um arquivo que não existe: ${binaryPath}`)

        matrix[platformKey] = binaryPath
    }

    return matrix
}

const ResolveSymbols = (manifestPath: string, symbols: any) => {

    if (!Array.isArray(symbols) || symbols.length === 0)
        throw Invalid(manifestPath, "`symbols` é obrigatório e deve ser a lista dos símbolos exportados pelo binário")

    if (symbols.some((symbol: any) => typeof symbol !== "string" || symbol.length === 0))
        throw Invalid(manifestPath, "`symbols` deve conter apenas nomes de símbolo")

    const missing = REQUIRED_SYMBOLS.filter((symbol) => !symbols.includes(symbol))

    // A mensagem diz QUAIS faltam, não que "falta símbolo": um manifesto
    // incompleto é o caso comum de quem está escrevendo o primeiro serviço, e
    // descobrir um símbolo por vez custa uma ativação por símbolo.
    if (missing.length > 0)
        throw Invalid(manifestPath, `\`symbols\` não declara os símbolos obrigatórios: ${missing.join(", ")}`)

    return [...symbols]
}

// `capabilities` NÃO é imposta por sandbox nenhuma — código nativo não tem
// isolamento, e nada no processo impede o serviço de acessar o que não
// declarou. O campo existe para admissão e auditoria: é o registro explícito de
// por que este serviço precisa ser `.nativeservice` e não `.wasmlib`, que é o
// critério que o ADR-0002 exige antes de aceitar a exceção nativa. Por isso a
// `reason` é obrigatória — uma capacidade sem razão não serve ao único fim que
// o campo tem.
const ResolveCapabilities = (manifestPath: string, capabilities: any) => {

    if (!Array.isArray(capabilities) || capabilities.length === 0)
        throw Invalid(manifestPath, "`capabilities` é obrigatório e deve justificar por que o serviço é nativo")

    return capabilities.map((capability: any) => {

        if (!capability || typeof capability !== "object" || Array.isArray(capability))
            throw Invalid(manifestPath, "cada entrada de `capabilities` deve ser um objeto `{ name, reason }`")

        const { name, reason } = capability

        if (typeof name !== "string" || name.length === 0)
            throw Invalid(manifestPath, "cada entrada de `capabilities` precisa de `name`")

        if (typeof reason !== "string" || reason.length === 0)
            throw Invalid(manifestPath, `a capacidade \`${name}\` precisa de \`reason\`: é o registro de por que o serviço não pode ser .wasmlib`)

        return { name, reason }
    })
}

const ReadNativeServiceManifest = (rootPath: string) => {

    const manifestPath = join(rootPath, MANIFEST_PATH)

    if (!fs.existsSync(manifestPath))
        throw new Error(`Serviço nativo sem ${MANIFEST_PATH}: ${rootPath}`)

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))

    if (!manifest.alias)
        throw Invalid(manifestPath, "`alias` é obrigatório")

    // A ABI é versionada pelo próprio manifesto, e não pela versão do runtime
    // que carrega o binário — é essa a diferença que o ADR-0002 aponta entre o
    // `.nativeservice` e o `.nativelib` amarrado a N-API. Ela incrementa a cada
    // mudança incompatível de assinatura ou de contrato de `symbols`, logo é um
    // inteiro positivo, nunca uma string de versão.
    if (!Number.isInteger(manifest.abiVersion) || manifest.abiVersion < 1)
        throw Invalid(manifestPath, "`abiVersion` é obrigatório e deve ser um inteiro >= 1")

    return {
        alias: manifest.alias,
        abiVersion: manifest.abiVersion,
        binary: ResolveBinaryMatrix(rootPath, manifestPath, manifest.binary),
        symbols: ResolveSymbols(manifestPath, manifest.symbols),
        capabilities: ResolveCapabilities(manifestPath, manifest.capabilities)
    }
}

ReadNativeServiceManifest.MANIFEST_PATH = MANIFEST_PATH
ReadNativeServiceManifest.REQUIRED_SYMBOLS = REQUIRED_SYMBOLS

module.exports = ReadNativeServiceManifest

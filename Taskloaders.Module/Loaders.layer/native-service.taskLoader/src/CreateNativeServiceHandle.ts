// Monta o handle que o consumidor recebe, do mesmo modo que o `wasm-module`
// entrega o dele. O handle é congelado: quem depende do serviço pode
// descrevê-lo, não remontá-lo.
//
// O que ele NÃO faz: carregar o `cdylib`. Um `.nativeservice` não é carregado
// dentro do processo Node — se fosse, seria um `.nativelib`, com a amarração a
// N-API que o ADR-0002 recusa. Quem carrega o binário é o host nativo genérico,
// noutro processo, e o que atravessa essa fronteira é o CAMINHO do artefato.
const CreateNativeServiceHandle = ({ manifest, rootPath, platformKey, binaryPath }: {
    manifest: any
    rootPath: string
    platformKey: string
    binaryPath: string
}) => Object.freeze({

    getAlias: () => manifest.alias,
    getManifest: () => ({ ...manifest, binary: { ...manifest.binary } }),
    getRootPath: () => rootPath,

    // A versão da ABI C que este artefato fala. O host a confere contra o que o
    // próprio binário responde em `nativeservice_abi_version` ANTES de chamar
    // qualquer outra função — é o que impede um artefato de outra geração de
    // executar meia inicialização antes de falhar.
    getAbiVersion: () => manifest.abiVersion,

    // A combinação desta máquina e o artefato escolhido para ela.
    getPlatformKey: () => platformKey,
    getBinaryPath: () => binaryPath,

    // A matriz inteira, para quem precisa saber onde o serviço roda sem estar
    // rodando lá (um empacotador, um verificador de release).
    getBinaryMatrix: () => ({ ...manifest.binary }),

    getSymbols: () => [...manifest.symbols],

    // `capabilities` não é contenção — nada no processo nativo impede o serviço
    // de acessar o que não declarou. É admissão e auditoria: o registro do
    // porquê de este serviço ser nativo em vez de `.wasmlib`.
    getCapabilities: () => manifest.capabilities.map((capability: any) => ({ ...capability }))
})

module.exports = CreateNativeServiceHandle

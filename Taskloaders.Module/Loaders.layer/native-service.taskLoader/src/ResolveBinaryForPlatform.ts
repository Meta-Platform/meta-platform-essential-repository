// Escolhe, na matriz declarada pelo manifesto, o artefato desta máquina.
//
// Ao contrário do `.wasm` — um arquivo só para todo lugar —, um `cdylib`
// compilado para `linux-x64` não roda em `linux-arm64`. A portabilidade de um
// `.nativeservice` é comprada pelo manifesto declarar a matriz inteira, não
// pelo artefato ser universal (ADR-0002, Consequências negativas).
//
// Faltar a combinação DESTA máquina não é erro de manifesto — o manifesto pode
// estar perfeito e o pacote simplesmente não ter sido compilado para cá. É erro
// de ATIVAÇÃO, e a mensagem diz o que o pacote traz, para o operador não ter de
// abrir o manifesto para descobrir.
const ResolveBinaryForPlatform = (manifest: any, platform: string = process.platform, arch: string = process.arch) => {

    const platformKey = `${platform}-${arch}`
    const binaryPath = manifest.binary[platformKey]

    if (!binaryPath)
        throw new Error(
            `Binário não encontrado para a plataforma ${platformKey}: ` +
            `o serviço ${manifest.alias} declara ${Object.keys(manifest.binary).join(", ")}`
        )

    return { platformKey, binaryPath }
}

module.exports = ResolveBinaryForPlatform

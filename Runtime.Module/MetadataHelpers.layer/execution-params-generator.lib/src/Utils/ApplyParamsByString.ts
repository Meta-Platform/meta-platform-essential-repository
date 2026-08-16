const ResolveParamsByString = require("./ResolveParamsByString")

/* Aplica os params ao template e devolve só o texto — a mesma assinatura de
 * sempre. Quem precisa saber SE resolveu (e não apenas no quê) chama
 * ResolveParamsByString direto. */
const ApplyParamsByString = (source: any, metadata: any) => {
    const { value } = ResolveParamsByString(source, metadata)
    return value
}

module.exports = ApplyParamsByString

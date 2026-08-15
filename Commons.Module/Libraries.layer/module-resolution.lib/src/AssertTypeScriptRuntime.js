/* Deliberadamente JavaScript, e permanentemente — ver ResolveTypeScriptPath.js. */

// Versão em que o Node passou a apagar os tipos de um `.ts` sem flag.
const MINIMUM_MAJOR = 22
const MINIMUM_MINOR = 18

const ParseVersion = (version) => {
    const [ major, minor ] = version.split(".").map(Number)
    return { major, minor }
}

const IsSupported = ({ major, minor }) =>
    major > MINIMUM_MAJOR || (major === MINIMUM_MAJOR && minor >= MINIMUM_MINOR)

/**
 * Recusa a execução em runtime que não apaga tipos. A falha precisa acontecer
 * aqui, no ponto de entrada: mais adiante ela apareceria como um erro de sintaxe
 * dentro de um package, apontando para o arquivo errado.
 */
const AssertTypeScriptRuntime = (version = process.versions.node) => {

    if(IsSupported(ParseVersion(version))) return

    throw new Error(
        `Node.js ${MINIMUM_MAJOR}.${MINIMUM_MINOR} ou superior é necessário para executar packages TypeScript ` +
        `(em uso: ${version}). Ver source-language-standard.md.`
    )

}

module.exports = AssertTypeScriptRuntime

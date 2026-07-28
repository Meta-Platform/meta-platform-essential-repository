process.env.NODE_OPTIONS = "--dns-result-order=ipv4first"
const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const Arborist = SmartRequire("@npmcli/arborist")

const SynchronizeNodejsDependencies = async ({
    contextPath, 
    dependencies
}) => {

    Log.warn("SynchronizeNodejsDependencies", `Sincronizando dependências NPM ...`)
    Log.warn("SynchronizeNodejsDependencies", `Contexto da instalação ${colors.bold(contextPath)}`)

    const dependenciesForAdd = Object.keys(dependencies)
        .map((name) => {
            const version = dependencies[name]
            return `${name}@${version}`
        })
    const arborist = new Arborist({ path: contextPath, progress:true})
    await arborist.reify({add:dependenciesForAdd})

    Log.info("SynchronizeNodejsDependencies", `As dependências NPM ${dependenciesForAdd.join(", ")} foram sincronizadas com sucesso!`)
}

module.exports = SynchronizeNodejsDependencies
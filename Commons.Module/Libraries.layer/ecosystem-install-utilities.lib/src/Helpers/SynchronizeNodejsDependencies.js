const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const Arborist = SmartRequire("@npmcli/arborist")

const SynchronizeNodejsDependencies = async ({
    contextPath, 
    dependencies,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "SynchronizeNodejsDependencies",
        type: "warning",
        message: `Sincronizando dependências NPM ...`
    }) && loggerEmitter.emit("log", {
        sourceName: "SynchronizeNodejsDependencies",
        type: "warning",
        message: `Contexto da instalação ${colors.bold(contextPath)}`
    })

    const dependenciesForAdd = Object.keys(dependencies)
        .map((name) => {
            const version = dependencies[name]
            return `${name}@${version}`
        })
    const arborist = new Arborist({ path: contextPath, progress:true})
    await arborist.reify({add:dependenciesForAdd})

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "SynchronizeNodejsDependencies",
        type: "info",
        message: `As dependências NPM ${dependenciesForAdd.join(", ")} foram sincronizadas com sucesso!`
    })
}

module.exports = SynchronizeNodejsDependencies
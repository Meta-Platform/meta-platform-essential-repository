const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const Arborist = SmartRequire("@npmcli/arborist")

const InstallNodejsDependencies = async ({
    contextPath, 
    dependencies,
    loggerEmitter
}) => {

    loggerEmitter && loggerEmitter.emit("log", {
        sourceName: "InstallNodejsDependencies",
        type: "info",
        message: `Início da instalação das dependências NPM ...`
    }) && loggerEmitter.emit("log", {
        sourceName: "InstallNodejsDependencies",
        type: "info",
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
        sourceName: "InstallNodejsDependencies",
        type: "info",
        message: `As dependências NPM ${dependenciesForAdd.join(", ")} foram instaladas com sucesso!`
    })
}

module.exports = InstallNodejsDependencies
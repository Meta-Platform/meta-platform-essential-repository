process.env.NODE_OPTIONS = "--dns-result-order=ipv4first"
const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")
const Arborist = SmartRequire("@npmcli/arborist")

const EnsureElectronBinary = require("./EnsureElectronBinary") as (params: { contextPath: string }) => Promise<void>

const SynchronizeNodejsDependencies = async ({
    contextPath, 
    dependencies
}: {
    contextPath: string
    dependencies: Record<string, string>
}): Promise<void> => {

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

    // O pacote npm `electron` não traz mais o binário (Electron 42+). Este é o
    // único ponto por onde passam TODOS os caminhos de sincronização — instalação
    // do ecossistema, atualização e as deps declaradas por task loader — e é o
    // primeiro instante em que o `install.js` do pacote existe em disco.
    // Condicional de propósito: quem não tem `.desktopapp` não declara `electron`
    // e não paga o download.
    if(dependencies["electron"])
        await EnsureElectronBinary({ contextPath })
}

module.exports = SynchronizeNodejsDependencies
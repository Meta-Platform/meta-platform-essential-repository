const { join } = require("path")
const fs = require("fs")

// Dependências do essential que os loaders precisam. Como um loader pode viver em
// OUTRO repositório (ex.: endpoint-instance no ecosystem-core), ele não pode mais
// usar `require` relativo até o essential. O registry (que vive no essential)
// resolve essas deps aqui e as INJETA nos loaders marcados com `injectsDeps` no
// taskloaders.json — contrato de fábrica `(runtimeDeps: any) => (params: any, executorChannel: any) => ...`.
const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")
const SmartRequire             = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const ComputeObjectHash        = require("../../../../Commons.Module/Utilities.layer/compute-object-hash.lib/src/ComputeObjectHash")
const ResolveModulePath        = require("../../../../Commons.Module/Libraries.layer/module-resolution.lib/src/ResolveModulePath")

// Caminho absoluto do SmartRequire — passado a subprocessos (ex.: electron-main do
// desktop-window-instance) que precisam resolver deps do essential por PATH, não por módulo.
const smartRequirePath = require.resolve("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

// Idem para a logger.lib: o processo do Electron é separado e precisa instalar
// o seu PRÓPRIO globalThis.Log — sem isso, todo log de app desktop nasceria
// fora do padrão e só existiria como texto no stdout capturado pelo daemon.
const installGlobalLoggerPath = require.resolve("../../../../Commons.Module/Libraries.layer/logger.lib/src/InstallGlobalLogger")

// Idem para a resolução de TypeScript: o subprocesso do Electron precisa
// instalar a SUA, senão nenhum package `.ts` carrega lá dentro.
// Ver: meta-platform-open-standard/specifications/source-language-standard.md
const installTypeScriptResolutionPath = require.resolve("../../../../Commons.Module/Libraries.layer/module-resolution.lib/src/InstallTypeScriptResolution")

// WebInterfaceBuilder é capacidade WEB — vive no ecosystem-core (web-interface-builder.lib).
// Resolvido só se o EcosystemCoreRepo estiver instalado (senão os loaders web nem existem).
// Devolve { builder, path }: o módulo (fábrica já aplicada) e o caminho absoluto (p/ subprocessos).
const ResolveWebInterfaceBuilder = (repositoriesData: any) => {
    const core = repositoriesData.EcosystemCoreRepo
    if (!core) return undefined
    const wibPath = join(core.installationPath, "Main.Module/Libraries.layer/web-interface-builder.lib/src/WebInterfaceBuilder")
    // Presença do módulo, e não do arquivo `.js`: escrito como `${wibPath}.js`,
    // este teste passaria a mentir no dia em que a lib fosse convertida para
    // TypeScript — os loaders web sumiriam sem erro nenhum.
    if (!ResolveModulePath(wibPath)) return undefined
    return { builder: require(wibPath)(SmartRequire), path: wibPath } // fábrica: recebe SmartRequire
}

// Descoberta dinâmica de object loaders (Fase 2).
// Varre os repositórios instalados (repositories.json), lê o metadata/taskloaders.json
// de cada um e monta o mapa { objectLoaderType -> função-loader }.
// Sem fallback: repositório sem taskloaders.json não contribui loaders (ver MPTL-12).
// Rede de segurança do `globalThis.Log`. Quem instala o logger é o ponto de
// entrada (package-executor, package-runner, wizard), mas o binário do
// package-executor pode ser ANTERIOR a essa injeção, enquanto os loaders — que
// vivem nos repositórios e já usam `Log` — chegam por `repo update`. Sem esta
// garantia, essa combinação quebraria toda execução com "Log is not defined".
// Aqui o logger sai só no terminal: quem sabe onde gravar é o ponto de entrada.
const EnsureGlobalLogger = () => {

    if (globalThis.Log) return

    try {
        require("../../../../Commons.Module/Libraries.layer/logger.lib/src/InstallGlobalLogger")({
            origin         : "task-executor",
            disableFileSink: true
        })
    } catch (error) {
        /* Sem logger: os loaders seguem, e o log daquela execução se perde. */
    }
}

const CreateTaskLoaders = ({ repositoriesData }: { repositoriesData: any }) => {

    EnsureGlobalLogger()

    const webInterfaceBuilder = ResolveWebInterfaceBuilder(repositoriesData)

    const runtimeDeps = {
        TaskStatusTypes,
        CommandChannelEventTypes,
        SmartRequire,
        ComputeObjectHash,
        WebInterfaceBuilder: webInterfaceBuilder && webInterfaceBuilder.builder,
        // Caminhos absolutos p/ subprocessos (ex.: electron-main) que resolvem por PATH.
        paths: {
            smartRequire: smartRequirePath,
            webInterfaceBuilder: webInterfaceBuilder && webInterfaceBuilder.path,
            installGlobalLogger: installGlobalLoggerPath,
            installTypeScriptResolution: installTypeScriptResolutionPath
        }
    }

    // Mapa aberto: objectLoaderType → loader, montado a partir do que cada
    // repositório instalado declara no seu taskloaders.json.
    const taskLoaders: Record<string, any> = {}

    for (const repositoryNamespace of Object.keys(repositoriesData)) {

        const { installationPath } = repositoriesData[repositoryNamespace]
        const taskLoadersFilePath = join(installationPath, "metadata", "taskloaders.json")

        if (!fs.existsSync(taskLoadersFilePath))
            continue

        const { taskLoaders: declaredTaskLoaders = [] } =
            JSON.parse(fs.readFileSync(taskLoadersFilePath, { encoding: "utf8" }))

        for (const declaredTaskLoader of declaredTaskLoaders) {
            const { objectLoaderType, path: packagePath, entry, injectsDeps } = declaredTaskLoader
            const loaderModulePath = join(installationPath, packagePath, entry)
            const loaderModule = require(loaderModulePath)
            // injectsDeps: o módulo é uma FÁBRICA que recebe runtimeDeps e devolve o loader.
            taskLoaders[objectLoaderType] = injectsDeps ? loaderModule(runtimeDeps) : loaderModule
        }
    }

    return taskLoaders
}

module.exports = CreateTaskLoaders

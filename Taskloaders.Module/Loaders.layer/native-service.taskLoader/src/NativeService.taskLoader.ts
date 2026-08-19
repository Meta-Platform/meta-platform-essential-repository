const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const ReadNativeServiceManifest = require("./ReadNativeServiceManifest")
const ResolveBinaryForPlatform  = require("./ResolveBinaryForPlatform")
const CreateNativeServiceHandle = require("./CreateNativeServiceHandle")

// Object loader do tipo `native-service`: carrega um pacote `.nativeservice` —
// um serviço-folha de I/O implementado como código nativo compilado — e entrega
// um handle que o descreve.
//
// O tipo existe para a fração de serviços que o ADR-0002 identifica como não
// podendo ser WASM por CAPACIDADE, não por preferência: quem precisa abrir um
// socket de domínio Unix, chamar `epoll` ou falar com o `docker.sock` não
// alcança isso de dentro de `wasi:sockets`. O ganho medido é de ordem de
// grandeza — um serviço-folha em Node parte de 104–211 MiB de RSS; o mesmo
// papel em nativo, de ~2 MiB.
//
// O QUE ESTE LOADER NÃO FAZ, e por quê: ele não carrega o `cdylib` e não sobe
// processo nenhum. Carregar o binário dentro do processo Node seria transformar
// um `.nativeservice` num `.nativelib` — a amarração a N-API que o ADR-0002
// recusa no item 5. Quem carrega o artefato é o host nativo genérico, noutro
// processo, e a ligação entre uma task de plano de execução e esse host é
// justamente o que o Native Service Manifest Standard declara FORA DE ESCOPO
// ("A ligação com o Task Executor e o `objectLoaderType` ... não está definida
// aqui"). Até que essa norma exista, a task ativa entrega a descrição validada
// do serviço — alias, ABI, artefato desta plataforma, símbolos e capacidades —
// e é isso que o consumidor recebe.
const NativeServiceTaskLoader = (params: any, executorChannel: any) => {

    const log = Log
        .child({
            instanceId     : process.env.META_LAUNCH_ID || null,
            environmentPath: params.environmentPath || null
        })
        .source("NativeService")

    let serviceHandle: any

    const Start = () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        try {
            const { path: rootPath } = params

            const manifest = ReadNativeServiceManifest(rootPath)

            // Duas falhas diferentes, de propósito separadas: o manifesto pode
            // estar impecável e o pacote simplesmente não ter sido compilado
            // para esta máquina. A primeira é erro de quem publicou o pacote; a
            // segunda, de quem escolheu onde ativá-lo.
            const { platformKey, binaryPath } = ResolveBinaryForPlatform(manifest)

            serviceHandle = CreateNativeServiceHandle({ manifest, rootPath, platformKey, binaryPath })

            log.info(`serviço nativo ${manifest.alias} (abiVersion ${manifest.abiVersion}) resolvido para ${platformKey}`)

            // As capacidades declaradas vão para o log porque não vão para
            // lugar nenhum além dele: `capabilities` não é imposta por sandbox
            // — código nativo não tem isolamento. O registro é o que sobra para
            // auditar o que este serviço se autorizou a fazer.
            manifest.capabilities.forEach((capability: any) =>
                log.debug(`capacidade declarada: ${capability.name} — ${capability.reason}`))

            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)
        } catch (error: any) {
            serviceHandle = undefined
            // A mensagem vai junto do status: manifesto ausente, ABI sem
            // versão, símbolo obrigatório não declarado e plataforma sem
            // artefato falham todos no mesmo ponto, e sem o motivo a task
            // apareceria como FAILURE sem dizer qual deles.
            executorChannel.emit(
                CommandChannelEventTypes.CHANGE_TASK_STATUS,
                TaskStatusTypes.FAILURE,
                error.message
            )
            log.error("falha ao carregar o serviço nativo", error)
        }
    }

    const Stop = () => {
        // Não há o que encerrar aqui: o ciclo de vida do processo nativo é do
        // host, e o encerramento ordenado do serviço acontece pelo
        // `nativeservice_shutdown` que o host chama antes de `KillInstance`.
        serviceHandle = undefined
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    }

    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => serviceHandle
}

module.exports = NativeServiceTaskLoader

const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const ReadWasmLibManifest    = require("./ReadWasmLibManifest")
const CompileWasmModule      = require("./CompileWasmModule")
const CreateWasmLibraryHandle = require("./CreateWasmLibraryHandle")

// Object loader do tipo `wasm-module`: carrega um pacote `.wasmlib` e entrega um
// handle com o módulo WebAssembly já compilado e instanciado.
//
// O tipo existe para tirar trabalho numérico pesado dos laços em JavaScript sem
// voltar ao addon nativo: um `.wasm` é UM arquivo, igual em toda plataforma, sem
// node-gyp, sem toolchain na máquina que instala e sem recompilar a cada versão
// do Node. O binário é versionado com o pacote — quem compila é o autor do
// módulo, na toolchain dele.
const WasmModuleTaskLoader = (params: any, executorChannel: any) => {

    const log = Log
        .child({
            instanceId     : process.env.META_LAUNCH_ID || null,
            environmentPath: params.environmentPath || null
        })
        .source("WasmModule")

    let libraryHandle: any

    const Start = async () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        try {
            const { path: rootPath } = params

            const manifest = ReadWasmLibManifest(rootPath)

            // A compilação é assíncrona de propósito: é o passo caro, e é o
            // único aqui que vale tirar da thread. Instanciar depois é barato.
            const compiledModule = await CompileWasmModule(manifest.binaryPath)

            libraryHandle = CreateWasmLibraryHandle({ manifest, rootPath, compiledModule })

            log.info(`módulo WebAssembly ${manifest.alias} (abi ${manifest.abi}) carregado`)
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)
        } catch (error: any) {
            libraryHandle = undefined
            // A mensagem vai junto do status: um `.wasm` ausente, um manifesto
            // inválido e um binário corrompido falham no mesmo ponto, e sem o
            // motivo a task apareceria como FAILURE sem dizer qual dos três.
            executorChannel.emit(
                CommandChannelEventTypes.CHANGE_TASK_STATUS,
                TaskStatusTypes.FAILURE,
                error.message
            )
            log.error("falha ao carregar o módulo WebAssembly", error)
        }
    }

    const Stop = () => {
        // Soltar o handle solta o módulo compilado e a instância padrão com ele.
        // A memória linear de uma instância WebAssembly só volta ao processo
        // quando a instância é coletada — não há como encolhê-la em uso.
        libraryHandle = undefined
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    }

    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => libraryHandle
}

module.exports = WasmModuleTaskLoader

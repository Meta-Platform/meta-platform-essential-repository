const { describe, before, it } = require("node:test") as typeof import("node:test")
const assert = (require("node:assert") as typeof import("node:assert")).strict
const { join, resolve } = require("node:path") as typeof import("node:path")
const EventEmitter = require("node:events") as typeof import("node:events")

require("../../../../Commons.Module/Libraries.layer/logger.lib/src/InstallGlobalLogger")({
    origin: "wasm-module-task-loader-test",
    disableFileSink: true,
    consoleLevel: "error"
})

const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const WasmModuleTaskLoader = require("../src/WasmModule.taskLoader")

const REFERENCE_PACKAGE = resolve(__dirname, "../../../../Commons.Module/Libraries.layer/wasm-reference.wasmlib")
const WASI_FIXTURE      = join(__dirname, "fixtures", "wasi-reactor.wasmlib")
const BROKEN_FIXTURES   = join(__dirname, "fixtures", "broken")

// Sobe o loader como o task executor faria: instancia, emite START_TASK e espera
// o status parar de mudar. O executor real é assíncrono; aqui basta escutar o
// primeiro status terminal (ACTIVE ou FAILURE).
const StartLoader = (packagePath: string) => new Promise<any>((resolveStart) => {
    const executorChannel = new EventEmitter()
    const statuses: any[] = []

    executorChannel.on(CommandChannelEventTypes.CHANGE_TASK_STATUS, (status: any, reason: any) => {
        statuses.push({ status, reason })
        if (status === TaskStatusTypes.ACTIVE || status === TaskStatusTypes.FAILURE)
            resolveStart({ getServiceObject, statuses, executorChannel })
    })

    const getServiceObject = WasmModuleTaskLoader({ path: packagePath }, executorChannel)
    executorChannel.emit(CommandChannelEventTypes.START_TASK)
})

describe("wasm-module task loader — ABI core", () => {

    let handle: any
    let statuses: any[]

    before(async () => {
        const started = await StartLoader(REFERENCE_PACKAGE)
        statuses = started.statuses
        handle = started.getServiceObject()
    })

    it("ativa a task e entrega o handle", () => {
        assert.equal(statuses.at(-1).status, TaskStatusTypes.ACTIVE)
        assert.equal(handle.getAlias(), "@wasm-reference")
        assert.equal(handle.getManifest().abi, "core")
    })

    it("expõe o binário por caminho, para quem não pode receber o módulo compilado", () => {
        assert.ok(handle.getBinaryPath().endsWith("dist/wasm-reference.wasm"))
    })

    it("chama uma função exportada", () => {
        assert.equal(handle.getExports().add(2, 40), 42)
    })

    it("faz o laço numérico sobre a memória linear", () => {
        const { alloc, dealloc, sum_f32, scale_f32 } = handle.getExports()
        const memory = handle.getMemory()

        const values = [1.5, 2.5, 3.0, 4.0]
        const bytes = values.length * Float32Array.BYTES_PER_ELEMENT
        const pointer = alloc(bytes)

        // A view é criada DEPOIS do alloc e não é guardada: `memory.buffer` é
        // trocado sempre que a memória linear cresce, e uma view antiga passa a
        // apontar para um ArrayBuffer descolado (`detached`).
        new Float32Array(memory.buffer, pointer, values.length).set(values)

        assert.equal(sum_f32(pointer, values.length), 11)

        scale_f32(pointer, values.length, 2)
        assert.deepEqual(
            Array.from(new Float32Array(memory.buffer, pointer, values.length)),
            [3, 5, 6, 8]
        )

        dealloc(pointer, bytes)
    })

    it("cria instâncias isoladas, cada uma com a sua memória", () => {
        const first = handle.Instantiate()
        const second = handle.Instantiate()

        assert.notEqual(first.memory, second.memory)
        assert.notEqual(first.memory, handle.getMemory())

        // O módulo compilado é UM só — é o que torna a instância barata.
        assert.equal(first.exports.add(1, 1), 2)
        assert.equal(second.exports.add(1, 1), 2)
    })

    it("recusa Run() em módulo que não é um command WASI", () => {
        assert.throws(() => handle.Run(), /não é um `command` WASI/)
    })
})

describe("wasm-module task loader — ABI wasi", () => {

    it("instancia um reactor e devolve exports vivos", async () => {
        const { getServiceObject, statuses } = await StartLoader(WASI_FIXTURE)

        assert.equal(statuses.at(-1).status, TaskStatusTypes.ACTIVE)

        const handle = getServiceObject()
        assert.equal(handle.getManifest().abi, "wasi")
        assert.equal(handle.getManifest().wasi.mode, "reactor")
        assert.equal(handle.getExports().triple(7), 21)
    })
})

describe("wasm-module task loader — falhas", () => {

    it("falha com motivo quando não há manifesto", async () => {
        const { statuses } = await StartLoader(join(BROKEN_FIXTURES, "sem-manifesto"))
        assert.equal(statuses.at(-1).status, TaskStatusTypes.FAILURE)
        assert.match(statuses.at(-1).reason, /sem metadata\/wasmlib\.json/)
    })

    it("falha com motivo quando a abi é desconhecida", async () => {
        const { statuses } = await StartLoader(join(BROKEN_FIXTURES, "abi-invalida"))
        assert.equal(statuses.at(-1).status, TaskStatusTypes.FAILURE)
        assert.match(statuses.at(-1).reason, /`abi` deve ser um de core, wasi/)
    })

    it("falha com motivo quando o binário declarado não existe", async () => {
        const { statuses } = await StartLoader(join(BROKEN_FIXTURES, "binario-ausente"))
        assert.equal(statuses.at(-1).status, TaskStatusTypes.FAILURE)
        assert.match(statuses.at(-1).reason, /binário não encontrado/)
    })

    it("recusa binário declarado por caminho absoluto", async () => {
        const { statuses } = await StartLoader(join(BROKEN_FIXTURES, "binario-absoluto"))
        assert.equal(statuses.at(-1).status, TaskStatusTypes.FAILURE)
        assert.match(statuses.at(-1).reason, /`binary` deve ser relativo/)
    })
})

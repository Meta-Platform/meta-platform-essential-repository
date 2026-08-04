const { describe, it } = require('node:test')
const assert = require('node:assert').strict
const EventEmitter = require('node:events')

const TaskStatusTypes      = require("../src/TaskStatusTypes")
const CreateTaskStateManager = require("../src/CreateTaskStateManager")
const CreateTaskTombstone  = require("../src/TaskHandlers/CreateTaskTombstone")
const FindTaskByQuery      = require("../src/TaskHandlers/FindTaskByQuery")

// Monta uma task com a mesma forma que AssembleNewBodyForTask produz, mais os
// campos que só existem depois da ativação (`params`, `getServiceObject`).
const _MakeTask = (taskStateManager, { tag, status, objectLoaderType = "fake-loader" }) => {
    const taskId = taskStateManager.CreateEmptyTask()
    const task = taskStateManager.GetTask(taskId)

    task.taskId           = taskId
    task.objectLoaderType = objectLoaderType
    task.status           = status
    task.staticParameters = { tag }
    task.params           = { tag, heavyHandle: { payload: "x".repeat(1024) } }
    task.executorChannel  = new EventEmitter()
    task.getServiceObject = () => ({ alive: true })

    task.executorChannel.on("START_TASK", () => {})

    return taskId
}

describe("PurgeTask", () => {

    it("preserva a identidade das outras tasks (taskId é o índice do array)", () => {
        const taskStateManager = CreateTaskStateManager()

        const first  = _MakeTask(taskStateManager, { tag: "primeira", status: TaskStatusTypes.ACTIVE })
        const middle = _MakeTask(taskStateManager, { tag: "meio",     status: TaskStatusTypes.TERMINATED })
        const last   = _MakeTask(taskStateManager, { tag: "ultima",   status: TaskStatusTypes.ACTIVE })

        assert.equal(taskStateManager.PurgeTask(middle), true)

        // Remover do array (splice/filter) renumeraria tudo daqui para a frente.
        // A lápide ocupa o mesmo índice, então os vizinhos não se movem.
        assert.equal(taskStateManager.ListTasks().length, 3)
        assert.equal(taskStateManager.GetTask(first).staticParameters.tag,  "primeira")
        assert.equal(taskStateManager.GetTask(middle).taskId, middle)
        assert.equal(taskStateManager.GetTask(last).staticParameters.tag,   "ultima")
    })

    it("libera params, o canal e o serviceObject da task encerrada", () => {
        const taskStateManager = CreateTaskStateManager()
        const taskId = _MakeTask(taskStateManager, { tag: "encerrada", status: TaskStatusTypes.TERMINATED })

        const channel = taskStateManager.GetTask(taskId).executorChannel

        taskStateManager.PurgeTask(taskId)
        const tombstone = taskStateManager.GetTask(taskId)

        assert.equal(tombstone.params, undefined)
        assert.equal(tombstone.executorChannel, undefined)
        assert.equal(channel.listenerCount("START_TASK"), 0)
        assert.ok(tombstone.purgedAt)

        // O serviceObject não some: vira um substituto que explica o que houve.
        assert.throws(() => tombstone.getServiceObject(), /já foi encerrada/)
    })

    it("mantém o que a interface de monitoramento exibe", () => {
        const taskStateManager = CreateTaskStateManager()
        const taskId = _MakeTask(taskStateManager, { tag: "visivel", status: TaskStatusTypes.FAILURE })
        taskStateManager.GetTask(taskId).statusReason = "porque sim"

        taskStateManager.PurgeTask(taskId)
        const tombstone = taskStateManager.GetTask(taskId)

        // Os mesmos campos que FormatTaskForOutput/GetTaskInformation leem.
        assert.equal(tombstone.taskId, taskId)
        assert.equal(tombstone.status, TaskStatusTypes.FAILURE)
        assert.equal(tombstone.statusReason, "porque sim")
        assert.equal(tombstone.objectLoaderType, "fake-loader")
        assert.deepEqual(tombstone.staticParameters, { tag: "visivel" })
    })

    it("continua encontrável por FindTaskByQuery, e não atrapalha a busca das vivas", () => {
        const taskStateManager = CreateTaskStateManager()

        _MakeTask(taskStateManager, { tag: "morta", status: TaskStatusTypes.TERMINATED })
        const aliveId = _MakeTask(taskStateManager, { tag: "viva", status: TaskStatusTypes.ACTIVE })

        taskStateManager.PurgeTask(0)

        const alive = FindTaskByQuery(taskStateManager, { "staticParameters.tag": { type: "=", value: "viva" } })
        assert.equal(alive.taskId, aliveId)

        const dead = FindTaskByQuery(taskStateManager, { "staticParameters.tag": { type: "=", value: "morta" } })
        assert.equal(dead.status, TaskStatusTypes.TERMINATED)
    })

    it("não purga task viva nem task que ainda serve as outras", () => {
        const taskStateManager = CreateTaskStateManager()

        const active = _MakeTask(taskStateManager, { tag: "ativa",    status: TaskStatusTypes.ACTIVE })
        // FINISHED é o estado de uma task `nodejs-package`: ela terminou, mas o
        // handler dela segue sendo resolvido pelas tasks de endpoint.
        const finished = _MakeTask(taskStateManager, { tag: "concluida", status: TaskStatusTypes.FINISHED })
        const starting = _MakeTask(taskStateManager, { tag: "subindo",  status: TaskStatusTypes.STARTING })

        assert.equal(taskStateManager.PurgeTask(active), false)
        assert.equal(taskStateManager.PurgeTask(finished), false)
        assert.equal(taskStateManager.PurgeTask(starting), false)

        assert.deepEqual(taskStateManager.GetTask(finished).getServiceObject(), { alive: true })
    })

    it("é idempotente", () => {
        const taskStateManager = CreateTaskStateManager()
        const taskId = _MakeTask(taskStateManager, { tag: "duas-vezes", status: TaskStatusTypes.TERMINATED })

        assert.equal(taskStateManager.PurgeTask(taskId), true)
        const firstPurgedAt = taskStateManager.GetTask(taskId).purgedAt

        assert.equal(taskStateManager.PurgeTask(taskId), false)
        assert.equal(taskStateManager.GetTask(taskId).purgedAt, firstPurgedAt)
    })

    it("IsPurgeable cobre exatamente TERMINATED e FAILURE", () => {
        assert.deepEqual(CreateTaskTombstone.PURGEABLE_STATUS, [
            TaskStatusTypes.TERMINATED,
            TaskStatusTypes.FAILURE
        ])
        assert.equal(CreateTaskTombstone.IsPurgeable(undefined), false)
        assert.equal(CreateTaskTombstone.IsPurgeable({ status: TaskStatusTypes.FINISHED }), false)
        assert.equal(CreateTaskTombstone.IsPurgeable({ status: TaskStatusTypes.TERMINATED }), true)
    })
})

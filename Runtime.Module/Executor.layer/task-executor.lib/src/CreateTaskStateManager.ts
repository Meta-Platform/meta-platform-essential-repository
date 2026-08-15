import type { RuntimeTask, TaskStatus } from "../types/Task"

const EventEmitter = require('node:events')

const CreateTaskTombstone = require("./TaskHandlers/CreateTaskTombstone")

const CreateTaskStateManager = () => {

    const eventEmitter = new EventEmitter()
    const TASK_STATUS_CHANGE = Symbol()
    const taskList: RuntimeTask[] = []

    // A task nasce vazia e é preenchida em seguida; o índice em que ela caiu no
    // array É o seu taskId, e é por isso que nada nunca sai da lista.
    const CreateEmptyTask = () => taskList.push({} as RuntimeTask) - 1

    const GetTask = (taskId: number) => taskList[taskId] || {}

    // Libera os recursos de uma task encerrada SEM tirá-la da lista: `taskId` é o
    // índice do array, então remover renumeraria todas as outras. A task é
    // substituída no mesmo lugar por uma lápide — mesma identidade, mesmo status,
    // sem os handles e closures que impediam a coleta (ver CreateTaskTombstone).
    const PurgeTask = (taskId: number) => {
        const task = taskList[taskId]
        if(!CreateTaskTombstone.IsPurgeable(task)) return false

        taskList[taskId] = CreateTaskTombstone(task)
        return true
    }

    const AddTaskStatusListener = (f: any) =>
        eventEmitter.on(TASK_STATUS_CHANGE, ({
            taskId,
            status,
            statusReason,
            objectLoaderType
        }: {
            taskId: number
            status: TaskStatus
            statusReason?: string
            objectLoaderType: string
        }) => f({
            taskId,
            status,
            statusReason,
            objectLoaderType
        }))

    const UpdateTaskProperty = (taskId: number, property: string, value: any) => {
        const task = GetTask(taskId) as Record<string, any>
        task[property] = value
    }

    const ChangeTaskStatus = (taskId: number, status: TaskStatus, statusReason: string) => {
        UpdateTaskProperty(taskId, "status", status)
        // statusReason: motivo textual do término (só relevante em FAILURE); quando
        // ausente, limpamos o valor anterior para não carregar motivo de um status antigo.
        UpdateTaskProperty(taskId, "statusReason", statusReason)
        eventEmitter.emit(TASK_STATUS_CHANGE, { taskId, status, statusReason, objectLoaderType: GetTask(taskId).objectLoaderType} )
    }

    return {
        ChangeTaskStatus,
        AddTaskStatusListener,
        CreateEmptyTask,
        ListTasks: () => taskList,
        GetTask,
        UpdateTaskProperty,
        PurgeTask
    }
}

module.exports = CreateTaskStateManager
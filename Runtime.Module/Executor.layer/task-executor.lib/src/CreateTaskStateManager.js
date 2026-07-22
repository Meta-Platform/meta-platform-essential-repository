const EventEmitter = require('node:events')

const CreateTaskStateManager = () => {
    
    const eventEmitter = new EventEmitter()
    const TASK_STATUS_CHANGE = Symbol()
    const taskList = []

    const CreateEmptyTask = () => taskList.push({}) - 1

    const GetTask = (taskId) => taskList[taskId] || {}

    const AddTaskStatusListener = (f) =>
        eventEmitter.on(TASK_STATUS_CHANGE, ({
            taskId,
            status,
            statusReason,
            objectLoaderType
        }) => f({
            taskId,
            status,
            statusReason,
            objectLoaderType
        }))

    const UpdateTaskProperty = (taskId, property, value) => {
        const task = GetTask(taskId)
        task[property] = value
    }

    const ChangeTaskStatus = (taskId, status, statusReason) => {
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
        UpdateTaskProperty
    }
}

module.exports = CreateTaskStateManager
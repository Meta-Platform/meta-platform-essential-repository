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
            objectLoaderType
        }) => f({
            taskId,
            status,
            objectLoaderType
        }))

    const UpdateTaskProperty = (taskId, property, value) => {
        const task = GetTask(taskId)
        task[property] = value
    }

    const ChangeTaskStatus = (taskId, status) => {
        UpdateTaskProperty(taskId, "status", status)
        eventEmitter.emit(TASK_STATUS_CHANGE, { taskId, status, objectLoaderType: GetTask(taskId).objectLoaderType} )
    }

    const EnableTaskEventListening = (taskId) => 
        GetTask(taskId)
            .executorCommandChannel
            .on("status", (status) => ChangeTaskStatus(taskId, status))

    return {
        ChangeTaskStatus,
        AddTaskStatusListener,
        CreateEmptyTask,
        ListTasks: () => taskList,
        GetTask,
        EnableTaskEventListening,
        UpdateTaskProperty
    }
}

module.exports = CreateTaskStateManager
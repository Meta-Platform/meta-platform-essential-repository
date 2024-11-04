const TaskStatusTypes = require("./TaskStatusTypes")

const IsTaskActivatable = require("./TaskHandlers/IsTaskActivatable")

const AssembleTaskParameters = require("./TaskHandlers/AssembleTaskParameters")

const ProcessChangeTaskEvents = ({
    StopAllTasks,
    taskStateManager, 
    taskLoaders, 
    taskId, 
    status
}) => {

    const {
        GetTask,
        ListTasks,
        ChangeTaskStatus,
        UpdateTaskProperty,
    } = taskStateManager

    const GetCommandChannel = (taskId) =>
        GetTask(taskId).executorCommandChannel

    const EnableStatusChangeListening = (taskId) => 
        GetCommandChannel(taskId)
            .on("status", (status) => ChangeTaskStatus(taskId, status))

    const EnableExitEventListening = (taskId) => {
        GetCommandChannel(taskId)
        .on("exit", () => StopAllTasks())
    }

    const MountServiceObject = (task) => {
        const ObjectLoader = taskLoaders[task.objectLoaderType]
        return ObjectLoader(task.params, task.executorCommandChannel)
    }

    const CheckActivationConditions = (taskId) => {
        if(IsTaskActivatable(taskStateManager, taskId))
            ChangeTaskStatus(taskId, TaskStatusTypes.PRECONDITIONS_COMPLETED)
    }

    const PrepareTaskForActivation = (taskId) => {

        const task = GetTask(taskId)

        UpdateTaskProperty(taskId, "params", AssembleTaskParameters(taskStateManager, task))
        UpdateTaskProperty(taskId, "getServiceObject", MountServiceObject(task))

        EnableExitEventListening(taskId)
        EnableStatusChangeListening(taskId)

        ChangeTaskStatus(taskId, TaskStatusTypes.PREPPED_TO_START)
        
    }

    const StartTask = (taskId) => {
        const { executorCommandChannel } = GetTask(taskId)
        executorCommandChannel.emit("start")
    }

    const GetTasksAwaitingConditions = () => 
        ListTasks()
            .filter(({status}) => status === TaskStatusTypes.AWAITING_PRECONDITIONS)

    const CheckAllTasksActivationConditions = () => {
        setTimeout(() => GetTasksAwaitingConditions()
        .forEach(({ taskId }) => CheckActivationConditions(taskId)))
    }

    switch(status){
        case TaskStatusTypes.AWAITING_PRECONDITIONS:
            CheckActivationConditions(taskId)
        break
        case TaskStatusTypes.PRECONDITIONS_COMPLETED:
            PrepareTaskForActivation(taskId)
        break
        case TaskStatusTypes.PREPPED_TO_START:
            StartTask(taskId)
        break
        case TaskStatusTypes.ACTIVE:
        case TaskStatusTypes.FINISHED:
            CheckAllTasksActivationConditions()
        break
    }
}

module.exports = ProcessChangeTaskEvents
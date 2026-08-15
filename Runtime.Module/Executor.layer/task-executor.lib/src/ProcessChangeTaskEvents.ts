import type { RuntimeTask as Task, TaskStatus } from "../types/Task"

const TaskStatusTypes = require("./TaskStatusTypes")
const CommandChannelEventTypes = require("./CommandChannelEventTypes")

const IsTaskActivatable = require("./TaskHandlers/IsTaskActivatable")

const AssembleTaskParameters = require("./TaskHandlers/AssembleTaskParameters")

// Janela entre o encerramento da task e a liberação dos seus recursos. Existe
// porque o encerramento é assíncrono: quando o status muda, ainda pode haver
// callback de loader em voo lendo `params` ou emitindo no `executorChannel`.
// Trinta segundos é folga larga para isso e curta o bastante para que subir e
// descer instâncias não acumule nada.
const PURGE_DELAY_MS = 30000

const ProcessChangeTaskEvents = ({
    StopAllTasks,
    taskStateManager,
    taskLoaders,
    taskId,
    status
}: {
    StopAllTasks: any
    taskStateManager: any
    taskLoaders: any
    taskId: number
    status: TaskStatus
}) => {

    const {
        GetTask,
        ListTasks,
        ChangeTaskStatus,
        UpdateTaskProperty,
        PurgeTask
    } = taskStateManager

    const GetCommandChannel = (taskId: number) =>
        GetTask(taskId).executorChannel

    const EnableStatusChangeListening = (taskId: number) =>
        GetCommandChannel(taskId)
            .on(CommandChannelEventTypes.CHANGE_TASK_STATUS, (status: TaskStatus, statusReason: string) => ChangeTaskStatus(taskId, status, statusReason))

    const EnableExitEventListening = (taskId: number) => {
        GetCommandChannel(taskId)
        .on(CommandChannelEventTypes.STOP_ALL_TASKS, () => StopAllTasks())
    }

    const MountServiceObject = (task: Task) => {
        const ObjectLoader = taskLoaders[task.objectLoaderType]
        return ObjectLoader(task.params, task.executorChannel)
    }

    const CheckActivationConditions = (taskId: number) => {
        if(IsTaskActivatable(taskStateManager, taskId))
            ChangeTaskStatus(taskId, TaskStatusTypes.PRECONDITIONS_COMPLETED)
    }

    const PrepareTaskForActivation = (taskId: number) => {

        const task = GetTask(taskId)

        UpdateTaskProperty(taskId, "params", AssembleTaskParameters(taskStateManager, task))
        UpdateTaskProperty(taskId, "getServiceObject", MountServiceObject(task))

        EnableExitEventListening(taskId)
        EnableStatusChangeListening(taskId)

        ChangeTaskStatus(taskId, TaskStatusTypes.PREPPED_TO_START)
        
    }

    const StartTask = (taskId: number) => {
        const { executorChannel } = GetTask(taskId)
        executorChannel.emit(CommandChannelEventTypes.START_TASK)
    }

    const GetTasksAwaitingConditions = () => 
        ListTasks()
            .filter(({status}: { status: TaskStatus }) => status === TaskStatusTypes.AWAITING_PRECONDITIONS)

    const CheckAllTasksActivationConditions = () => {
        setTimeout(() => GetTasksAwaitingConditions()
        .forEach(({ taskId }: { taskId: number }) => CheckActivationConditions(taskId)))
    }

    // O timer não segura o processo: uma instância que termina logo depois de a
    // task encerrar não deve ficar viva só esperando a faxina.
    const ScheduleTaskPurge = (taskId: number) => {
        if(!PurgeTask) return
        const timer = setTimeout(() => PurgeTask(taskId), PURGE_DELAY_MS)
        if(typeof timer.unref === "function") timer.unref()
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
        case TaskStatusTypes.TERMINATED:
        case TaskStatusTypes.FAILURE:
            ScheduleTaskPurge(taskId)
        break
    }
}

module.exports = ProcessChangeTaskEvents
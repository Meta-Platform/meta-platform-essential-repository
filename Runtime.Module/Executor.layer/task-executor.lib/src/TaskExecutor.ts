import type { Task, TaskStatus } from "../types/Task"



const TaskStatusTypes          = require("./TaskStatusTypes")
const CommandChannelEventTypes = require("./CommandChannelEventTypes")

const CreateTaskStateManager = require("./CreateTaskStateManager")
const ProcessChangeTaskEvents = require("./ProcessChangeTaskEvents")
const AssembleNewBodyForTask = require("./TaskHandlers/AssembleNewBodyForTask")

const TaskExecutor = (params: any) => {  

    const taskLoaders  = params?.taskLoaders || []

    const taskStateManager = CreateTaskStateManager()

    const {
        GetTask,
        ListTasks,
        AddTaskStatusListener,
        ChangeTaskStatus,
        CreateEmptyTask
    } = taskStateManager

    const SetupTask = ({ taskId, pTaskId, executionParams }: { taskId: number, pTaskId: number, executionParams: any }) => {
        const taskList = ListTasks()
        taskList[taskId] = AssembleNewBodyForTask({ taskId, pTaskId, executionParams })
        ChangeTaskStatus(taskId, TaskStatusTypes.AWAITING_PRECONDITIONS)
    }

    const StopTask = (taskId: number) => {
        const task = GetTask(taskId)
        if (task.status === TaskStatusTypes.AWAITING_PRECONDITIONS)
            ChangeTaskStatus(taskId, TaskStatusTypes.TERMINATED)
        else task.executorChannel.emit(CommandChannelEventTypes.STOP_TASK)
    }

    const StopTasks = (taskIdList: any) => 
        taskIdList.forEach((taskId: number) => StopTask(taskId))

    const StopAllTasks = () => {
        const taskIdList = ListTasks().map(({taskId}: { taskId: number }) => taskId)
        StopTasks(taskIdList)
    }

    const CreateTasks = (executionParamsList: any, pTaskId: number) => 
        executionParamsList.flatMap((executionParams: any) => CreateTask(executionParams, pTaskId))

    const CreateTask = (executionParams: any, pTaskId: number) => {

        if(Object.values(executionParams).length < 1)
            throw new Error("The Execution Params cannot be empty")

        const objectLoaderType = executionParams.objectLoaderType
        
        const isLoaderAbsent = objectLoaderType === undefined ||
            taskLoaders[objectLoaderType] === undefined

        if(isLoaderAbsent) throw new Error("Task Loader was not found")

        const taskId = CreateEmptyTask()
        
        setImmediate(() => SetupTask({ taskId, pTaskId, executionParams }))

        return executionParams.children && executionParams.children.length > 0
            ? [taskId, ...CreateTasks(executionParams.children, taskId)]
            : [ taskId ]

    }

     //TODO talvez carregar loader na hora do setup
     AddTaskStatusListener(({ taskId, status }: { taskId: number, status: TaskStatus }) => 
        setImmediate(() => ProcessChangeTaskEvents({
            StopAllTasks,
            taskStateManager, 
            taskLoaders, 
            taskId, 
            status
        })))

    return {
        CreateTask,
        CreateTasks,
        StopTask,
        StopTasks,
        GetTask,
        ListTasks,
        AddTaskStatusListener
    }
}

module.exports = TaskExecutor
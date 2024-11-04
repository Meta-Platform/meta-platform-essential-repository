

const TaskStatusTypes          = require("./TaskStatusTypes")
const CommandChannelEventTypes = require("./CommandChannelEventTypes")

const CreateTaskStateManager = require("./CreateTaskStateManager")
const ProcessChangeTaskEvents = require("./ProcessChangeTaskEvents")
const AssembleNewBodyForTask = require("./TaskHandlers/AssembleNewBodyForTask")

const TaskExecutor = (params) => {  

    const taskLoaders  = params?.taskLoaders || []

    const taskStateManager = CreateTaskStateManager()

    const {
        GetTask,
        ListTasks,
        AddTaskStatusListener,
        ChangeTaskStatus,
        CreateEmptyTask
    } = taskStateManager

    const SetupTask = ({ taskId, pTaskId, executionParams }) => {
        const taskList = ListTasks()
        taskList[taskId] = AssembleNewBodyForTask({ taskId, pTaskId, executionParams })
        ChangeTaskStatus(taskId, TaskStatusTypes.AWAITING_PRECONDITIONS)
    }

    const StopTask = (taskId) => {
        const task = GetTask(taskId)
        if (task.status === TaskStatusTypes.AWAITING_PRECONDITIONS)
            ChangeTaskStatus(taskId, TaskStatusTypes.TERMINATED)
        else task.executorCommandChannel.emit(CommandChannelEventTypes.STOP_TASK)
    }

    const StopTasks = (taskIdList) => 
        taskIdList.forEach((taskId) => StopTask(taskId))

    const StopAllTasks = () => {
        const taskIdList = ListTasks().map(({taskId}) => taskId)
        StopTasks(taskIdList)
    }

    const CreateTasks = (executionParamsList, pTaskId) => 
        executionParamsList.flatMap((executionParams) => CreateTask(executionParams, pTaskId))

    const CreateTask = (executionParams, pTaskId) => {

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
     AddTaskStatusListener(({ taskId, status }) => 
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


const TaskStatusTypes = require("./TaskStatusTypes")
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

    //TODO talvez carregar loader na hora do setup
    AddTaskStatusListener(({ taskId, status }) => 
        setImmediate(() => ProcessChangeTaskEvents({taskStateManager, taskLoaders, taskId, status})))

    const SetupTask = ({ taskId, pTaskId, executionParams }) => {
        const taskList = ListTasks()
        taskList[taskId] = AssembleNewBodyForTask({ taskId, pTaskId, executionParams })
        ChangeTaskStatus(taskId, TaskStatusTypes.AWAITING_PRECONDITIONS)
    }

    const StopTasks = (taskIdList) => 
        taskIdList.forEach((taskId) => StopTask(taskId))

    const StopTask = (taskId) => {
        const task = GetTask(taskId)
        if (task.status === TaskStatusTypes.AWAITING_PRECONDITIONS)
            ChangeTaskStatus(taskId, TaskStatusTypes.TERMINATED)
        else task.executorCommandChannel.emit("stop")
    }

    const CreateTasks = (executionParamsList, pTaskId) => 
        executionParamsList.flatMap((executionParams) => CreateTask(executionParams, pTaskId))

    const CreateTask = (executionParams, pTaskId) => {

        if(Object.values(executionParams).length < 1){
            throw new Error("The Execution Params cannot be empty")
        }

        if(
            executionParams.objectLoaderType === undefined 
            || taskLoaders[executionParams.objectLoaderType] === undefined){
            throw new Error("Task Loader was not found")
        }

        const taskId = CreateEmptyTask()
        
        setImmediate(() => SetupTask({ taskId, pTaskId, executionParams }))

        if(executionParams.children && executionParams.children.length > 0){
            return [taskId, ...CreateTasks(executionParams.children, taskId)]
        } else {
            return [ taskId ]
        }
    }

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
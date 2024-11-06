const TaskStatusTypes          = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const ApplicationInstanceTaskLoader  = (loaderParams, executorChannel) => {

    const Start = () => 
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)

    const Stop = () =>
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    
    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => {}
}

module.exports = ApplicationInstanceTaskLoader 
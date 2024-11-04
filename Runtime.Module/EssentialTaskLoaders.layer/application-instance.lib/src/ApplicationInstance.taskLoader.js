const TaskStatusTypes          = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const ApplicationInstanceTaskLoader  = (loaderParams, executorCommandChannel) => {

    const Start = () => 
        executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)

    const Stop = () =>
        executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    
    executorCommandChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorCommandChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => {}
}

module.exports = ApplicationInstanceTaskLoader 
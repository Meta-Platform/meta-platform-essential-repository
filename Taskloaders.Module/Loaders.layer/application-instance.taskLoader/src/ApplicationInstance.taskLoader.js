const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const ApplicationInstanceTaskLoader  = (loaderParams, executorChannel) => {
    // Carimba a execução: tudo que este loader registrar sai identificado pela
    // instância e pelo ambiente. Ver logging-standard.md.
    const log = Log
        .child({
            instanceId     : process.env.META_LAUNCH_ID || null,
            environmentPath: loaderParams.environmentPath || null
        })
        .source("ApplicationInstance")


    const Start = () => 
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)

    const Stop = () =>
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    
    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => {}
}

module.exports = ApplicationInstanceTaskLoader 
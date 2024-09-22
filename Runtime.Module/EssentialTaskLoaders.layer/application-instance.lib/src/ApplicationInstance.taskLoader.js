const TaskStatusTypes = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")

const ApplicationInstanceTaskLoader  = (loaderParams, executorCommandChannel) => {

    const Start = () => 
        executorCommandChannel.emit("status", TaskStatusTypes.ACTIVE)

    const Stop = () =>
        executorCommandChannel.emit("status", TaskStatusTypes.TERMINATED)
    
    executorCommandChannel.on("start", Start)
    executorCommandChannel.on("stop", Stop)

    return () => {}
}

module.exports = ApplicationInstanceTaskLoader 
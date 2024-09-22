
const FormatTaskForOutput = (task) => {       
    return {
        taskId: task.taskId,
        pTaskId: task.pTaskId,
        objectLoaderType: task.objectLoaderType,
        status: task.status,
        staticParameters: task.staticParameters
    }
}

module.exports = FormatTaskForOutput
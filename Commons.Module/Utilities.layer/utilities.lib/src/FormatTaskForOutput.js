
const FormatTaskForOutput = (task) => {
    return {
        taskId: task.taskId,
        pTaskId: task.pTaskId,
        objectLoaderType: task.objectLoaderType,
        status: task.status,
        ...task.statusReason ? { statusReason: task.statusReason } : {},
        staticParameters: task.staticParameters
    }
}

module.exports = FormatTaskForOutput
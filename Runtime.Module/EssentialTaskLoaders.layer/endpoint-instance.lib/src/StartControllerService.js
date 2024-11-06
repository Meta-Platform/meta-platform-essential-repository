const TaskStatusTypes          = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const StartControllerService = (loaderParams, executorChannel) => {
    const {
        serverService,
        url,
        nodejsPackageHandler,
        apiTemplate,
        controller,
        controllerParams,
        executionData
    } = loaderParams

    const apiTemplateData = nodejsPackageHandler.require(apiTemplate)
    const ControllerService = nodejsPackageHandler.require(controller)
    
    serverService.AddServiceEndpoint({
        path: url,
        apiTemplate: apiTemplateData,
        service: ControllerService(controllerParams, executionData)
    })
    executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)
}

module.exports = StartControllerService
const TaskStatusTypes = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")

const StartControllerService = (loaderParams, executorCommandChannel) => {
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
    executorCommandChannel.emit("status", TaskStatusTypes.ACTIVE)
}

module.exports = StartControllerService
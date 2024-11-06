const TaskStatusTypes          = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const ServiceInstanceObjectLoader = (loaderParams, executorChannel) => {

    let serviceObject = {}

    const _GetServiceParams = () => {
        const { serviceParameterNames } = loaderParams
        const serviceParams = serviceParameterNames
        .reduce((serviceParamsAcc, parameterName) => ({ 
            ...serviceParamsAcc, 
            [parameterName]: loaderParams[parameterName] 
        }), {})
        return serviceParams
    }
    
    const _GetService = () => {
        const { 
            nodejsPackageHandler, 
            path,
            localPath
        } = loaderParams

        if(path){
            return nodejsPackageHandler.require(path)
        } else if(localPath){
            return require(localPath)
        }
    }

    const _CreateServiceObject = () => {

        const Service = _GetService()
        
        try {
            serviceObject = Service({ 
                ..._GetServiceParams(), 
                onReady: () => {
                    executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)
                },
                onClose: () => {
                    serviceObject=undefined
                    executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
                }
            }, loaderParams.executionData)
        }catch(e){
            throw e
        }
    }

    const Start = async () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        try{
            _CreateServiceObject()
        }catch(e){
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE)
            console.error(e)
        }
    }

    const Stop = () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STOPPING)
        if(serviceObject.Close) {
            serviceObject.Close()
        } else {
            serviceObject=undefined
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
        }
    }

    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => serviceObject
}

module.exports = ServiceInstanceObjectLoader
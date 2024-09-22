const TaskStatusTypes = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")

const ServiceInstanceObjectLoader = (loaderParams, executorCommandChannel) => {

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
                    executorCommandChannel.emit("status", TaskStatusTypes.ACTIVE)
                },
                onClose: () => {
                    serviceObject=undefined
                    executorCommandChannel.emit("status", TaskStatusTypes.TERMINATED)
                }
            }, loaderParams.executionData)
        }catch(e){
            throw e
        }
    }

    const Start = async () => {
        executorCommandChannel.emit("status", TaskStatusTypes.STARTING)
        try{
            _CreateServiceObject()
        }catch(e){
            executorCommandChannel.emit("status", TaskStatusTypes.FAILURE)
            console.error(e)
        }
    }

    const Stop = () => {
        executorCommandChannel.emit("status", TaskStatusTypes.STOPPING)
        if(serviceObject.Close) {
            serviceObject.Close()
        } else {
            serviceObject=undefined
            executorCommandChannel.emit("status", TaskStatusTypes.TERMINATED)
        }
    }

    executorCommandChannel.on("start", Start)
    executorCommandChannel.on("stop", Stop)

    return () => serviceObject
}

module.exports = ServiceInstanceObjectLoader
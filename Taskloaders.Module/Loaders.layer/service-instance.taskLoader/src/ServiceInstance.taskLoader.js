const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

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

    // Normaliza um erro para uma linha de motivo (statusReason) exibível no painel.
    // O erro completo (com stack) continua indo para o console, capturado no log da instância.
    const _ReasonOf = (e) => (e && (e.message || e.toString())) || String(e)

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
                },
                // onError: falha ASSÍNCRONA do serviço (ex.: EADDRINUSE no listen), que
                // escapa do try/catch síncrono abaixo. Sem isso, o erro crashava o processo
                // sem virar FAILURE nem passar pelo onClose.
                onError: (e) => {
                    serviceObject=undefined
                    executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE, _ReasonOf(e))
                    console.error(e)
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
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE, _ReasonOf(e))
            console.error(e)
        }
    }

    const Stop = () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STOPPING)
        // Guard `serviceObject &&`: após uma FALHA (onError zera serviceObject) ou se
        // o serviço nunca subiu, serviceObject é undefined — sem a guarda, o acesso a
        // .Close lançava TypeError e a task ficava presa em STOPPING, travando a
        // execução (o ambiente não voltava a "TERMINATED" e não podia ser relançado).
        if(serviceObject && serviceObject.Close) {
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
const EventEmitter = require('node:events')

const LEVEL_BY_TYPE = { info : "info", success : "message", warning : "warn", error : "error" }

const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const InstallNpmPackage = require("./InstallNpmPackage")
const ReadPackageJsonFile = require("./ReadPackageJsonFile")
const PreparePackageDependenciesDir = require("./PreparePackageDependenciesDir")

const ResolvePackageName = require("../../../../Runtime.Module/MetadataHelpers.layer/resolve-package-name.lib/src/ResolvePackageName")

const GetDependenciesFromPackageJsonFile = async (packagePath) => {
    const { dependencies } = await ReadPackageJsonFile(packagePath)
    return dependencies
}

const CheckIfDependencyIsValid = (dependencies) =>
    dependencies && Object.keys(dependencies).length > 0

const InstallNodejsPackageDependenciesTaskLoader  = (params, executorChannel) => {

    // Carimba a execução: tudo que este loader registrar sai identificado pela
    // instância e pelo ambiente. Ver logging-standard.md.
    const instanceLog = Log.child({
        instanceId     : process.env.META_LAUNCH_ID || null,
        environmentPath: params.environmentPath || null
    })

    const log = instanceLog.source("InstallNodejsPackageDependencies")

    let wasStopped=false
    let hasBeenActivated=false
    let hasBeenFinished=false

    const {
        namespace,
        path,
        environmentPath,
        EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
    } = params

    const Start = async () => {
        hasBeenActivated=true
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        try{
            const dependencies = await GetDependenciesFromPackageJsonFile(path)
            const packageName = ResolvePackageName(namespace)

            if(CheckIfDependencyIsValid(dependencies)){

                const loggerEmitter = new EventEmitter()

                // Era aqui a SEXTA cópia do formatador de log, montada à mão. O
                // emissor agora delega ao logger global, que formata e grava.
                loggerEmitter.on("log", (dataLog) =>
                    instanceLog[LEVEL_BY_TYPE[dataLog.type] || "info"](dataLog.sourceName, dataLog.message))

                await PreparePackageDependenciesDir({
                    environmentPath, 
                    packageName,
                    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES,
                    loggerEmitter
                })
                await InstallNpmPackage({
                    environmentPath, 
                    packageName, 
                    dependencies, 
                    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
                })
            }

            if(wasStopped) executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
            else executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FINISHED)

        }catch(e){
            if(wasStopped)
                executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
            else {
                log.error("falha ao instalar as dependências do pacote", e)
                executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE)
            }
        }
    }

    const Stop = () => {
        if(!hasBeenActivated || hasBeenFinished)
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
        else
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STOPPING)
        
    }

    const handleChangeStatus = (status) => {
        if(status === TaskStatusTypes.STOPPING) wasStopped=true
        if(status === TaskStatusTypes.STARTING) hasBeenActivated=true
        if(status === TaskStatusTypes.FINISHED) hasBeenFinished=true
    }

    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)
    executorChannel.on(CommandChannelEventTypes.CHANGE_TASK_STATUS, handleChangeStatus)

    return () => {}

}

module.exports = InstallNodejsPackageDependenciesTaskLoader 
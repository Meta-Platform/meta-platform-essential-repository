const EventEmitter = require('node:events')

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const TaskStatusTypes          = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const InstallNpmPackage = require("./InstallNpmPackage")
const ReadPackageJsonFile = require("./ReadPackageJsonFile")
const PreparePackageDependenciesDir = require("./PreparePackageDependenciesDir")

const ResolvePackageName = require("../../../MetadataHelpers.layer/resolve-package-name.lib/src/ResolvePackageName")

const GetDependenciesFromPackageJsonFile = async (packagePath) => {
    const { dependencies } = await ReadPackageJsonFile(packagePath)
    return dependencies
}

const GetColorLogByType = (type) => {
    switch(type){
        case "info":
            return "bgBlue"
        case "warning":
            return "bgYellow"
        case "error":
            return "bgRed"
        default:
            return undefined
    }
  }

const CheckIfDependencyIsValid = (dependencies) => 
    dependencies && Object.keys(dependencies).length > 0

const InstallNodejsPackageDependenciesTaskLoader  = (params, executorCommandChannel) => {

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
        executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        try{
            const dependencies = await GetDependenciesFromPackageJsonFile(path)
            const packageName = ResolvePackageName(namespace)

            if(CheckIfDependencyIsValid(dependencies)){

                const loggerEmitter = new EventEmitter()

                loggerEmitter.on("log", (dataLog) => {
                    const {
                      sourceName,
                      type,
                      message
                    } = dataLog
                
                    const color = GetColorLogByType(type)
                
                    const now = new Date()
                    const offset = now.getTimezoneOffset() * 60000
                    const localISOTime = (new Date(now - offset)).toISOString()
                
                    const sourceNameFormatted = sourceName.padEnd(23)
                    const typeFormatted = type.padEnd(7)
                
                    const formattedMessage = `${colors.dim(`[${localISOTime}]`)} ${colors.bgCyan.black("[InstallNodejsPackageDependenciesObjectLoader]")} ${colors[color](`[${typeFormatted}]`)} ${colors.inverse(`[${sourceNameFormatted}]`)} ${message}`
                
                    console.log(formattedMessage)
                  })

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

            if(wasStopped) executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
            else executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FINISHED)

        }catch(e){
            if(wasStopped)
                executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
            else {
                console.log(e)
                executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE)
            }
        }
    }

    const Stop = () => {
        if(!hasBeenActivated || hasBeenFinished)
            executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
        else
            executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STOPPING)
        
    }

    const handleChangeStatus = (status) => {
        if(status === TaskStatusTypes.STOPPING) wasStopped=true
        if(status === TaskStatusTypes.STARTING) hasBeenActivated=true
        if(status === TaskStatusTypes.FINISHED) hasBeenFinished=true
    }

    executorCommandChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorCommandChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)
    executorCommandChannel.on(CommandChannelEventTypes.CHANGE_TASK_STATUS, handleChangeStatus)

    return () => {}

}

module.exports = InstallNodejsPackageDependenciesTaskLoader 
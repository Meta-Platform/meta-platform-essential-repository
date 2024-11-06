const { join } = require("path")

const ReadJsonFile = require("../../../../Commons.Module/Libraries.layer/json-file-utilities.lib/src/ReadJsonFile")
const ResolvePackageName = require("../../../MetadataHelpers.layer/resolve-package-name.lib/src/ResolvePackageName")

const TaskStatusTypes          = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const PACKAGEJSON_FILENAME = "package.json"

const GetPackageJsonContent = (path) => ReadJsonFile(join(path, PACKAGEJSON_FILENAME))

const SOURCE_DIR_NAME = "src"

const SetupServiceObject = (serviceObject, { path, environmentPath, tag, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES }) => {
    const _GetSourcePath = () => join(path, SOURCE_DIR_NAME)
    const _GetEnvironmentPath = () => environmentPath
    const _GetNodeModulesPath = () => 
        join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, ResolvePackageName(tag), "node_modules")

    serviceObject.require = (srcPath) => {
        const scriptPath = join(path, SOURCE_DIR_NAME, srcPath)
        
        const originalNodePath = process.env.NODE_PATH
        process.env.NODE_PATH = _GetNodeModulesPath()
        require('module').Module._initPaths()
        const Service = require.main.require(scriptPath)
        process.env.NODE_PATH = originalNodePath
        require('module').Module._initPaths()
        
        return Service
    }

    serviceObject.getSourcePath = _GetSourcePath
    serviceObject.getEnvironmentPath = _GetEnvironmentPath
    serviceObject.getNodeModulesPath = _GetNodeModulesPath
}

const NodeJSPackageTaskLoader  = (params, executorChannel) => {

    let serviceObject = {}

    const Start = async () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        try{
            const { path, environmentPath, tag, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES} = params
            const packageJsonFileContent = await GetPackageJsonContent(path)
            if(packageJsonFileContent){
                SetupServiceObject(serviceObject, { path, environmentPath, tag , EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
                executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)
            } else {
                executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE)
            }
        }catch(e){
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE)
            console.error(e)
        }
    }

    const Stop = () => {
        serviceObject = undefined
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    }

    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => serviceObject
    
}

module.exports = NodeJSPackageTaskLoader 
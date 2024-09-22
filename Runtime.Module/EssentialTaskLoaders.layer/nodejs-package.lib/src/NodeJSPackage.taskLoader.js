const { join } = require("path")

const ReadJsonFile = require("../../../../Commons.Module/Libraries.layer/json-file-utilities.lib/src/ReadJsonFile")
const ResolvePackageName = require("../../../MetadataHelpers.layer/resolve-package-name.lib/src/ResolvePackageName")

const TaskStatusTypes = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")

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

const NodeJSPackageTaskLoader  = (params, executorCommandChannel) => {

    let serviceObject = {}

    const Start = async () => {
        executorCommandChannel.emit("status", TaskStatusTypes.STARTING)
        try{
            const { path, environmentPath, tag, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES} = params
            const packageJsonFileContent = await GetPackageJsonContent(path)
            if(packageJsonFileContent){
                SetupServiceObject(serviceObject, { path, environmentPath, tag , EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES})
                executorCommandChannel.emit("status", TaskStatusTypes.ACTIVE)
            } else {
                executorCommandChannel.emit("status", TaskStatusTypes.FAILURE)
            }
        }catch(e){
            executorCommandChannel.emit("status", TaskStatusTypes.FAILURE)
            console.error(e)
        }
    }

    const Stop = () => {
        serviceObject = undefined
        executorCommandChannel.emit("status", TaskStatusTypes.TERMINATED)
    }

    executorCommandChannel.on("start", Start)
    executorCommandChannel.on("stop", Stop)

    return () => serviceObject
    
}

module.exports = NodeJSPackageTaskLoader 
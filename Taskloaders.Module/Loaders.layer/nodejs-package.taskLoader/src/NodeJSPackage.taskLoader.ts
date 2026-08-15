const { join } = require("path")

const ReadJsonFile = require("../../../../Commons.Module/Libraries.layer/json-file-utilities.lib/src/ReadJsonFile")
const ResolvePackageName = require("../../../../Runtime.Module/MetadataHelpers.layer/resolve-package-name.lib/src/ResolvePackageName")

const TaskStatusTypes          = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../../Runtime.Module/Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const PACKAGEJSON_FILENAME = "package.json"

const GetPackageJsonContent = (path: string) => ReadJsonFile(join(path, PACKAGEJSON_FILENAME))

const SOURCE_DIR_NAME = "src"

const SetupServiceObject = (serviceObject: any, { path, environmentPath, tag, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES }: {
    path: string
    environmentPath: string
    tag: string
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: string
}) => {
    const _GetSourcePath = () => join(path, SOURCE_DIR_NAME)
    const _GetEnvironmentPath = () => environmentPath
    const _GetNodeModulesPath = () => 
        join(environmentPath, EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES, ResolvePackageName(tag), "node_modules")

    serviceObject.require = (srcPath: string) => {
        const scriptPath = join(path, SOURCE_DIR_NAME, srcPath)
        
        const originalNodePath = process.env.NODE_PATH
        process.env.NODE_PATH = _GetNodeModulesPath()
        require('module').Module._initPaths()
        // `require.main` é o módulo de entrada do processo — sempre existe aqui,
        // porque este loader só roda dentro de uma execução do executor.
        const Service = require.main!.require(scriptPath)
        process.env.NODE_PATH = originalNodePath
        require('module').Module._initPaths()
        
        return Service
    }

    // Raiz do package. `getSourcePath` aponta para `src`, o que basta para carregar
    // módulos, mas não alcança o que vive fora dele — template HTML, assets estáticos,
    // manifesto. Sem este acessor, um loader que precise desses arquivos teria de supor
    // a estrutura interna do package.
    serviceObject.getPackagePath = () => path

    serviceObject.getSourcePath = _GetSourcePath
    serviceObject.getEnvironmentPath = _GetEnvironmentPath
    serviceObject.getNodeModulesPath = _GetNodeModulesPath
}

const NodeJSPackageTaskLoader  = (params: any, executorChannel: any) => {
    // Carimba a execução: tudo que este loader registrar sai identificado pela
    // instância e pelo ambiente. Ver logging-standard.md.
    const log = Log
        .child({
            instanceId     : process.env.META_LAUNCH_ID || null,
            environmentPath: params.environmentPath || null
        })
        .source("NodeJSPackage")


    let serviceObject: any = {}

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
            log.error("falha ao montar o pacote Node.js", e)
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
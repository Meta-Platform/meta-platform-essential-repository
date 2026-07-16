const { join } = require("path")

const ComputeObjectHash = require("../../../../Commons.Module/Utilities.layer/compute-object-hash.lib/src/ComputeObjectHash")

const WebInterfaceBuilder = require("./WebInterfaceBuilder")

const DIR_SUFFIX = "webInterfaceAssets"

const MountOutputDirPath = ({environmentPath, outputDirName, RT_ENV_GENERATED_DIR_NAME}) => 
    join(environmentPath, RT_ENV_GENERATED_DIR_NAME, `${outputDirName}.${DIR_SUFFIX}`)

    
const StartWebGraphicUserInterfaceService = async ({
    loaderParams, 
    loggerEmitter
}) => {
    const {
        nodejsPackageHandler,
        url,
        entrypoint,
        htmlTemplate,
        serverEndpointStatus,
        serverName,
        RT_ENV_GENERATED_DIR_NAME,
        isWatch
    } = loaderParams
    
    const context = nodejsPackageHandler.getSourcePath()
    const environmentPath = nodejsPackageHandler.getEnvironmentPath()
    const nodeModulesPath = nodejsPackageHandler.getNodeModulesPath()

    const outputDirName = ComputeObjectHash({ 
        url, entrypoint, htmlTemplate, serverEndpointStatus, serverName, 
        context, environmentPath, nodeModulesPath
    })

    const output = MountOutputDirPath({
        environmentPath, 
        outputDirName, 
        RT_ENV_GENERATED_DIR_NAME
    })

    const builder = await WebInterfaceBuilder({
        entrypoint,
        htmlTemplate,
        nodeModulesPath,
        context,
        output,
        url : serverEndpointStatus,
        serverAppName : serverName,
        loggerEmitter,
        onChangeProgress : (percentage) => {
            if(percentage < 100){
                loggerEmitter 
                    && loggerEmitter.emit("log", {sourceName: "WebUserInterfacePackager", type:"info", message:`BUILDING ${percentage}%`})
            }
        }
    })

    if(isWatch) await builder.Watch()
    else await builder.Run()
    
    return output
}

module.exports = StartWebGraphicUserInterfaceService
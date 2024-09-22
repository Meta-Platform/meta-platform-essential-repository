const EventEmitter = require('node:events')

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const TaskStatusTypes = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")

const StartControllerService = require("./StartControllerService")
const StartWebGraphicUserInterfaceService = require("./StartWebGraphicUserInterfaceService")

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

const EndpointInstanceTaskLoader = (loaderParams, executorCommandChannel) => {

    let wasStopped=false
    let isActive=false

    const { type } = loaderParams

    const Start = async () => {
        executorCommandChannel.emit("status", TaskStatusTypes.STARTING)

        try{
            const { url, serverService } = loaderParams

            if(type === "controller") 
                StartControllerService(loaderParams, executorCommandChannel)
            else if(type === "web-graphic-user-interface") {
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

                    const typeFormatted = type.padEnd(7)

                    const formattedMessage = `${colors.dim(`[${localISOTime}]`)} ${colors.bgCyan.black("[EndpointInstanceObjectLoader]")} ${colors[color](`[${typeFormatted}]`)} ${colors.inverse(`[${sourceName}]`)} ${message}`
                    console.log(formattedMessage)
                })
                const output = await StartWebGraphicUserInterfaceService({loaderParams, loggerEmitter})
                if(!wasStopped){
                    serverService.AddStaticEndpoint({path:url, staticDir: output})
                    executorCommandChannel.emit("status", TaskStatusTypes.ACTIVE)
                } else {
                    executorCommandChannel.emit("status", TaskStatusTypes.TERMINATED)
                }
            } else throw `Tipo de endpoint "${type}" não encontrado`
            
        }catch(e){
            executorCommandChannel.emit("status", TaskStatusTypes.FAILURE)
            console.error(e)
        }
    }

    const Stop = () => {
        if(type === "controller" || isActive) {
            executorCommandChannel.emit("status", TaskStatusTypes.TERMINATED)
        }
        else if(type === "web-graphic-user-interface"){
            executorCommandChannel.emit("status", TaskStatusTypes.STOPPING)
        } else 
            executorCommandChannel.emit("status", TaskStatusTypes.FAILURE) 
    }

    const handleChangeStatus = (status) => {
        if(status === TaskStatusTypes.STOPPING) wasStopped=true
        if(status === TaskStatusTypes.ACTIVE) isActive=true
    }

    executorCommandChannel.on("start", Start)
    executorCommandChannel.on("stop", Stop)
    executorCommandChannel.on("status", handleChangeStatus)

    return () => {}
}

module.exports = EndpointInstanceTaskLoader 
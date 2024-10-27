const EventEmitter = require('events')
const path = require("path")

const MAX_CONNECT_RETRIES = 1000
const RETRY_DELAY_MS = 500

const LogExecutionCommand = async ({
    args, 
    startupParams,
    params
}) => {

	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams
    const { supervisorLib } = params

    const CreateCommunicationInterface = supervisorLib.require("CreateCommunicationInterface")
    const FormatterDataLog             = supervisorLib.require("FormatterDataLog")
    const TryConnectLogStreaming       = supervisorLib.require("TryConnectLogStreaming")

    const loggerEmitter = new EventEmitter()

    const socketFilePath = path.resolve(supervisorSocketsDirPath, socket)

    const _OpenLogStream = async (socketFilePath, loggerEmitter) => {
        const rpcClient = await CreateCommunicationInterface(socketFilePath)
        await TryConnectLogStreaming({
            loggerEmitter,
            client: rpcClient,
            ms: RETRY_DELAY_MS,
            remainingConnectionAttempts: MAX_CONNECT_RETRIES,
    
        })
    }

    loggerEmitter.on("log", async (dataLog) =>
        console.log(await FormatterDataLog(dataLog)))

    try {
        await _OpenLogStream(socketFilePath, loggerEmitter)
    } catch (e) {
        loggerEmitter
            && loggerEmitter.emit("log", { sourceName: "execution-supervisor", type: "warning", message: e })
    }
}

module.exports = LogExecutionCommand
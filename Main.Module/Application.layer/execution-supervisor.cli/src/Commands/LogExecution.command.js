const EventEmitter = require('events')
const path = require("path")

const CreateCommunicationInterface = require("../../../../Libraries.layer/supervisor.lib/src/CreateCommunicationInterface")
const FormatterDataLog             = require("../../../../Libraries.layer/supervisor.lib/src/FormatterDataLog")
const TryConnectLogStreaming       = require("../../../../Libraries.layer/supervisor.lib/src/TryConnectLogStreaming")

const MAX_CONNECT_RETRIES = 1000
const RETRY_DELAY_MS = 500

const LogExecutionCommand = async ({args, startupParams}) => {

	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams

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
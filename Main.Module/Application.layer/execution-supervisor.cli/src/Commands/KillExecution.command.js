const EventEmitter = require('events')
const path = require("path")

const CreateCommunicationInterface = require("../../../../Libraries.layer/supervisor.lib/src/CreateCommunicationInterface")
const FormatterDataLog = require("../../../../Libraries.layer/supervisor.lib/src/FormatterDataLog")

const KillExecutionCommand = async ({args, startupParams}) => {

	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams

	const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", async (dataLog) => 
		console.log(await FormatterDataLog(dataLog)))

	try {
		const socketFilePath = path.resolve(supervisorSocketsDirPath, socket)
		const daemonClient = await CreateCommunicationInterface(socketFilePath)
		daemonClient.Kill()
		loggerEmitter 
            && loggerEmitter.emit("log", {sourceName: "execution-supervisor", type:"info", message: `Ecosystem Daemon foi terminado!`})
	} catch(e){
		if(e.syscall === "connect"){
			loggerEmitter 
            && loggerEmitter.emit("log", {sourceName: "execution-supervisor", type:"error", message: "O Ecosystem Daemon ja estava inativo!"})
		} else {
			loggerEmitter 
            && loggerEmitter.emit("log", {sourceName: "execution-supervisor", type:"error", message: e})
		}
	}
}

module.exports = KillExecutionCommand
const EventEmitter = require('events')
const path = require("path")

const ConvertPathToAbsolutPath = require("../Utils/ConvertPathToAbsolutPath")

const KillExecutionCommand = async ({
	args, 
	startupParams,
	params
}) => {

	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams
	const { supervisorLib } = params

	const absolutSupervisorSocketsDirPath = ConvertPathToAbsolutPath(supervisorSocketsDirPath)
	
	const CreateCommunicationInterface = supervisorLib.require("CreateCommunicationInterface")
	const FormatterDataLog             = supervisorLib.require("FormatterDataLog")

	const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", async (dataLog) => 
		console.log(await FormatterDataLog(dataLog)))

	try {
		const socketFilePath = path.resolve(absolutSupervisorSocketsDirPath, socket)
		const daemonClient = await CreateCommunicationInterface(socketFilePath)
		await daemonClient.KillInstance()
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
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

	try {
		const socketFilePath = path.resolve(absolutSupervisorSocketsDirPath, socket)
		const daemonClient = await CreateCommunicationInterface(socketFilePath)
		await daemonClient.KillInstance()
		Log.info("execution-supervisor", `Ecosystem Daemon foi terminado!`)
	} catch(e){
		if(e.syscall === "connect"){
			Log.error("execution-supervisor", "O Ecosystem Daemon ja estava inativo!")
		} else {
			Log.error("execution-supervisor", e)
		}
	}
}

module.exports = KillExecutionCommand
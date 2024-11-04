const path = require("path")

const GetExecutionStatusCommand = async ({
	args, 
	startupParams,
	params
}) => {
	
	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams
	const { supervisorLib } = params
	
	const CreateCommunicationInterface = supervisorLib.require("CreateCommunicationInterface")
	
	try{
		const socketFilePath = path.resolve(supervisorSocketsDirPath, socket)
		const client = await CreateCommunicationInterface(socketFilePath)
		const executionStatus = await client.GetStatus()
		console.log(`Status da execução [${executionStatus}]`)
	}catch(e){
		console.log(e)
		console.log(`O pacote não esta em execução`)
	}
}

module.exports = GetExecutionStatusCommand
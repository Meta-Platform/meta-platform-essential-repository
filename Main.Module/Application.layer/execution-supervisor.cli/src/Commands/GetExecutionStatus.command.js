const path = require("path")

const CreateCommunicationInterface = require("../../../../Libraries.layer/supervisor.lib/src/CreateCommunicationInterface")

const GetExecutionStatusCommand = async ({ args, startupParams }) => {

	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams

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
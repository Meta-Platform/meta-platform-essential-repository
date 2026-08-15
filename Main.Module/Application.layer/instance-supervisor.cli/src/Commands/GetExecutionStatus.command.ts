const path = require("path")

const ConvertPathToAbsolutPath = require("../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/ConvertPathToAbsolutPath")

const GetExecutionStatusCommand = async ({
	args, 
	startupParams,
	params
}: {
    args: any
    startupParams: any
    params: any
}) => {
	
	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams
	const { supervisorLib } = params

	const absolutSupervisorSocketsDirPath = ConvertPathToAbsolutPath(supervisorSocketsDirPath)
	
	const CreateCommunicationInterface = supervisorLib.require("CreateCommunicationInterface")
	
	try{
		const socketFilePath = path.resolve(absolutSupervisorSocketsDirPath, socket)
		const client = await CreateCommunicationInterface(socketFilePath)
		const executionStatus = await client.GetStatus()
		Log.message("GetExecutionStatus", `Status da execução [${executionStatus}]`)
	}catch(e: any){
		Log.error("GetExecutionStatus", e)
		Log.message("GetExecutionStatus", `O pacote não esta em execução`)
	}
}

module.exports = GetExecutionStatusCommand
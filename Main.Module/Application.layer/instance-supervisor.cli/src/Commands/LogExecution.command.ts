const path = require("path")

const MAX_CONNECT_RETRIES = 1000
const RETRY_DELAY_MS = 500

const ConvertPathToAbsolutPath = require("../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/ConvertPathToAbsolutPath")

const LogExecutionCommand = async ({
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
    const TryConnectLogStreaming       = supervisorLib.require("TryConnectLogStreaming")

    const socketFilePath = path.resolve(absolutSupervisorSocketsDirPath, socket)

    const _OpenLogStream = async (socketFilePath: string) => {
        const rpcClient = await CreateCommunicationInterface(socketFilePath)
        await TryConnectLogStreaming({
            client: rpcClient,
            ms: RETRY_DELAY_MS,
            remainingConnectionAttempts: MAX_CONNECT_RETRIES,
    
        })
    }


    try {
        await _OpenLogStream(socketFilePath)
    } catch (e) {
        Log.warn("execution-supervisor", e)
    }
}

module.exports = LogExecutionCommand
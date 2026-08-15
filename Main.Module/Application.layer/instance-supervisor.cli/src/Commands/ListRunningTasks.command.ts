const path = require("path")

const ConvertPathToAbsolutPath = require("../../../../../Commons.Module/Utilities.layer/path-utilities.lib/src/ConvertPathToAbsolutPath")

const ListRunningTasksCommand = async ({
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
    const { supervisorLib, taskTableRenderLib } = params

    const absolutSupervisorSocketsDirPath = ConvertPathToAbsolutPath(supervisorSocketsDirPath)
	
	const CreateCommunicationInterface = supervisorLib.require("CreateCommunicationInterface")
    const MountTaskTable               = taskTableRenderLib.require("MountTaskTable")

    const socketFilePath = path.resolve(absolutSupervisorSocketsDirPath, socket)

    const daemonClient = await CreateCommunicationInterface(socketFilePath)
    const taskList = await daemonClient.ListTasks()
    const table = await MountTaskTable(taskList)
    Log.message("ListRunningTasks", table.toString())
}

module.exports = ListRunningTasksCommand
const path = require("path")

const ListRunningTasksCommand = async ({
    args, 
    startupParams,
    params
}) => {

	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams
    const { supervisorLib, taskTableRenderLib } = params
	
	const CreateCommunicationInterface = supervisorLib.require("CreateCommunicationInterface")
    const MountTaskTable               = taskTableRenderLib.require("MountTaskTable")

    const socketFilePath = path.resolve(supervisorSocketsDirPath, socket)

    const daemonClient = await CreateCommunicationInterface(socketFilePath)
    const taskList = await daemonClient.ListTasks()
    const table = await MountTaskTable(taskList)
    console.log(table.toString())
}

module.exports = ListRunningTasksCommand
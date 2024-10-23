const path = require("path")

const CreateCommunicationInterface = require("../../../../Libraries.layer/supervisor.lib/src/CreateCommunicationInterface")
const MountTaskTable = require("../../../../Libraries.layer/supervisor.lib/src/MountTaskTable")

const ListRunningTasksCommand = async ({args, startupParams}) => {

	const { socket } = args
	const { supervisorSocketsDirPath } = startupParams

    const socketFilePath = path.resolve(supervisorSocketsDirPath, socket)

    const daemonClient = await CreateCommunicationInterface(socketFilePath)
    const taskList = await daemonClient.ListTasks()
    const table = await MountTaskTable(taskList)
    console.log(table.toString())
}

module.exports = ListRunningTasksCommand
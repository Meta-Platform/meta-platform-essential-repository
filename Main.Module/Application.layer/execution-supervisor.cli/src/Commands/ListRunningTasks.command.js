const path = require("path")

const SetupCLIScriptLoader = require("meta-platform-cli-script-loader-library/SetupCLIScriptLoader")
const APP_PARAMS = require("../Configs/app-params-dev.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const META_PLATFORM_DEPENDENCIES = require("../Configs/meta-platform-dependencies.json")

const ListRunningTasksCommand = async ({socket}) => {  

    const LoaderScript = await SetupCLIScriptLoader( {
        npmDependenciesDirname   : APP_PARAMS.NPM_DEPENDENCIES_DIRNAME,
        npmDependencies          : NPM_DEPENDENCIES,
        metaPlatformDependencies : META_PLATFORM_DEPENDENCIES,
        sourceType               : APP_PARAMS.MINIMUM_REPO_SOURCE_TYPE,
        repoPath                 : APP_PARAMS.MINIMUM_REPO_PATH,
        repoNamespace            : APP_PARAMS.MINIMUM_REPO_NAMESPACE,
        fileId                   : APP_PARAMS.MINIMUM_REPO_FILE_ID
    })
    
	const CreateCommunicationInterface = LoaderScript("supervisor.lib/src/CreateCommunicationInterface")

    const MountTaskTable = LoaderScript("supervisor.lib/src/MountTaskTable")

    const socketFilePath = path.resolve(APP_PARAMS.SUPERVISOR_SOCKETS_DIRPATH, socket)

    const daemonClient = await CreateCommunicationInterface(socketFilePath)
    const taskList = await daemonClient.ListTasks()
    const table = await MountTaskTable(taskList, LoaderScript)
    console.log(table.toString())
}

module.exports = ListRunningTasksCommand
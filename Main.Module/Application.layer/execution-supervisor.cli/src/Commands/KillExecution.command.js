const EventEmitter = require('events')
const path = require("path")

const SetupCLIScriptLoader = require("meta-platform-cli-script-loader-library/SetupCLIScriptLoader")
const APP_PARAMS = require("../Configs/app-params-dev.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const META_PLATFORM_DEPENDENCIES = require("../Configs/meta-platform-dependencies.json")

const KillExecutionCommand = async ({socket}) => {

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
    const FormatterDataLog             = LoaderScript("supervisor.lib/src/FormatterDataLog")

	const loggerEmitter = new EventEmitter()
	loggerEmitter.on("log", async (dataLog) => 
		console.log(await FormatterDataLog(dataLog)))

	try {
		const socketFilePath = path.resolve(APP_PARAMS.SUPERVISOR_SOCKETS_DIRPATH, socket)
		const daemonClient = await CreateCommunicationInterface(socketFilePath)
		daemonClient.Kill()
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
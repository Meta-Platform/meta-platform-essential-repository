const EventEmitter = require('events')
const path = require("path")

const SetupCLIScriptLoader = require("meta-platform-cli-script-loader-library/SetupCLIScriptLoader")
const APP_PARAMS = require("../Configs/app-params-dev.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const META_PLATFORM_DEPENDENCIES = require("../Configs/meta-platform-dependencies.json")

const MAX_CONNECT_RETRIES = 1000
const RETRY_DELAY_MS = 500

const LogExecutionCommand = async ({socket}) => {

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
    const TryConnectLogStreaming       = LoaderScript("supervisor.lib/src/TryConnectLogStreaming")

    const loggerEmitter = new EventEmitter()

    const socketFilePath = path.resolve(APP_PARAMS.SUPERVISOR_SOCKETS_DIRPATH, socket)

    const _OpenLogStream = async (socketFilePath, loggerEmitter) => {
        const rpcClient = await CreateCommunicationInterface(socketFilePath)
        await TryConnectLogStreaming({
            loggerEmitter,
            client: rpcClient,
            ms: RETRY_DELAY_MS,
            remainingConnectionAttempts: MAX_CONNECT_RETRIES,
    
        })
    }

    loggerEmitter.on("log", async (dataLog) =>
        console.log(await FormatterDataLog(dataLog)))

    try {
        await _OpenLogStream(socketFilePath, loggerEmitter)
    } catch (e) {
        loggerEmitter
            && loggerEmitter.emit("log", { sourceName: "execution-supervisor", type: "warning", message: e })
    }
}

module.exports = LogExecutionCommand
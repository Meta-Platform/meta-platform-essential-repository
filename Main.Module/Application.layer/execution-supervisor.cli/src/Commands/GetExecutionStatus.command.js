const path = require("path")

const SetupCLIScriptLoader = require("meta-platform-cli-script-loader-library/SetupCLIScriptLoader")
const APP_PARAMS = require("../Configs/app-params-dev.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const META_PLATFORM_DEPENDENCIES = require("../Configs/meta-platform-dependencies.json")

const GetExecutionStatusCommand = async ({socket}) => {

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

	try{
		const socketFilePath = path.resolve(APP_PARAMS.SUPERVISOR_SOCKETS_DIRPATH, socket)
		const client = await CreateCommunicationInterface(socketFilePath)
		const executionStatus = await client.GetStatus()
		console.log(`Status da execução [${executionStatus}]`)
	}catch(e){
		console.log(e)
		console.log(`O pacote não esta em execução`)
	}
}

module.exports = GetExecutionStatusCommand
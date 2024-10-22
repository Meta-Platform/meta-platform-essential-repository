const path = require("path")

const SetupCLIScriptLoader = require("meta-platform-cli-script-loader-library/SetupCLIScriptLoader")
const APP_PARAMS = require("../Configs/app-params-dev.json")
const NPM_DEPENDENCIES =  require("../Configs/npm-dependencies.json")
const META_PLATFORM_DEPENDENCIES = require("../Configs/meta-platform-dependencies.json")

const ShowExecutionTaskInformationCommand = async ({taskId, socket}) => {

	const LoaderScript = await SetupCLIScriptLoader( {
        npmDependenciesDirname   : APP_PARAMS.NPM_DEPENDENCIES_DIRNAME,
        npmDependencies          : NPM_DEPENDENCIES,
        metaPlatformDependencies : META_PLATFORM_DEPENDENCIES,
        sourceType               : APP_PARAMS.MINIMUM_REPO_SOURCE_TYPE,
        repoPath                 : APP_PARAMS.MINIMUM_REPO_PATH,
        repoNamespace            : APP_PARAMS.MINIMUM_REPO_NAMESPACE,
        fileId                   : APP_PARAMS.MINIMUM_REPO_FILE_ID
    })

	const CreateCommunicationInterface      = LoaderScript("supervisor.lib/src/CreateCommunicationInterface")
    const RenderGeneralInformationTaskTable = LoaderScript("supervisor.lib/src/RenderGeneralInformationTaskTable")
    const RenderStaticParametersTaskTable   = LoaderScript("supervisor.lib/src/RenderStaticParametersTaskTable")
    const RenderLinkedParametersTaskTable   = LoaderScript("supervisor.lib/src/RenderLinkedParametersTaskTable")
    const RenderAgentLinkRulesTaskTable     = LoaderScript("supervisor.lib/src/RenderAgentLinkRulesTaskTable")
    const RenderActivationRulesTaskTable    = LoaderScript("supervisor.lib/src/RenderActivationRulesTaskTable")

    const socketFilePath = path.resolve(APP_PARAMS.SUPERVISOR_SOCKETS_DIRPATH, socket)

    const daemonClient = await CreateCommunicationInterface(socketFilePath)
    const task = await daemonClient.GetTask(taskId)
    await RenderGeneralInformationTaskTable(task)
    await RenderStaticParametersTaskTable(task.staticParameters)

    task.linkedParameters
        && await RenderLinkedParametersTaskTable(task.linkedParameters)

    task.agentLinkRules && task.agentLinkRules.length > 0
        && await RenderAgentLinkRulesTaskTable(task.agentLinkRules)

    task.activationRules 
        && await RenderActivationRulesTaskTable(task.activationRules)
}

module.exports = ShowExecutionTaskInformationCommand
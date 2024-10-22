const path = require("path")

const CreateCommunicationInterface      = require("../../../../Libraries.layer/supervisor.lib/src/CreateCommunicationInterface")
const RenderGeneralInformationTaskTable = require("../../../../Libraries.layer/supervisor.lib/src/RenderGeneralInformationTaskTable")
const RenderStaticParametersTaskTable   = require("../../../../Libraries.layer/supervisor.lib/src/RenderStaticParametersTaskTable")
const RenderLinkedParametersTaskTable   = require("../../../../Libraries.layer/supervisor.lib/src/RenderLinkedParametersTaskTable")
const RenderAgentLinkRulesTaskTable     = require("../../../../Libraries.layer/supervisor.lib/src/RenderAgentLinkRulesTaskTable")
const RenderActivationRulesTaskTable    = require("../../../../Libraries.layer/supervisor.lib/src/RenderActivationRulesTaskTable")

const ShowExecutionTaskInformationCommand = async ({args, startupParams}) => {

	const { taskId, socket } = args
	const { supervisorSocketsDirPath } = startupParams

    const socketFilePath = path.resolve(supervisorSocketsDirPath, socket)

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
const path = require("path")

const ShowExecutionTaskInformationCommand = async ({
    args, 
    startupParams,
    params
}) => {

	const { taskId, socket } = args
	const { supervisorSocketsDirPath } = startupParams
    const { supervisorLib } = params

    const CreateCommunicationInterface      = supervisorLib.require("CreateCommunicationInterface")
    const RenderGeneralInformationTaskTable = supervisorLib.require("RenderGeneralInformationTaskTable")
    const RenderStaticParametersTaskTable   = supervisorLib.require("RenderStaticParametersTaskTable")
    const RenderLinkedParametersTaskTable   = supervisorLib.require("RenderLinkedParametersTaskTable")
    const RenderAgentLinkRulesTaskTable     = supervisorLib.require("RenderAgentLinkRulesTaskTable")
    const RenderActivationRulesTaskTable    = supervisorLib.require("RenderActivationRulesTaskTable")

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
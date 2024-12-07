const path = require("path")

const ShowExecutionTaskInformationCommand = async ({
    args, 
    startupParams,
    params
}) => {

	const { taskId, socket } = args
	const { supervisorSocketsDirPath } = startupParams
    const { supervisorLib, taskTableRenderLib  } = params

    const CreateCommunicationInterface      = supervisorLib.require("CreateCommunicationInterface")
    const RenderGeneralInformationTaskTable = taskTableRenderLib.require("RenderGeneralInformationTaskTable")
    const RenderStaticParametersTaskTable   = taskTableRenderLib.require("RenderStaticParametersTaskTable")
    const RenderLinkedParametersTaskTable   = taskTableRenderLib.require("RenderLinkedParametersTaskTable")
    const RenderAgentLinkRulesTaskTable     = taskTableRenderLib.require("RenderAgentLinkRulesTaskTable")
    const RenderActivationRulesTaskTable    = taskTableRenderLib.require("RenderActivationRulesTaskTable")

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
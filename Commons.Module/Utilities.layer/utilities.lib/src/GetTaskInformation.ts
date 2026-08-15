import type { Task, TaskInformation } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"

const GetTaskInformation = (task: Task): TaskInformation => {
    const {
        taskId,
        status,
        statusReason,
        pTaskId,
        objectLoaderType,
        staticParameters,
        linkedParameters,
        agentLinkRules,
        activationRules,
        children
    } = task

    return {
        taskId,
        status,
        ...statusReason ? { statusReason } : {},
        ...pTaskId ? { pTaskId } : {},
        hasChildTasks: !!children && children.length > 0,
        objectLoaderType,
        ...staticParameters ? { staticParameters } : {},
        ...linkedParameters ? { linkedParameters } : {},
        ...agentLinkRules ? { agentLinkRules } : {},
        ...activationRules ? { activationRules } : {}
    }
}

module.exports = GetTaskInformation

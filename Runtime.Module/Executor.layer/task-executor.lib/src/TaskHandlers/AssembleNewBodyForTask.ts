const EventEmitter = require('node:events')

const AssembleNewBodyForTask = ({ taskId, pTaskId, executionParams }: { taskId: number, pTaskId: number, executionParams: any }) => {
    const {
        objectLoaderType, 
        staticParameters,
        linkedParameters,
        agentLinkRules,
        activationRules,
        children
    } = executionParams

    return {
        taskId,
        ...pTaskId ? { pTaskId } : {}, 
        hasChildTasks: !!children && children.length > 0,
        objectLoaderType,
        executorChannel: new EventEmitter(),
        ...staticParameters ? { staticParameters } : {},
        ...linkedParameters ? { linkedParameters } : {},
        ...agentLinkRules ? { agentLinkRules } : {},
        ...activationRules ? { activationRules } : {}
    }
}

module.exports = AssembleNewBodyForTask
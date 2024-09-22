const EventEmitter = require('node:events')

const AssembleNewBodyForTask = ({ taskId, pTaskId, executionParams }) => {
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
        executorCommandChannel: new EventEmitter(),
        ...staticParameters ? { staticParameters } : {},
        ...linkedParameters ? { linkedParameters } : {},
        ...agentLinkRules ? { agentLinkRules } : {},
        ...activationRules ? { activationRules } : {}
    }
}

module.exports = AssembleNewBodyForTask
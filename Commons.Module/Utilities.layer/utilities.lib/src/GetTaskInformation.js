
const GetTaskInformation = (task) => {       
    const {
        taskId,
        status, 
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
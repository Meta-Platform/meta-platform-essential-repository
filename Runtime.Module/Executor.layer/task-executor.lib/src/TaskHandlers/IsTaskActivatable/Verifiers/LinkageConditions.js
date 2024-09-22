const CheckIfRequirementsMatch = require("../CheckIfRequirementsMatch")

const VerifyLinkageConditions = (taskStateManager, taskId) => {

    const {
        linkedParameters,
        agentLinkRules
    } = taskStateManager.GetTask(taskId)

    if(linkedParameters && agentLinkRules){
        return agentLinkRules
        .reduce((isValidAcc, { requirement }) => {
            if(isValidAcc){
                return CheckIfRequirementsMatch(taskStateManager, requirement)
            }
            return isValidAcc
        }, true)
    }

    return true
}

module.exports = VerifyLinkageConditions
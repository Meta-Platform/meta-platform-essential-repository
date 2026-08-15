const CheckIfRequirementsMatch = require("../CheckIfRequirementsMatch")

const VerifyLinkageConditions = (taskStateManager: any, taskId: number) => {

    const {
        linkedParameters,
        agentLinkRules
    } = taskStateManager.GetTask(taskId)

    if(linkedParameters && agentLinkRules){
        return agentLinkRules
        .reduce((isValidAcc: boolean, { requirement }: any) => {
            if(isValidAcc){
                return CheckIfRequirementsMatch(taskStateManager, requirement)
            }
            return isValidAcc
        }, true)
    }

    return true
}

module.exports = VerifyLinkageConditions
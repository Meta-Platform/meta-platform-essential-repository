const VerifyActivationsRulesConditions = require("./Verifiers/ActivationsRulesConditions")
const VerifyLinkageConditions = require("./Verifiers/LinkageConditions")
const VerifyAllChildTasksActive = require("./Verifiers/AllChildTasksActive")

const IsTaskActivatable = (taskStateManager, taskId) => {

    const {
        linkedParameters,
        agentLinkRules,
        hasChildTasks,
        activationRules
    } = taskStateManager.GetTask(taskId)

    const _CheckTaskConditionFree = () => !linkedParameters 
                                            && !agentLinkRules 
                                            && !hasChildTasks 
                                            && !activationRules

    if(_CheckTaskConditionFree()){
        return true
    } else if(
        VerifyLinkageConditions(taskStateManager, taskId) 
        && VerifyActivationsRulesConditions(taskStateManager, taskId)
    ){
        if(hasChildTasks){
            return VerifyAllChildTasksActive(taskStateManager, taskId)
        }
        return true
    }
    return false
}

module.exports = IsTaskActivatable
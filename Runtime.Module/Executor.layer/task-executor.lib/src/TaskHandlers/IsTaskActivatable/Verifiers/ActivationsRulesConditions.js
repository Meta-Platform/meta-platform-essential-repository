
const CheckIfRequirementsMatch = require("../CheckIfRequirementsMatch")

const VerifyActivationsRulesConditions = (taskStateManager, taskId) => {
    const {
        activationRules
    } = taskStateManager.GetTask(taskId)

    if(activationRules)
        return CheckIfRequirementsMatch(taskStateManager, activationRules)

    return true
}

module.exports = VerifyActivationsRulesConditions
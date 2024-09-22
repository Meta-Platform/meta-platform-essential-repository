const FindTaskByQuery = require("../FindTaskByQuery")
const ConvertRequirementExpressionToTaskQuery = require("./ConvertRequirementExpressionToTaskQuery")

const GetTaskServiceObject = ({
    taskStateManager,
    agentLinkRules,
    refValue
}) => {
    const ruleFound = agentLinkRules.find(({referenceName}) => referenceName === refValue)
    const { requirement } = ruleFound
    const conditionType = Object.keys(requirement)[0]
    if(conditionType === "&&"){
        const requirementExpression = requirement[conditionType]
        const taskQuery = ConvertRequirementExpressionToTaskQuery(requirementExpression)
        const task = FindTaskByQuery(taskStateManager, taskQuery)
        return task.getServiceObject()
    }
    //TODO Rever esse erro
    throw "ERROR GetTaskServiceObject"
}

module.exports = GetTaskServiceObject
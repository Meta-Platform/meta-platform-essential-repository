const FindTaskByQuery = require("../FindTaskByQuery")

const ConvertRequirementExpressionToTaskQuery = (requirementExpression) => 
    requirementExpression.reduce((queryAcc, { property, "=": equals }) => equals 
        ? { ...queryAcc, [property]: {value: equals, type: "=" } }
    : queryAcc, {})

const CheckIfRequirementsMatch = (taskStateManager, requirement) => {
    try{
        const conditionType = Object.keys(requirement)[0]
        if(conditionType === "&&"){
            const requirementExpression = requirement[conditionType]
            const taskQuery = ConvertRequirementExpressionToTaskQuery(requirementExpression)
            return !!FindTaskByQuery(taskStateManager, taskQuery)
        }
    }catch(e){
        console.log(e)
    }
    return false
}


module.exports = CheckIfRequirementsMatch
const FindTaskByQuery = require("../FindTaskByQuery")

const ConvertRequirementExpressionToTaskQuery = (requirementExpression: any) => 
    requirementExpression.reduce((queryAcc: any, { property, "=": equals }: any) => equals 
        ? { ...queryAcc, [property]: {value: equals, type: "=" } }
    : queryAcc, {})

const CheckIfRequirementsMatch = (taskStateManager: any, requirement: any) => {
    try{
        const conditionType = Object.keys(requirement)[0]
        if(conditionType === "&&"){
            const requirementExpression = requirement[conditionType]
            const taskQuery = ConvertRequirementExpressionToTaskQuery(requirementExpression)
            return !!FindTaskByQuery(taskStateManager, taskQuery)
        }
    }catch(e){
        Log.error("CheckIfRequirementsMatch", e)
    }
    return false
}


module.exports = CheckIfRequirementsMatch
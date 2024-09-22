const ConvertRequirementExpressionToTaskQuery = (requirementExpression) => 
        requirementExpression
            .reduce((queryAcc, { property, "=":equals }) => equals 
                ? { ...queryAcc, [property]: {value: equals, type: "=" } }
                : queryAcc, {}) 

module.exports = ConvertRequirementExpressionToTaskQuery
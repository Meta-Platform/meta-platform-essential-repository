const ConvertRequirementExpressionToTaskQuery = (requirementExpression: any) => 
        requirementExpression
            .reduce((queryAcc: any, { property, "=":equals }: any) => equals 
                ? { ...queryAcc, [property]: {value: equals, type: "=" } }
                : queryAcc, {}) 

module.exports = ConvertRequirementExpressionToTaskQuery
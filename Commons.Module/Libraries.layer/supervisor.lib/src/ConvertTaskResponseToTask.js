const ExtractValue = (protoValueResponse) => {
    const kind = protoValueResponse.kind
    const valueResponse = protoValueResponse[kind]
    if("structValue" === kind){
        return ConvertStructProtoToObject(valueResponse)
    } if("listValue" === kind) {
        return ExtractList(valueResponse)
    } else {
        return valueResponse
    }
}

const ExtractList = (listResponse) => {
    const { values } = listResponse
    return values.map((valueResponse) => ExtractValue(valueResponse))
}

const ConvertStructProtoToObject = (structResponse) => {
    const { fields } = structResponse
    return Object
    .entries(fields)
        .reduce((acc, [property, value]) => {
            return {
                ...acc,
                [property]: ExtractValue(value)
            }
        }, {})
}

const ConvertTaskResponseToTask = (taskResponse) => {
    return {
        ...taskResponse,
        pTaskId: taskResponse.pTaskId && taskResponse.pTaskId.value,
		...taskResponse.staticParameters ? { staticParameters: ConvertStructProtoToObject(taskResponse.staticParameters) } : {},
		...taskResponse.activationRules ? { activationRules: ConvertStructProtoToObject(taskResponse.activationRules) } : {},
        ...taskResponse.linkedParameters ? { linkedParameters: ConvertStructProtoToObject(taskResponse.linkedParameters) } : {},
        ...taskResponse.agentLinkRules ? { 
            agentLinkRules: taskResponse.agentLinkRules.map((rule) => {
                return {...rule, requirement: ConvertStructProtoToObject(rule.requirement)}
            })
        } : {}
    }
}

module.exports = ConvertTaskResponseToTask
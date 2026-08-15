import type { Task } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"
import type { ConvertTaskResponseToTaskFn, ProtoValue, ProtoStruct, ProtoList } from "./Types"

const ExtractValue = (protoValueResponse: ProtoValue): any => {
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

const ExtractList = (listResponse: ProtoList): any[] => {
    const { values } = listResponse
    return values.map((valueResponse) => ExtractValue(valueResponse))
}

const ConvertStructProtoToObject = (structResponse: ProtoStruct): Record<string, any> => {
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

/*
 * Fronteira de desserialização: aqui o dado deixa de ser resposta de gRPC e
 * passa a ser tarefa. O que entra vem do proto, com os `Struct` embrulhados; o
 * que sai é `Task`, e a afirmação no fim do retorno é o ponto exato em que essa
 * travessia acontece.
 */
const ConvertTaskResponseToTask: ConvertTaskResponseToTaskFn = (taskResponse) => {
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
    } as Task
}

module.exports = ConvertTaskResponseToTask

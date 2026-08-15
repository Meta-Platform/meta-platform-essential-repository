const GetTaskServiceObject = require("./GetTaskServiceObject")

const IsString = (value: any) => typeof value === "string"

const AssembleLinkedTaskParameters = ({ taskStateManager, agentLinkRules, linkedParameters }: { taskStateManager: any, agentLinkRules: any, linkedParameters: any }) => {

    const AssembleParams: any = (linkedParameters: any) =>  Object
        .keys(linkedParameters)
        .reduce((paramsInAssembly: any, paramName: any) =>{
            const valueForBind = linkedParameters[paramName]
            if(IsString(valueForBind)){
                return {
                    ...paramsInAssembly, 
                    [paramName]: GetTaskServiceObject({
                        taskStateManager,
                        agentLinkRules,
                        refValue: valueForBind
                    })
                }
            }else {
                return {
                    ...paramsInAssembly, 
                    [paramName]: AssembleParams(valueForBind)
                }
            }
        }, {})

    return AssembleParams(linkedParameters)
}

module.exports = AssembleLinkedTaskParameters
const GetTaskServiceObject = require("./GetTaskServiceObject")

const IsString = (value) => typeof value === "string"

const AssembleLinkedTaskParameters = ({ taskStateManager, agentLinkRules, linkedParameters }) => {

    const AssembleParams = (linkedParameters) =>  Object
        .keys(linkedParameters)
        .reduce((paramsInAssembly, paramName)=>{
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
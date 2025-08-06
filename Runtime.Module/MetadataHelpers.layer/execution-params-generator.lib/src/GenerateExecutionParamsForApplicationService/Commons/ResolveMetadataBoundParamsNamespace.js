const MountBoundParamsRef = (boundParamsNames, argBoundParams) =>  
    (boundParamsNames || [])
    .reduce((boundParamsNameListDependencyAcc, boundParamNamespace) => {
        
        if(!argBoundParams){
            if(boundParamNamespace.charAt(0) === "?"){
                return {
                    ...boundParamsNameListDependencyAcc,
                    [boundParamNamespace.slice(1)]: undefined
                }
            } else throw `O parâmetro linkado [${boundParamNamespace}] não encontrado!`
        }
        const newBoundParamNamespace = boundParamNamespace.charAt(0) === "?" ? boundParamNamespace.slice(1) : boundParamNamespace
        return {
            ...boundParamsNameListDependencyAcc,
            [newBoundParamNamespace]: argBoundParams[newBoundParamNamespace]
        }

    }, {})
const MountBoundParams = (boundParamsChunck, boundParamsRef) => {

    const _getValue = (paramName, boundParamsChunck) => {
        const paramValue = boundParamsChunck[paramName]
        //TODO Arrumar para Array e undefined
        if(typeof paramValue === "string"){  
            const paramValueRef = boundParamsRef[paramName]
            if(paramValueRef === paramValue){
                return paramValue
            } else {
                return boundParamsRef[paramValue]
            }
        } else {
            return MountBoundParams(paramValue, boundParamsRef)
        }
    }

    return boundParamsChunck && Object.keys(boundParamsChunck)
    .reduce((boundParamsResolvedAcc, paramName) => {
        return {
            ...boundParamsResolvedAcc,
            [paramName]:_getValue(paramName, boundParamsChunck)
        }
    }, {})
}

const ResolveMetadataBoundParamsNamespace = ({
    boundParamsNames,
    argBoundParams,
    boundParams: _boundParams
}) => {
    const boundParamsRef = MountBoundParamsRef(boundParamsNames, argBoundParams)
    const boundParams = MountBoundParams(_boundParams, boundParamsRef)
    return boundParams
}

module.exports = ResolveMetadataBoundParamsNamespace
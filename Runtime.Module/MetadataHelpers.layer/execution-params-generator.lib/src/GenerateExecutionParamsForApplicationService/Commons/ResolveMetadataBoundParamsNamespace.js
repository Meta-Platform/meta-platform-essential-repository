const MountBoundParamsRef = (boundParamsNames, argBoundParams) =>  
    (boundParamsNames || [])
    .reduce((boundParamsNameListDependencyAcc, boundParamNamespace) => {
        if(!argBoundParams) throw `O parâmetro linkado [${boundParamNamespace}] não encontrado!`
        return {
            ...boundParamsNameListDependencyAcc,
            [boundParamNamespace]: argBoundParams[boundParamNamespace]
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
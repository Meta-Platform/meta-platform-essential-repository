const MountBoundParamsRef = (boundParamsNames, itemMetadata) =>  
    (boundParamsNames || [])
    .reduce((boundParamsNameListDependencyAcc, boundParamNamespace) => {
        const bootBoundParams = itemMetadata["bound-params"]
        if(!bootBoundParams) throw `O parâmetro linkado [${boundParamNamespace}] não esta sendo ligado a dependência ${itemMetadata.dependency}!`
        return {
            ...boundParamsNameListDependencyAcc,
            [boundParamNamespace]: bootBoundParams[boundParamNamespace]
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
    itemMetadata,
    boundParams: _boundParams
}) => {
    const boundParamsRef = MountBoundParamsRef(boundParamsNames, itemMetadata)
    const boundParams = MountBoundParams(_boundParams, boundParamsRef)
    return boundParams
}

module.exports = ResolveMetadataBoundParamsNamespace
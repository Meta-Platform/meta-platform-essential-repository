const ResolveBoundParamsNamespace = ({
    endpointBoundParams,
    metadataDependency,
    bootEndpointGroupMetadata
}) => {

    const { 
        "bound-params": boundParamsNameListDependency
    } = metadataDependency

    const _MountBoundParamsRef = () =>  (boundParamsNameListDependency || [])
        .reduce((boundParamsNameListDependencyAcc, boundParamNamespace) => {
            const bootBoundParams = bootEndpointGroupMetadata["bound-params"]
            return {
                ...boundParamsNameListDependencyAcc,
                [boundParamNamespace]: bootBoundParams[boundParamNamespace]
            }

        }, {})

    const _MountBoundParams = (boundParams, boundParamsRef) => {

        const __getValue = (paramValue) => {
            //TODO Arrumar para Array e undefined
            if(typeof paramValue === "string"){
                return boundParamsRef[paramValue]
            } else {
                return _MountBoundParams(paramValue, boundParamsRef)
            }
        }

        return boundParams && Object.keys(boundParams)
            .reduce((boundParamsResolvedAcc, paramName) => {
                return {
                    ...boundParamsResolvedAcc,
                    [paramName]:__getValue(boundParams[paramName])
                }
            }, {})
    }

    const boundParamsRef = _MountBoundParamsRef()
    const boundParams = _MountBoundParams(endpointBoundParams, boundParamsRef)
    return boundParams
    
}


module.exports = ResolveBoundParamsNamespace
const GetPopulatedParameters = require("../Utils/GetPopulatedParameters")

const ExtractNamespaceFromDependency    = require("./ExtractNamespaceFromDependency")
const FindMetadata                      = require("./FindMetadata")
const ExtractMetadataFromMetadataByType = require("./ExtractMetadataFromMetadataByType")
const CheckParamsIsValid                = require("./CheckParamsIsValid")
const CreateEndpointTaskParams          = require("./CreateEndpointTaskParams")
const ExtractStartupParamstMetadata     = require("./ExtractStartupParamstMetadata")

const ResolveParams = ({
    params,
    metadataHierarchy
}) => {
    const startupParamsMetadata = ExtractStartupParamstMetadata(metadataHierarchy)
    const processedParams = GetPopulatedParameters(params, startupParamsMetadata)
    return processedParams
}

const RemapEndpointParamsProperty = (params) => {
    const remappedParams =  {
        ...params["api-template"]
        ? {
            apiTemplate: params["api-template"]
        }
        : {},
        ...params["controller-params"]
        ? {
            controllerParams: params["controller-params"]
        }
        : {}
    }

    const remainingParams = Object
    .keys(params)
    .filter((property) => {
        return property !== "api-template" 
        && property !== "controller-params" 
    })
    .reduce((paramsAcc, property) => ({...paramsAcc, [property]:params[property]}), {})
    return { ...remappedParams, ...remainingParams}
}


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

const IsValid = ({
    metadata, 
    metadataDependency
}) => {

    const _IsParamsValid = () => {
        const { params } = metadata
        const { params:paramsDependency } = metadataDependency

        if(paramsDependency){
            return CheckParamsIsValid(params, paramsDependency)
        }
        return true
    }

    const _IsBoundParamsValid = () => {
        const { "bound-params":boundParams } = metadata
        const { "bound-params":boundParamsDependency } = metadataDependency

        if(boundParamsDependency){
            return CheckParamsIsValid(boundParams, boundParamsDependency)
        }
        return true
    }

    return _IsParamsValid() && _IsBoundParamsValid()
}

const CreateListEndpointTaskParams = ({ typeMetadata, bootEndpointGroupMetadata, metadataHierarchy }) => {

    const namespaceDependency = ExtractNamespaceFromDependency(bootEndpointGroupMetadata.dependency, metadataHierarchy)

    const metadataDependency = ExtractMetadataFromMetadataByType({ 
        type: typeMetadata, 
        dependency: bootEndpointGroupMetadata.dependency, 
        dependencyMetadata: FindMetadata(namespaceDependency, metadataHierarchy)
    })   
    
    const { endpoints } = metadataDependency

    if(endpoints && endpoints.length > 0){
        if(IsValid({ metadata: bootEndpointGroupMetadata, metadataDependency })){

            return endpoints.map((endpointMetadata) => {

                const [
                    boundParams,
                    params
                ] = [
                    ResolveBoundParamsNamespace({
                        endpointBoundParams: RemapEndpointParamsProperty(endpointMetadata["bound-params"]),
                        metadataDependency,
                        bootEndpointGroupMetadata
                    }),
                    ResolveParams({
                        params: RemapEndpointParamsProperty(endpointMetadata.params),
                        metadataHierarchy
                    })
                ]

                return CreateEndpointTaskParams(({ 
                    typeMetadata,
                    url: endpointMetadata.url, 
                    type: endpointMetadata.type, 
                    boundParams,
                    params, 
                    namespaceDependency
                }))
                
            })

        }
        return []
    }
    return []
}

module.exports = CreateListEndpointTaskParams
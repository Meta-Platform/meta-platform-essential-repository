const GetPopulatedParameters = require("../Utils/GetPopulatedParameters")

const ExtractNamespaceFromDependency    = require("./ExtractNamespaceFromDependency")
const FindMetadata                      = require("./FindMetadata")
const ExtractMetadataFromMetadataByType = require("./ExtractMetadataFromMetadataByType")
const CheckParamsIsValid                = require("./CheckParamsIsValid")
const CreateEndpointTaskParams          = require("./CreateEndpointTaskParams")
const ExtractStartupParamstMetadata     = require("./ExtractStartupParamstMetadata")

const CreateListEndpointTaskParams = ({ typeMetadata, bootEndpointGroupMetadata, metadataHierarchy }) => {
    const namespaceDependency = ExtractNamespaceFromDependency(bootEndpointGroupMetadata.dependency, metadataHierarchy)
    const metadataDependency = ExtractMetadataFromMetadataByType({ 
        type: typeMetadata, 
        dependency: bootEndpointGroupMetadata.dependency, 
        dependencyMetadata: FindMetadata(namespaceDependency, metadataHierarchy)
    })   
    
    const { 
        endpoints, 
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

    const _ResolveBoundParamsNamespace = (endpointBoundParams) => {
        const boundParamsRef = _MountBoundParamsRef()
        const boundParams = _MountBoundParams(endpointBoundParams, boundParamsRef)
        return boundParams
    }

    const _IsValid = (metadata, metadataDepencency) => {

        const __IsParamsValid = () => {
            const { params } = metadata
            const { params:paramsDependency } = metadataDepencency

            if(paramsDependency){
                return CheckParamsIsValid(params, paramsDependency)
            }
            return true
        }

        const __IsBoundParamsValid = () => {
            const { "bound-params":boundParams } = metadata
            const { "bound-params":boundParamsDependency } = metadataDepencency

            if(boundParamsDependency){
                return CheckParamsIsValid(boundParams, boundParamsDependency)
            }
            return true
        }

        return __IsParamsValid() && __IsBoundParamsValid()
    }

    const _ResolveParams = (params) => {
        const startupParamsMetadata = ExtractStartupParamstMetadata(metadataHierarchy)
        const processedParams = GetPopulatedParameters(params, startupParamsMetadata)
        return processedParams
    }

    const _Remap = (params) => {
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

    if(endpoints && endpoints.length > 0){
        if(_IsValid(bootEndpointGroupMetadata, metadataDependency)){
            return endpoints.map((endpointMetadata) => {

                return CreateEndpointTaskParams(({ 
                    typeMetadata,
                    url: endpointMetadata.url, 
                    type: endpointMetadata.type, 
                    boundParams:_ResolveBoundParamsNamespace(_Remap(endpointMetadata["bound-params"])),
                    params: _ResolveParams(_Remap(endpointMetadata.params)), 
                    namespaceDependency
                }))
            })
        }
        return []
    }
    return []
}

module.exports = CreateListEndpointTaskParams
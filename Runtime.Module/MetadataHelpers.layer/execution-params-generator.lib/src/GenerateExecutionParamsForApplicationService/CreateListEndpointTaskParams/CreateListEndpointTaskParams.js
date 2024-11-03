const ExtractNamespaceFromDependency    = require("../Commons/ExtractNamespaceFromDependency")
const FindMetadata                      = require("../Commons/FindMetadata")
const ExtractMetadataFromMetadataByType = require("../Commons/ExtractMetadataFromMetadataByType")
const CreateEndpointTaskParams          = require("../Commons/CreateEndpointTaskParams")

const ResolveParams               = require("./ResolveParams")
const RemapAllParams              = require("../Commons/RemapAllParams")
const ResolveBoundParamsNamespace = require("./ResolveBoundParamsNamespace")
const IsValid                     = require("./IsValid")

const CreateListEndpointTaskParams = ({ 
    typeMetadata, 
    bootEndpointGroupMetadata, 
    metadataHierarchy
}) => {

    const namespaceDependency = ExtractNamespaceFromDependency(bootEndpointGroupMetadata.dependency, metadataHierarchy)

    const metadataDependency = ExtractMetadataFromMetadataByType({ 
        type               : typeMetadata, 
        dependency         : bootEndpointGroupMetadata.dependency, 
        dependencyMetadata : FindMetadata(namespaceDependency, metadataHierarchy)
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
                        endpointBoundParams: RemapAllParams(endpointMetadata["bound-params"]),
                        metadataDependency,
                        bootEndpointGroupMetadata
                    }),
                    ResolveParams({
                        params: RemapAllParams(endpointMetadata.params),
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
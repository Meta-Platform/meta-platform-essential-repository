const ExtractNamespaceFromDependency    = require("../ExtractNamespaceFromDependency")
const FindMetadata                      = require("../FindMetadata")
const ExtractMetadataFromMetadataByType = require("../ExtractMetadataFromMetadataByType")
const CreateEndpointTaskParams          = require("../CreateEndpointTaskParams")

const ResolveParams               = require("./ResolveParams")
const RemapEndpointParamsProperty = require("./RemapEndpointParamsProperty")
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
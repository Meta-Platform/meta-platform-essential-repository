const ExtractNamespaceFromDependency      = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                        = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType   = require("./Commons/ExtractMetadataFromMetadataByType")
const ResolveMetadataParams               = require("./Commons/ResolveMetadataParams")
const RemapAllParams                      = require("./Commons/RemapAllParams")
const ResolveMetadataBoundParamsNamespace = require("./Commons/ResolveMetadataBoundParamsNamespace")
const IsValidMetadata                     = require("./Commons/IsValidMetadata")

const CreateEndpointTaskParams            = require("./CreateEndpointTaskParams")

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
        if(IsValidMetadata(bootEndpointGroupMetadata, metadataDependency)){

            return endpoints.map((endpointMetadata) => {

                const [
                    boundParams,
                    params
                ] = [
                    ResolveMetadataBoundParamsNamespace({
                        boundParamsNames: metadataDependency["bound-params"],
                        bootMetadata: bootEndpointGroupMetadata,
                        boundParams: RemapAllParams(endpointMetadata["bound-params"])
                    }),
                    ResolveMetadataParams({
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
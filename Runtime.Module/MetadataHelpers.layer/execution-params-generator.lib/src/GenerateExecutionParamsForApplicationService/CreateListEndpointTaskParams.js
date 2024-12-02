const ExtractNamespaceFromDependency      = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                        = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType   = require("./Commons/ExtractMetadataFromMetadataByType")
const RemapAllParams                      = require("./Commons/RemapAllParams")
const IsValidMetadata                     = require("./Commons/IsValidMetadata")
const ResolveAllParamsMetadata            = require("./Commons/ResolveAllParamsMetadata")

const CreateEndpointTaskParams            = require("./CreateEndpointTaskParams")

const CreateListEndpointTaskParams = ({ 
    typeMetadata, 
    itemMetadata, 
    metadataHierarchy
}) => {

    const namespaceDependency = ExtractNamespaceFromDependency(itemMetadata.dependency, metadataHierarchy)

    const metadataDependency = ExtractMetadataFromMetadataByType({ 
        type               : typeMetadata, 
        dependency         : itemMetadata.dependency, 
        dependencyMetadata : FindMetadata(namespaceDependency, metadataHierarchy)
    })   
    
    const { endpoints } = metadataDependency

    if(endpoints && endpoints.length > 0){
        if(IsValidMetadata(itemMetadata, metadataDependency)){

            return endpoints.map((endpointMetadata) => {

                const { boundParams, params } = 
                    ResolveAllParamsMetadata({
                        boundParamsNames : metadataDependency["bound-params"],
                        itemMetadata,
                        boundParams      : RemapAllParams(endpointMetadata["bound-params"]),
                        params           : RemapAllParams(endpointMetadata.params),
                        metadataHierarchy
                    })
                    
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
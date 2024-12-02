const ExtractNamespaceFromDependency         = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                           = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType      = require("./Commons/ExtractMetadataFromMetadataByType")
const RemapAllParams                         = require("./Commons/RemapAllParams")
const IsValidMetadata                        = require("./Commons/IsValidMetadata")
const ResolveMetadataBoundParamsNamespace    = require("./Commons/ResolveMetadataBoundParamsNamespace")
const ResolveMetadataParamsWithStartupParams = require("./Commons/ResolveMetadataParamsWithStartupParams")
const GetPopulatedParameters                 = require("../Utils/GetPopulatedParameters")

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
    
            const endpointGroupParamsResolved = ResolveMetadataParamsWithStartupParams({ 
                params: itemMetadata.params || {}, 
                metadataHierarchy
            })
                
            return endpoints.map((endpointMetadata) => {

                const endpointBoundParamsResolved = ResolveMetadataBoundParamsNamespace({ 
                    boundParamsNames: metadataDependency["bound-params"], 
                    argBoundParams: itemMetadata["bound-params"], 
                    boundParams: endpointMetadata["bound-params"]
                })

                const paramsResolved = GetPopulatedParameters(endpointMetadata.params, endpointGroupParamsResolved)
                    
                return CreateEndpointTaskParams(({ 
                    typeMetadata,
                    url: endpointMetadata.url, 
                    type: endpointMetadata.type, 
                    boundParams:RemapAllParams(endpointBoundParamsResolved),
                    params:RemapAllParams(paramsResolved), 
                    namespaceDependency
                }))
                
            })

        }
        return []
    }
    return []
}

module.exports = CreateListEndpointTaskParams
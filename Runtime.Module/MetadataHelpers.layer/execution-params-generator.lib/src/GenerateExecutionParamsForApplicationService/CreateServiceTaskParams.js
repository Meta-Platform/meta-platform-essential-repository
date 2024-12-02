const ExtractNamespaceFromDependency          = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                            = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType       = require("./Commons/ExtractMetadataFromMetadataByType")
const ConvertTypeTaskParamsToObjectLoaderType = require("./Commons/ConvertTypeTaskParamsToObjectLoaderType")
const ExtractNamespaceListByBoundParams       = require("./Commons/ExtractNamespaceListByBoundParams")
const RemapAllParams                          = require("./Commons/RemapAllParams")
const ResolveAllParamsMetadata                = require("./Commons/ResolveAllParamsMetadata")
const IsValidMetadata                         = require("./Commons/IsValidMetadata")

const MountParams = ({
    typeMetadata,
    namespace,
    serviceParameterNames,
    boundParams,
    params,
    path,
    namespaceDependency
}) => {
    const namespaceList = boundParams && ExtractNamespaceListByBoundParams(boundParams)
    return {
        objectLoaderType: ConvertTypeTaskParamsToObjectLoaderType(typeMetadata),
        staticParameters:{
            tag: namespace,
            ...params ? params : {},
            path,
            serviceParameterNames
        },
        linkedParameters:  {
            nodejsPackageHandler: namespaceDependency, 
            ...boundParams ? boundParams : {}
        },
        agentLinkRules:[
            ...namespaceDependency 
                ? [{
                    referenceName: namespaceDependency,
                    requirement:{
                        "&&": [
                            { "property": "params.tag", "=": namespaceDependency },
                            { "property": "status", "=": "ACTIVE" }
                        ]
                    }
                }] 
                : [],
            ...namespaceList 
                ? namespaceList.map( (namespace) =>  {
                        return {
                            referenceName: namespace,
                            requirement:{
                                "&&": [
                                    { "property": "params.tag", "=": namespace },
                                    { "property": "status", "=": "ACTIVE" }
                                ]
                            }
                        }
                    })    
                : []
        ]
    }
}

const CreateServiceTaskParams = ({ 
    typeMetadata, 
    itemMetadata, 
    metadataHierarchy 
}) => {
    const { 
        dependency, 
    } = itemMetadata
    
    const namespaceDependency = ExtractNamespaceFromDependency(itemMetadata.dependency, metadataHierarchy)

    const metadataDependency = ExtractMetadataFromMetadataByType({ 
        type: typeMetadata, 
        dependency:itemMetadata.dependency, 
        dependencyMetadata:FindMetadata(namespaceDependency, metadataHierarchy)
    })

    if(!metadataDependency){
        throw `A dependencia ${dependency} não foi encontrado`
    }
    
    if(metadataDependency && IsValidMetadata(itemMetadata, metadataDependency)){

        const { boundParams, params } = 
            ResolveAllParamsMetadata({
                boundParamsNames : metadataDependency["bound-params"],
                itemMetadata,
                boundParams      : RemapAllParams(itemMetadata["bound-params"]),
                params           : RemapAllParams(itemMetadata.params),
                metadataHierarchy
            })
     
        return MountParams({
            typeMetadata,
            namespace: itemMetadata.namespace,
            serviceParameterNames: [
                ...metadataDependency["params"] || [],
                ...metadataDependency["bound-params"] || []
            ],
            path: metadataDependency.path,
            boundParams,
            params,
            namespaceDependency
        })
    }
    return undefined   
}

module.exports = CreateServiceTaskParams
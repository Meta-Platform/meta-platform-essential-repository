const ExtractNamespaceFromDependency          = require("./ExtractNamespaceFromDependency")
const FindMetadata                            = require("./FindMetadata")
const ExtractMetadataFromMetadataByType       = require("./ExtractMetadataFromMetadataByType")
const IsValidMetadata                         = require("./IsValidMetadata")
const ConvertTypeTaskParamsToObjectLoaderType = require("./ConvertTypeTaskParamsToObjectLoaderType")
const RemapAllParams                          = require("./RemapAllParams")
const ResolveMetadataParams                   = require("./ResolveMetadataParams")
const ResolveMetadataBoundParamsNamespace     = require("./ResolveMetadataBoundParamsNamespace")
const ExtractNamespaceListByBoundParams       = require("./ExtractNamespaceListByBoundParams")

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
    bootServiceMetadata, 
    metadataHierarchy 
}) => {
    const { 
        dependency, 
    } = bootServiceMetadata
    
    const namespaceDependency = ExtractNamespaceFromDependency(bootServiceMetadata.dependency, metadataHierarchy)

    const metadataDependency = ExtractMetadataFromMetadataByType({ 
        type: typeMetadata, 
        dependency:bootServiceMetadata.dependency, 
        dependencyMetadata:FindMetadata(namespaceDependency, metadataHierarchy)
    })

    if(!metadataDependency){
        throw `A dependencia ${dependency} não foi encontrado`
    }
    
    if(
        metadataDependency 
        && IsValidMetadata(bootServiceMetadata, metadataDependency)
        ){
     
        return MountParams({
            typeMetadata,
            namespace: bootServiceMetadata.namespace,
            serviceParameterNames: [
                ...metadataDependency["params"] || [],
                ...metadataDependency["bound-params"] || []
            ],
            path: metadataDependency.path,
            boundParams : ResolveMetadataBoundParamsNamespace({
                boundParamsNames: metadataDependency["bound-params"],
                bootMetadata: bootServiceMetadata,
                boundParams: RemapAllParams(bootServiceMetadata["bound-params"])
            }),
            params: ResolveMetadataParams({
                params: RemapAllParams(bootServiceMetadata.params), 
                metadataHierarchy
            }),
            namespaceDependency
        })
    }
    return undefined   
}

module.exports = CreateServiceTaskParams
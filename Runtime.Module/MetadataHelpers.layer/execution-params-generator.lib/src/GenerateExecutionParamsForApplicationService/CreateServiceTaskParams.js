const ExtractNamespaceFromDependency          = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                            = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType       = require("./Commons/ExtractMetadataFromMetadataByType")
const ConvertTypeTaskParamsToObjectLoaderType = require("./Commons/ConvertTypeTaskParamsToObjectLoaderType")
const ExtractNamespaceListByBoundParams       = require("./Commons/ExtractNamespaceListByBoundParams")
const RemapAllParams                          = require("./Commons/RemapAllParams")
const ResolveMetadataParamsWithStartupParams  = require("./Commons/ResolveMetadataParamsWithStartupParams")
const ResolveMetadataBoundParamsNamespace     = require("./Commons/ResolveMetadataBoundParamsNamespace")

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

    const newServiceParameterNames = serviceParameterNames.map(paramName => paramName.charAt(0) === "?" ? paramName.slice(1) : paramName)

    return {
        objectLoaderType: ConvertTypeTaskParamsToObjectLoaderType(typeMetadata),
        staticParameters:{
            tag: namespace,
            ...params ? params : {},
            path,
            serviceParameterNames: newServiceParameterNames
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

        const boundParamsResolved = ResolveMetadataBoundParamsNamespace({ 
            boundParamsNames: metadataDependency["bound-params"],
            argBoundParams: itemMetadata["bound-params"],
            boundParams: RemapAllParams(itemMetadata["bound-params"])
        })

        const paramsResolved = ResolveMetadataParamsWithStartupParams({ 
            params: RemapAllParams(itemMetadata.params), 
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
            boundParams: boundParamsResolved,
            params: paramsResolved,
            namespaceDependency
        })
    }
    return undefined   
}

module.exports = CreateServiceTaskParams
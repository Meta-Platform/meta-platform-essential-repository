const ConvertTypeTaskParamsToObjectLoaderType = require("./Commons/ConvertTypeTaskParamsToObjectLoaderType")
const ExtractNamespaceListByBoundParams = require("./Commons/ExtractNamespaceListByBoundParams")

const CreateEndpointTaskParams = ({ 
    typeMetadata,
    url,
    type,
    boundParams,
    params,
    namespaceDependency
}) => {
    const namespaceList = boundParams && ExtractNamespaceListByBoundParams(boundParams)
    return {
        objectLoaderType: ConvertTypeTaskParamsToObjectLoaderType(typeMetadata),
        staticParameters:{
            url,
            type,
            ...params ? params : {}
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

module.exports = CreateEndpointTaskParams
const ConvertTypeTaskParamsToObjectLoaderType = require("./Commons/ConvertTypeTaskParamsToObjectLoaderType")
const ExtractNamespaceListByBoundParams = require("./Commons/ExtractNamespaceListByBoundParams")

const CreateEndpointTaskParams = ({
    typeMetadata,
    url,
    type,
    boundParams,
    params,
    namespaceDependency,
    ecosystemDefaults
}) => {
    const namespaceList = boundParams && ExtractNamespaceListByBoundParams(boundParams)
    return {
        objectLoaderType: ConvertTypeTaskParamsToObjectLoaderType(typeMetadata),
        staticParameters:{
            url,
            type,
            // Injeção do ecossistema em execução: o endpoint (webgui) recebe as
            // vars do ecosystem-defaults como BASE, sem o endpoint-group.json
            // declará-las. Params próprios (do host) prevalecem por cima.
            ...(ecosystemDefaults || {}),
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
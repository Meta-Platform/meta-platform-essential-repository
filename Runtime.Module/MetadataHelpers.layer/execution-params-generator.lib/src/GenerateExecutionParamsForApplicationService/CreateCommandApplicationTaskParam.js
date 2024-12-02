const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const ExtractNamespaceFromDependency    = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                      = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType = require("./Commons/ExtractMetadataFromMetadataByType")
const ExtractNamespaceListByBoundParams = require("./Commons/ExtractNamespaceListByBoundParams")
const ResolveAllParamsMetadata          = require("./Commons/ResolveAllParamsMetadata")

const ExtractRootData = (metadataHierarchy) => {
    const {
        metadata:rootMetadata,
        path:rootPath
    } = GetMetadataRootNode(metadataHierarchy)
    
    const { 
        boot:bootMetadata,
        "startup-params":startupParams,
        package: { namespace }
    } = rootMetadata

    return {
        namespace,
        rootPath,
        bootMetadata,
        startupParams,
    }
}

const FindBootExecutableMetadataByName = (name, executables) => 
    executables.find(({executableName}) => executableName === name)

const CreateCommandApplicationTaskParam = ({
    metadataHierarchy,
    executableName,
    commandLineArgs
}) => {

    const {
        namespace,
        rootPath,
        bootMetadata,
        startupParams,
    } = ExtractRootData(metadataHierarchy)

    const bootExecutableMetadata = 
        FindBootExecutableMetadataByName(executableName, bootMetadata.executables)

    const namespaceDependency = 
        ExtractNamespaceFromDependency(bootExecutableMetadata.dependency, metadataHierarchy)

    const metadataDependency = ExtractMetadataFromMetadataByType({ 
        dependency         : bootExecutableMetadata.dependency, 
        dependencyMetadata : FindMetadata(namespaceDependency, metadataHierarchy)
    })

    if(!metadataDependency){
        throw `A dependencia ${dependency} não foi encontrado`
    }

    const { boundParams, params } = 
        ResolveAllParamsMetadata({
            boundParamsNames : metadataDependency["bound-params"],
            itemMetadata     : bootExecutableMetadata,
            boundParams      : bootExecutableMetadata["bound-params"],
            params           : bootExecutableMetadata.params,
            metadataHierarchy
        })

    const namespaceList = boundParams && ExtractNamespaceListByBoundParams(boundParams)
    
    return {
        objectLoaderType: "command-application",
        "staticParameters": {
            startupParams,
            namespace,
            rootPath,
            commands: metadataDependency.commands,
            ...params ? params : {},
            executableName,
            commandLineArgs,
            commandParameterNames: [
                ...metadataDependency["params"] || [],
                ...metadataDependency["bound-params"] || []
            ]
        },
        "linkedParameters": {
            "nodejsPackageHandler": namespace, 
            ...boundParams ? boundParams : {}
        },
        "agentLinkRules":[
            {
                referenceName: namespace,
                requirement:{
                    "&&": [
                        { "property": "params.tag", "=": namespace },
                        { "property": "status", "=": "ACTIVE" }
                    ]
                }
            },
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


module.exports = CreateCommandApplicationTaskParam
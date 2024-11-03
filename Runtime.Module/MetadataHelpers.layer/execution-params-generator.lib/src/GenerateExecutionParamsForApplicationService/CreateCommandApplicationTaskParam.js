const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const ExtractNamespaceFromDependency      = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                        = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType   = require("./Commons/ExtractMetadataFromMetadataByType")
const ResolveMetadataParams               = require("./Commons/ResolveMetadataParams")
const ResolveMetadataBoundParamsNamespace = require("./Commons/ResolveMetadataBoundParamsNamespace")
const ExtractNamespaceListByBoundParams   = require("./Commons/ExtractNamespaceListByBoundParams")

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

    const [
        boundParams,
        params
    ] = [
        ResolveMetadataBoundParamsNamespace({
            boundParamsNames: metadataDependency["bound-params"],
            bootMetadata: bootExecutableMetadata,
            boundParams: bootExecutableMetadata["bound-params"]
        }),
        ResolveMetadataParams({
            params: bootExecutableMetadata.params,
            metadataHierarchy
        })
    ]

    const namespaceList = boundParams && ExtractNamespaceListByBoundParams(boundParams)

    return {
        objectLoaderType: "command-application",
        "staticParameters": {
            startupParams,
            namespace,
            rootPath,
            commands: bootMetadata.commands,
            executableName,
            commandLineArgs
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
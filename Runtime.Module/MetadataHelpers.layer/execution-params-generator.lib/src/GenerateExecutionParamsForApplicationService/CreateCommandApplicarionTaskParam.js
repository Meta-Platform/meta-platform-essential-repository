const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const ExtractNamespaceFromDependency    = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                      = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType = require("./Commons/ExtractMetadataFromMetadataByType")


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
        bootMetadata,
        startupParams,
    }
}

const FindBootExecutableMetadataByName = (name, executables) => 
    executables.find(({executableName}) => executableName === name)

const CreateCommandApplicarionTaskParam = ({
    metadataHierarchy,
    executableName,
    commandLineArgs
}) => {

    const {
        namespace,
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

    const [
        boundParams,
        params
    ] = [
        ResolveBoundParamsNamespace({
            endpointBoundParams: RemapAllParams(endpointMetadata["bound-params"]),
            metadataDependency,
            bootEndpointGroupMetadata
        }),
        ResolveParams({
            params: RemapAllParams(endpointMetadata.params),
            metadataHierarchy
        })
    ]
        
    debugger

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
            "nodejsPackageHandler": namespace
        },
        "agentLinkRules":[{
            referenceName: namespace,
            requirement:{
                "&&": [
                    { "property": "params.tag", "=": namespace },
                    { "property": "status", "=": "ACTIVE" }
                ]
            }
        }] 
    }
}


module.exports = CreateCommandApplicarionTaskParam
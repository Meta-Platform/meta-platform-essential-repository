import type { MetadataHierarchy } from "../../../dependency-graph-builder.lib/types/MetadataHierarchy"

const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const ExtractNamespaceFromDependency         = require("./Commons/ExtractNamespaceFromDependency")
const FindMetadata                           = require("./Commons/FindMetadata")
const ExtractMetadataFromMetadataByType      = require("./Commons/ExtractMetadataFromMetadataByType")
const ExtractNamespaceListByBoundParams      = require("./Commons/ExtractNamespaceListByBoundParams")
const ResolveMetadataBoundParamsNamespace    = require("./Commons/ResolveMetadataBoundParamsNamespace")
const ResolveMetadataParamsWithStartupParams = require("./Commons/ResolveMetadataParamsWithStartupParams")

const ExtractRootData = (metadataHierarchy: MetadataHierarchy) => {
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

const FindBootExecutableMetadataByName = (name: any, executables: any) => 
    executables.find(({executableName}: { executableName: string }) => executableName === name)

const CreateCommandApplicationTaskParam = ({
    metadataHierarchy,
    executableName,
    commandLineArgs
}: {
    metadataHierarchy: MetadataHierarchy
    executableName: string
    commandLineArgs: string
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
        // Era `${dependency}`, que não existe neste escopo: no caminho de erro
        // isso virava ReferenceError e escondia qual dependência faltou.
        throw `A dependencia ${bootExecutableMetadata.dependency} não foi encontrado`
    }

    const boundParamsResolved = ResolveMetadataBoundParamsNamespace({ 
        boundParamsNames: metadataDependency["bound-params"], 
        argBoundParams: bootExecutableMetadata["bound-params"], 
        boundParams: bootExecutableMetadata["bound-params"]
    })

    const paramsResolved = ResolveMetadataParamsWithStartupParams({ 
        params: bootExecutableMetadata.params,
        metadataHierarchy
    })

    const namespaceList = boundParamsResolved && ExtractNamespaceListByBoundParams(boundParamsResolved)
    
    return {
        objectLoaderType: "command-application",
        "staticParameters": {
            startupParams,
            namespace,
            rootPath,
            commands: metadataDependency.commands,
            ...paramsResolved ? paramsResolved : {},
            executableName,
            commandLineArgs,
            commandParameterNames: [
                ...metadataDependency["params"] || [],
                ...metadataDependency["bound-params"] || []
            ]
        },
        "linkedParameters": {
            "nodejsPackageHandler": namespace, 
            ...boundParamsResolved ? boundParamsResolved : {}
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
                ? namespaceList.map( (namespace: string) =>  {
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
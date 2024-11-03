const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

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
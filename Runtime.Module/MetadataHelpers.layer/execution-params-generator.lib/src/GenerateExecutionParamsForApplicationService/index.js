const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const CheckIfHaveBoot = require("./CheckIfHaveBoot")
const CheckIfHaveExecutables = require("./CheckIfHaveExecutables")
const CheckIfHaveChildren = require("./CheckIfHaveChildren")
const CreateChildren = require("./CreateChildren")

const CreateApplicationInstanceTaskParamWithBoot = ({
    startupParams,
    namespace,
    rootPath,
    bootMetadata,
    metadataHierarchy
}) => {
    return {
        objectLoaderType: "application-instance",
        "staticParameters": {
            startupParams,
            namespace,
            rootPath
        },
        ...CheckIfHaveChildren(bootMetadata)
            ? { children: CreateChildren(metadataHierarchy) }
            : {}
    }
}

const CreateCommandLineApplicationInstanceTaskParam = ({
    startupParams,
    namespace,
    executables,
    rootPath,
    executableName,
    commandLineArgs
}) => {
    return {
        objectLoaderType: "command-application",
        "staticParameters": {
            startupParams,
            namespace,
            executables,
            rootPath,
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

const GenerateExecutionParamsForApplicationService = ({
    metadataHierarchy, 
    executableName,
    commandLineArgs
}) => {

    if(CheckIfHaveBoot(metadataHierarchy) || (CheckIfHaveExecutables(metadataHierarchy) && executableName)){
        const {
            metadata:rootMetadata,
            path:rootPath
        } = GetMetadataRootNode(metadataHierarchy)
        
        const { 
            boot:bootMetadata,
            "startup-params":startupParams,
            package: { namespace, executables }
        } = rootMetadata

        const applicationInstanceTaskParam = 
            bootMetadata 
                ? CreateApplicationInstanceTaskParamWithBoot({
                        startupParams,
                        namespace,
                        rootPath,
                        bootMetadata,
                        metadataHierarchy
                    })
                : (CheckIfHaveExecutables(metadataHierarchy) && executableName && executables?.length > 0)
                    ? CreateCommandLineApplicationInstanceTaskParam({
                        startupParams,
                        namespace,
                        executables,
                        rootPath,
                        executableName,
                        commandLineArgs
                    })
                    : undefined
        return applicationInstanceTaskParam
    }
}

module.exports = GenerateExecutionParamsForApplicationService
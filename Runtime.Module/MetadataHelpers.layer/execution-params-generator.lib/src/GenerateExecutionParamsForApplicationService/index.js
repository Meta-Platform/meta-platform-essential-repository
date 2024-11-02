const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const CheckIfHaveBoot = require("./CheckIfHaveBoot")
const CheckIfHaveExecutables = require("./CheckIfHaveExecutables")

const CreateApplicationInstanceTaskParamWithBoot = require("./CreateApplicationInstanceTaskParamWithBoot")

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
            package: { namespace }
        } = rootMetadata

        const applicationInstanceTaskParam = 
            CreateApplicationInstanceTaskParamWithBoot({
                startupParams,
                namespace,
                rootPath,
                bootMetadata,
                metadataHierarchy, 
                executableName,
                commandLineArgs
            })

        return applicationInstanceTaskParam
    }
}

module.exports = GenerateExecutionParamsForApplicationService
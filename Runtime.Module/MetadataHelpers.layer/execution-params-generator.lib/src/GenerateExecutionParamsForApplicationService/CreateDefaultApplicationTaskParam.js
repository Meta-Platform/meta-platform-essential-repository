const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const CheckIfHaveChildren = require("./CheckIfHaveChildren")
const CreateChildren = require("./CreateChildren")

const CreateDefaultApplicationTaskParam = (metadataHierarchy) => {

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

module.exports = CreateDefaultApplicationTaskParam
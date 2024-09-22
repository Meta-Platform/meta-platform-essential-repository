const GetMetadataRootNode = require("../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const ExtractRootMetadata = (metadataHierarchy) => {
    const rootDependency = GetMetadataRootNode(metadataHierarchy)
    const { metadata } = rootDependency
    return metadata
}

module.exports = ExtractRootMetadata
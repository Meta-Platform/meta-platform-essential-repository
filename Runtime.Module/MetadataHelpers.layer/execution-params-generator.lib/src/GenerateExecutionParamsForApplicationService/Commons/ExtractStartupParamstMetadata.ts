import type { MetadataHierarchy } from "../../../../dependency-graph-builder.lib/types/MetadataHierarchy"

const GetMetadataRootNode = require("../../../../../../Runtime.Module/MetadataHelpers.layer/metadata-hierarchy-handler.lib/src/GetMetadataRootNode")

const ExtractStartupParamstMetadata = (metadataHierarchy: MetadataHierarchy) => {
    const rootDependency = GetMetadataRootNode(metadataHierarchy)
    const { metadata } = rootDependency
    return metadata["startup-params"]
}

module.exports = ExtractStartupParamstMetadata
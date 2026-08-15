import type { MetadataHierarchy } from "../../../dependency-graph-builder.lib/types/MetadataHierarchy"

const ConvertToProtoTasksParams = require("./ConvertToProtoTasksParams")

const CreateChildren = (metadataHierarchy: MetadataHierarchy) => {
    return [
        ...ConvertToProtoTasksParams({typeMetadata:"services", metadataHierarchy}),
        ...ConvertToProtoTasksParams({typeMetadata:"endpoints", metadataHierarchy}),
        ...ConvertToProtoTasksParams({typeMetadata:"windows", metadataHierarchy})
    ]
}

module.exports = CreateChildren
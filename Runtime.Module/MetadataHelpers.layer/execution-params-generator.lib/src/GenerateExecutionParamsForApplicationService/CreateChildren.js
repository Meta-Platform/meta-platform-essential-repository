const ConvertToProtoTasksParams = require("./ConvertToProtoTasksParams")

const CreateChildren = (metadataHierarchy) => {
    return [
        ...ConvertToProtoTasksParams({typeMetadata:"services", metadataHierarchy}),
        ...ConvertToProtoTasksParams({typeMetadata:"endpoints", metadataHierarchy})
    ]
}

module.exports = CreateChildren
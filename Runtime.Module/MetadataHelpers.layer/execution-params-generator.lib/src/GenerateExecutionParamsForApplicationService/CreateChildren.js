const ConvertToProtoTasksParams = require("./ConvertToProtoTasksParams")

const CreateChildren = (metadataHierarchy) => {
    return [
        ...ConvertToProtoTasksParams({typeMetadata:"services", metadataHierarchy}),
        ...ConvertToProtoTasksParams({typeMetadata:"endpoints", metadataHierarchy}),
        ...ConvertToProtoTasksParams({typeMetadata:"windows", metadataHierarchy})
    ]
}

module.exports = CreateChildren
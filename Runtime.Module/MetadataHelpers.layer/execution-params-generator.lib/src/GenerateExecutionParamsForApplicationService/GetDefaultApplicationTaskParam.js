const CheckIfHaveChildren = require("./CheckIfHaveChildren")
const CreateChildren = require("./CreateChildren")

const GetDefaultApplicationTaskParam = ({
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

module.exports = GetDefaultApplicationTaskParam
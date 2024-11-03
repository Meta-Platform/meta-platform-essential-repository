const CheckIfHaveChildren = require("./CheckIfHaveChildren")
const CreateChildren = require("./CreateChildren")

const CreateDefaultApplicationTaskParam = ({
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

module.exports = CreateDefaultApplicationTaskParam
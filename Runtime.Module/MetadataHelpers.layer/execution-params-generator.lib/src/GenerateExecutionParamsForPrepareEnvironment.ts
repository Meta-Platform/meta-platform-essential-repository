import type { MetadataHierarchy } from "../../dependency-graph-builder.lib/types/MetadataHierarchy"

const ExtractNamespaceAndPath = require("./Utils/ExtractNamespaceAndPath")

const GenerateExecutionParamsForPrepareEnvironment = ({
    metadataHierarchy, 
    environmentPath,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}: {
    metadataHierarchy: MetadataHierarchy
    environmentPath: string
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: any
}) => {
    const packageNamespaceAndPathList = ExtractNamespaceAndPath(metadataHierarchy)
    const executionParams = packageNamespaceAndPathList
        .map(({namespace, path}: { namespace: string, path: string }) => {
            return {
                "objectLoaderType": "install-nodejs-package-dependencies",
                "staticParameters": {
                    namespace,
                    path,
                    environmentPath,
                    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
                }
            }
        })
    return executionParams
}

module.exports = GenerateExecutionParamsForPrepareEnvironment
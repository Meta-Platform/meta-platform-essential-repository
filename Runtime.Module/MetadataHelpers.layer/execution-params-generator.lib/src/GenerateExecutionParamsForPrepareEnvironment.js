const ExtractNamespaceAndPath = require("./Utils/ExtractNamespaceAndPath")

const GenerateExecutionParamsForPrepareEnvironment = ({
    metadataHierarchy, 
    environmentPath,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}) => {
    const packageNamespaceAndPathList = ExtractNamespaceAndPath(metadataHierarchy)
    const executionParams = packageNamespaceAndPathList
        .map(({namespace, path}) => {
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
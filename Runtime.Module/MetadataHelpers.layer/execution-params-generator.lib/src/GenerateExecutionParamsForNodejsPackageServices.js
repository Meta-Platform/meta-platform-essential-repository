const ExtractNamespaceAndPath = require("./Utils/ExtractNamespaceAndPath")

const GenerateExecutionParamsForNodejsPackageServices = ({
    metadataHierarchy, 
    environmentPath,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}) => {
    const _RemapNamespaceToTag = ({ namespace, path }) => ({tag:namespace, path, environmentPath})
    const _ConvertParamsToLaunchTaskParams = ({
        tag,
        path,
        environmentPath
    }) => {

        return { 
            objectLoaderType:"nodejs-package", 
            staticParameters:{
                tag,
                path,
                environmentPath,
                EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
            },
            activationRules:{
                "&&": [
                    {
                        "property": "params.namespace",
                        "=": tag
                    },
                    {
                        "property": "status",
                        "=": "FINISHED"
                    }
                ]
            }
        }
    }

    return ExtractNamespaceAndPath(metadataHierarchy)
        .map(_RemapNamespaceToTag)
        .map(_ConvertParamsToLaunchTaskParams)
}

module.exports = GenerateExecutionParamsForNodejsPackageServices
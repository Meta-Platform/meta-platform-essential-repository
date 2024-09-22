
const GenerateExecutionParamsForNodejsPackageServices = require("./GenerateExecutionParamsForNodejsPackageServices")
const GenerateExecutionParamsForApplicationService    = require("./GenerateExecutionParamsForApplicationService")
const GenerateExecutionParamsForPrepareEnvironment    = require("./GenerateExecutionParamsForPrepareEnvironment")

const TranslateMetadataHierarchyForExecutionParams = ({
    metadataHierarchy, 
    environmentPath, 
    commandLineArgs,
    executableName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}) => {

    const [
        prepareEnvironmentExecutionParams,
        nodePackageServiceExecutionParams,
        applicationServiceExecutionParam
    ] = [
        GenerateExecutionParamsForPrepareEnvironment({
            metadataHierarchy, 
            environmentPath,
            EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
        }),
        GenerateExecutionParamsForNodejsPackageServices({
            metadataHierarchy, 
            environmentPath,
            EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
        }),
        GenerateExecutionParamsForApplicationService({
            metadataHierarchy, 
            commandLineArgs,
            executableName
        })
    ]

    return [ 
        ...prepareEnvironmentExecutionParams,
        ...nodePackageServiceExecutionParams,
        ...applicationServiceExecutionParam
            ? [ applicationServiceExecutionParam ]
            : []
    ]
}

module.exports = TranslateMetadataHierarchyForExecutionParams
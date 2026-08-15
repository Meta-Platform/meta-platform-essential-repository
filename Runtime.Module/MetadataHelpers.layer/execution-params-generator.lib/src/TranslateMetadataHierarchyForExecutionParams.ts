import type { MetadataHierarchy } from "../../dependency-graph-builder.lib/types/MetadataHierarchy"


const GenerateExecutionParamsForNodejsPackageServices = require("./GenerateExecutionParamsForNodejsPackageServices")
const GenerateExecutionParamsForApplicationService    = require("./GenerateExecutionParamsForApplicationService")
const GenerateExecutionParamsForPrepareEnvironment    = require("./GenerateExecutionParamsForPrepareEnvironment")

const TranslateMetadataHierarchyForExecutionParams = ({
    metadataHierarchy, 
    environmentPath, 
    commandLineArgs,
    executableName,
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES
}: {
    metadataHierarchy: MetadataHierarchy
    environmentPath: string
    commandLineArgs: string
    executableName: string
    EXECUTIONDATA_CONF_DIRNAME_DEPENDENCIES: any
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
import type { MetadataHierarchy } from "../../../../dependency-graph-builder.lib/types/MetadataHierarchy"

const GetPopulatedParameters = require("../../Utils/GetPopulatedParameters")
const ExtractStartupParamstMetadata = require("./ExtractStartupParamstMetadata")

const ResolveMetadataParamsWithStartupParams = ({
    params,
    metadataHierarchy
}: {
    params: any
    metadataHierarchy: MetadataHierarchy
}) => {
    
    if(params){
        const startupParamsMetadata = ExtractStartupParamstMetadata(metadataHierarchy)
        const processedParams = GetPopulatedParameters(params, startupParamsMetadata)
        return processedParams
    }
    return {}
    
}

module.exports = ResolveMetadataParamsWithStartupParams
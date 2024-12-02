const GetPopulatedParameters = require("../../Utils/GetPopulatedParameters")
const ExtractStartupParamstMetadata = require("./ExtractStartupParamstMetadata")

const ResolveMetadataParamsWithStartupParams = ({
    params,
    metadataHierarchy
}) => {
    
    if(params){
        const startupParamsMetadata = ExtractStartupParamstMetadata(metadataHierarchy)
        const processedParams = GetPopulatedParameters(params, startupParamsMetadata)
        return processedParams
    }
    return {}
    
}

module.exports = ResolveMetadataParamsWithStartupParams
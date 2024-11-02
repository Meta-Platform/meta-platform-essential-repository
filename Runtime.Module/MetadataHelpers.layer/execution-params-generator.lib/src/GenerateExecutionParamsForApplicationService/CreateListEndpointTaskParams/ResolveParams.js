const GetPopulatedParameters = require("../../Utils/GetPopulatedParameters")
const ExtractStartupParamstMetadata = require("../Commons/ExtractStartupParamstMetadata")

const ResolveParams = ({
    params,
    metadataHierarchy
}) => {

    const startupParamsMetadata = ExtractStartupParamstMetadata(metadataHierarchy)
    const processedParams = GetPopulatedParameters(params, startupParamsMetadata)
    return processedParams
    
}

module.exports = ResolveParams
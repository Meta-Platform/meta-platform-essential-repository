const GetPopulatedParameters = require("../Utils/GetPopulatedParameters")
const ExtractStartupParamstMetadata = require("./ExtractStartupParamstMetadata")

const ResolveMetadataParams = ({ params, metadataHierarchy }) => {
    const startupParamsMetadata = ExtractStartupParamstMetadata(metadataHierarchy)
    const processedParams = GetPopulatedParameters(params, startupParamsMetadata)
    return processedParams
}

module.exports = ResolveMetadataParams
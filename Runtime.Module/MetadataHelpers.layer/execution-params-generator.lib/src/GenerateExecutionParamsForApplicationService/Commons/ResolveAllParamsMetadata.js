const ResolveMetadataParams               = require("./ResolveMetadataParams")
const ResolveMetadataBoundParamsNamespace = require("./ResolveMetadataBoundParamsNamespace")

const ResolveAllParamsMetadata = ({
    boundParamsNames,
    itemMetadata,
    boundParams,
    params,
    metadataHierarchy
}) => {
    debugger
    const retorno = {
        boundParams: ResolveMetadataBoundParamsNamespace({ boundParamsNames, itemMetadata, boundParams }),
        params: ResolveMetadataParams({ params, metadataHierarchy })
    }
    
    return retorno
}

module.exports = ResolveAllParamsMetadata
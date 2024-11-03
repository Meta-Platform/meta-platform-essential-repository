const CheckParamsIsValid = require("../Commons/CheckParamsIsValid")

const IsValidMetadata = (metadataArg, metadataParams) => {

    const _IsParamsValid = () => {
        const { params } = metadataArg
        const { params:paramsDependency } = metadataParams

        if(paramsDependency){
            return CheckParamsIsValid(params, paramsDependency)
        }
        return true
    }

    const _IsBoundParamsValid = () => {
        const { "bound-params":boundParams } = metadataArg
        const { "bound-params":boundParamsDependency } = metadataParams

        if(boundParamsDependency){
            return CheckParamsIsValid(boundParams, boundParamsDependency)
        }
        return true
    }

    return _IsParamsValid() && _IsBoundParamsValid()
}


module.exports = IsValidMetadata
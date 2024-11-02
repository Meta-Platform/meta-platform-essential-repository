const CheckParamsIsValid = require("../Commons/CheckParamsIsValid")

const IsValid = ({
    metadata, 
    metadataDependency
}) => {

    const _IsParamsValid = () => {
        const { params } = metadata
        const { params:paramsDependency } = metadataDependency

        if(paramsDependency){
            return CheckParamsIsValid(params, paramsDependency)
        }
        return true
    }

    const _IsBoundParamsValid = () => {
        const { "bound-params":boundParams } = metadata
        const { "bound-params":boundParamsDependency } = metadataDependency

        if(boundParamsDependency){
            return CheckParamsIsValid(boundParams, boundParamsDependency)
        }
        return true
    }

    return _IsParamsValid() && _IsBoundParamsValid()
}

module.exports = IsValid

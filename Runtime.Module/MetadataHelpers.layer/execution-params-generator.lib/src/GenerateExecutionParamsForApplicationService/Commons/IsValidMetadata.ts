const CheckParamsIsValid = require("../Commons/CheckParamsIsValid")

const IsValidMetadata = (metadataArg: any, metadataParams: any) => {

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

    try{
        return _IsParamsValid() && _IsBoundParamsValid()
    } catch(e){

        throw `Erro na depêndencia ${metadataArg.dependency}: "${e}"`
    }
}


module.exports = IsValidMetadata
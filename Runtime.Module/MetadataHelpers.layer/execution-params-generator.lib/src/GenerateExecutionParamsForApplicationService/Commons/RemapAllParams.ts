
//TODO Melhorar remap, como deep remap
const RemapAllParams = (params: any) => {
    if(params) {
        const remappedParams =  {
            ...params["api-template"]
                ? {
                        apiTemplate: params["api-template"]
                    }
                : {},
            ...params["controller-params"]
                ? {
                    controllerParams: params["controller-params"]
                }
                : {}
        }
    
        const remainingParams = Object
        .keys(params)
        .filter((property: any) => {
            return property !== "api-template" 
            && property !== "controller-params" 
        })
        .reduce((paramsAcc: any, property: any) => ({...paramsAcc, [property]:params[property]}), {})
        return { ...remappedParams, ...remainingParams}
    }

    return {}
    
}

module.exports = RemapAllParams
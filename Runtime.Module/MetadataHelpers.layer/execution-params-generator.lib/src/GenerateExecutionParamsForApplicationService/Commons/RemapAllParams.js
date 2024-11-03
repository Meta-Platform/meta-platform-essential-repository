const RemapAllParams = (params) => {
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
        .filter((property) => {
            return property !== "api-template" 
            && property !== "controller-params" 
        })
        .reduce((paramsAcc, property) => ({...paramsAcc, [property]:params[property]}), {})
        return { ...remappedParams, ...remainingParams}
    }

    return {}
    
}

module.exports = RemapAllParams
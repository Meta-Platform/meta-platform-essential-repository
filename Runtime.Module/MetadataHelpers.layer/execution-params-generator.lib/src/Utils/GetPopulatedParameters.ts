const ApplyParamsByString = require("./ApplyParamsByString")
const GetPopulatedArrayParameters = require("./GetPopulatedArrayParameters")

const TryGetValue = (value: any, params: any) => {
    return params[value]
}

const IsHandlebar = (value: any) => value.indexOf("{{") === 0

const GetPopulatedParameters = (object: any, params: any): any => {
    if(Array.isArray(object)){
        return GetPopulatedArrayParameters(object, params)
    } else {
        return Object
        .keys(object)
        .reduce((acc: any, key: any) => {
            const value = object[key]
            if  (typeof value === 'string' || value instanceof String) {
                return {
                    ...acc, 
                    [key]: TryGetValue(value, params) || (IsHandlebar(value) && ApplyParamsByString(value, params)) || value
                }
            } else if(Array.isArray(value)) {
                return {
                    ...acc, 
                    [key]: GetPopulatedArrayParameters(value, params)
                }
            } else if(typeof value === 'object') {
                return {
                    ...acc, 
                    [key]: GetPopulatedParameters(value, params)
                }
            } else {
                return {
                    ...acc, 
                    [key]: value
                }
            }
        }, {})
    }
}

module.exports = GetPopulatedParameters
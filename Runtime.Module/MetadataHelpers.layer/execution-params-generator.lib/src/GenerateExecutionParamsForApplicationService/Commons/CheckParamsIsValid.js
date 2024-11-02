const CheckParamsIsValid = (params, listParamsName) => {
    if(params){
        const isValid = listParamsName
        .reduce((returnAcc, paramName) => {
            const isValid = (returnAcc && !!params[paramName]) || paramName.charAt(0) === "?"
            if(!isValid){
                throw `O parametro "${paramName}" não foi encontrado`
            }
            return isValid
        }, true)
        return isValid
    }
    return true    
}

module.exports = CheckParamsIsValid
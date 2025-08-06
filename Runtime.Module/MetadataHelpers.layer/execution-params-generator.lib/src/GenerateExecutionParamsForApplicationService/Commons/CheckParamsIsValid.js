const CheckParamsIsValid = (params, listParamsName) => {
    if(listParamsName && listParamsName.length){
        const isValid = listParamsName
        .reduce((returnAcc, paramName) => {
            const erroMessage =  `O parâmetro [${paramName}] não foi encontrado!`
            if(!params) {
                if(paramName.charAt(0) === "?"){
                    return returnAcc && true
                } else throw erroMessage
            }
            const isValid = (returnAcc && !!params[paramName]) || paramName.charAt(0) === "?"
            if(!isValid) throw erroMessage
            return isValid
        }, true)
        return isValid
    }
    return true    
}

module.exports = CheckParamsIsValid
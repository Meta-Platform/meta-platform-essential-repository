const ResolveParamsByString = require("./ResolveParamsByString")
const GetPopulatedArrayParameters = require("./GetPopulatedArrayParameters")

/* `hasOwnProperty` e não `params[nome]`: a pergunta é "o param existe", não "o
 * param é verdadeiro". Um default que valha "", 0 ou false é um valor declarado
 * como qualquer outro. E a busca pelo protótipo faria um valor "constructor" ou
 * "toString" resolver numa função do Object. */
const HasParam = (params: any, name: any) => {
    return params !== null
        && params !== undefined
        && Object.prototype.hasOwnProperty.call(params, name)
}

const IsHandlebar = (value: any) => value.indexOf("{{") === 0

/* Três situações que o encadeamento de `||` confundia numa só:
 *   1. o valor é o nome de um param             -> o valor do param, mesmo falsy
 *   2. o template resolve (inclusive para vazio) -> o texto resolvido
 *   3. o template não resolve                   -> o literal, intocado
 * O caso 3 não é desistência: o {{VAR}} segue adiante inteiro para que outra
 * camada da hierarquia — ou o próprio pacote, no seu startup-params — ainda
 * possa respondê-lo. Era esse fallback que o `|| value` garantia, e é ele que
 * roubava o caso 2 quando o valor herdado era vazio. */
const GetPopulatedStringParameter = (value: any, params: any) => {

    if(HasParam(params, value)){
        return params[value]
    }

    if(IsHandlebar(value)){
        const resolution = ResolveParamsByString(value, params)
        if(resolution.resolved){
            return resolution.value
        }
    }

    return value
}

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
                    [key]: GetPopulatedStringParameter(value, params)
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

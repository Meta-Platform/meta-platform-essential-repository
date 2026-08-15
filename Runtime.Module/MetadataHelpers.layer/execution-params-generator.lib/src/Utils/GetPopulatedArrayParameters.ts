const GetPopulatedParameters = require("./GetPopulatedParameters")

const GetPopulatedArrayParameters = (array: any, params: any) => {
    return array.map((item: any) => {
        return GetPopulatedParameters(item, params)
    })
}

module.exports = GetPopulatedArrayParameters
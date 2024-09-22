const GetPopulatedParameters = require("./GetPopulatedParameters")

const GetPopulatedArrayParameters = (array, params) => {
    return array.map((item) => {
        return GetPopulatedParameters(item, params)
    })
}

module.exports = GetPopulatedArrayParameters
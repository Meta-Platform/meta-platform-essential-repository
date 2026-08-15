const SmartRequire = require("../../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")
const Handlebars = SmartRequire('handlebars')

const ApplyParamsByString = (source: any, metadata: any) => {
    const pathTemplate = Handlebars.compile(source)
    const path = pathTemplate(metadata)
    return path
}

module.exports = ApplyParamsByString
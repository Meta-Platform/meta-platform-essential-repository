const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const Table = SmartRequire("cli-table3")

const CreateAttributeTable = ({colWidths, wordWrap}) => 
    new Table({
        colWidths,
        wordWrap
    })

module.exports = CreateAttributeTable
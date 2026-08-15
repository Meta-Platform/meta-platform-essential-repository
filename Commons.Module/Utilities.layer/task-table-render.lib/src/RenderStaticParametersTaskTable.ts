import type { StaticParameters } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"
import type { CreateAttributeTableFn } from "./Types"

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const colors = SmartRequire("colors")
const CreateAttributeTable = require("./CreateAttributeTable") as CreateAttributeTableFn

const RenderStaticParametersTaskTable = async (staticParameters: StaticParameters): Promise<void> => {

    const table = CreateAttributeTable({
        colWidths: [40, 100],
        wordWrap: true
    })
    table.push([{ colSpan: 2, hAlign: 'center', content: colors.bold('Static Parameters') }])
    const paramNameList = Object.keys(staticParameters)
    paramNameList
    .forEach((paramName) => {
        table
        .push([{ vAlign:"center", hAlign: 'right', content: colors.bold.blue(paramName) }, colors.yellow(JSON.stringify(staticParameters[paramName], null, 4))])
    })
    Log.message("RenderStaticParametersTaskTable", table.toString())
}

module.exports = RenderStaticParametersTaskTable

import type { LinkedParameters } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"
import type { CreateAttributeTableFn } from "./Types"

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const colors = SmartRequire("colors")
const CreateAttributeTable = require("./CreateAttributeTable") as CreateAttributeTableFn

const RenderLinkedParametersTaskTable = async (linkedParameters: LinkedParameters): Promise<void> => {

    const table = CreateAttributeTable({
        colWidths: [45, 80]
    })
    table.push([{ colSpan: 2, hAlign: 'center', content: colors.bold('Linked Parameters') }])
    const paramNameList = Object.keys(linkedParameters)
    paramNameList
    .forEach((paramName) => {
        table
        .push([{ vAlign:"center", hAlign: 'right', content: colors.bold.blue(paramName) }, colors.yellow(JSON.stringify(linkedParameters[paramName], null, 4))])
    })
    Log.message("RenderLinkedParametersTaskTable", table.toString())
}
module.exports = RenderLinkedParametersTaskTable

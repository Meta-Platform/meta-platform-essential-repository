import type { Rule, RuleSet } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"
import type { CreateAttributeTableFn, TableCell } from "./Types"

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const colors = SmartRequire("colors")
const CreateAttributeTable = require("./CreateAttributeTable") as CreateAttributeTableFn

const RenderActivationRulesTaskTable = async (activationRules: RuleSet): Promise<void> => {

    const table = CreateAttributeTable({
        colWidths: [50]
    })
    table.push([{ hAlign: 'center', content: colors.bold('Activation Rules') }])
    const boolOperators = Object.keys(activationRules)
    const _RenderRuleRow = (rule: Rule) => {
        const operator = Object.keys(rule).filter((ruleField) => ruleField !== "property")[0]
        const content = `${ colors.cyan(rule.property)} ${ colors.bold.magenta(operator)} ${ colors.gray(rule[operator])}`
        const ruleColumn: TableCell = { hAlign: 'center', content }
        table.push([ruleColumn])
    }
    boolOperators
    .forEach((operator) => {
        const rules = activationRules[operator]
        rules.forEach((rule, ruleIndex) => {
            _RenderRuleRow(rule)
            if(ruleIndex < rules.length - 1){
                table.push([{ hAlign: 'center', content: colors.bold.magenta(operator) }])
            }
        })
    })
    Log.message("RenderActivationRulesTaskTable", table.toString())
}

module.exports = RenderActivationRulesTaskTable

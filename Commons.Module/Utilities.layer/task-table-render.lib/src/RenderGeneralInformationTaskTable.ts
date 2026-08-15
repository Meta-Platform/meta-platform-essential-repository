import type { TaskInformation } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"
import type { CreateAttributeTableFn, GetColorLogByStatusFn } from "./Types"

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const colors = SmartRequire("colors")
const CreateAttributeTable = require("./CreateAttributeTable") as CreateAttributeTableFn
const GetColorLogByStatus = require("./GetColorLogByStatus") as GetColorLogByStatusFn

type PropertyRow = {
    label: string
    property: keyof TaskInformation
    formatter?: (value: any) => string
}

const RenderGeneralInformationTaskTable = async (taskData: TaskInformation): Promise<void> => {

    const table = CreateAttributeTable({
        colWidths: [25, 40]
    })
    table.push([{ colSpan: 2, hAlign: 'center', content: colors.bold('General Information') }])
    const propertiesMap: PropertyRow[] = [
        {
            label: "Task ID",
            property: "taskId"
        },
        ...taskData.pTaskId
            ? [
                {
                    label: "Parent Task ID",
                    property: "pTaskId" as const
                }
            ]
            : [],
        {
            label: "Status",
            property: "status",
            formatter: (status) => colors[GetColorLogByStatus(status)](status)
        },
        {
            label: "Object Loader Type",
            property: "objectLoaderType"
        },
        {
            label: "has child tasks",
            property: "hasChildTasks"
        }
    ]
    propertiesMap
    .forEach(({label, property, formatter}) => {
        table
        .push([
            { hAlign: 'right', content: colors.bold.red(label) },
            formatter ? formatter(taskData[property]) : colors.yellow(taskData[property])
        ])
    })
    Log.message("RenderGeneralInformationTaskTable", table.toString())
}

module.exports = RenderGeneralInformationTaskTable

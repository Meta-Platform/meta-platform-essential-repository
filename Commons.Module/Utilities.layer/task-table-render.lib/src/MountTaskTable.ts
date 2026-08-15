import type { Task } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"
import type { AttributeTable, GetColorLogByStatusFn } from "./Types"

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const Table = SmartRequire("cli-table3")
const colors = SmartRequire("colors")
const { basename } = require("path") as typeof import("path")

const GetColorLogByStatus = require("./GetColorLogByStatus") as GetColorLogByStatusFn

const MountTaskTable = async (taskList: Task[]): Promise<AttributeTable> => {


    const table = new Table({
        head: [
            'TID',
            'PTID',
            'Loader Type',
            'Status',
            'Namespace / Tag',
            'Path / API & Controller'
        ],
        colWidths: [5, 6, 14, 12, 30, 30]
    })

    taskList.forEach(task => {
        const {
            taskId,
            pTaskId,
            objectLoaderType,
            status,
            staticParameters: {
                namespace,
                tag,
                path,
                type,
                url,
                apiTemplate,
                controller,
                serverEndpointStatus,
                serverName,
                rootPath
            }
        } = task
        table.push([
            taskId,
            pTaskId,
            objectLoaderType,
            colors[GetColorLogByStatus(status)](status),
            namespace || tag || url && (`${type} -> ${url}`),
            path && basename(path) || apiTemplate && `${apiTemplate}\n${controller}` || serverName && `${serverName}\n${serverEndpointStatus}` || rootPath
        ])
    })

    return table
}

module.exports = MountTaskTable

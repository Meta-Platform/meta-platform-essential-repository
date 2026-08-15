import type { Task, TaskStatus, StaticParameters } from "../../../../Runtime.Module/Executor.layer/task-executor.lib/types/Task"

export type FormattedTask = {
    taskId: number
    pTaskId?: number
    objectLoaderType: string
    status: TaskStatus
    statusReason?: string
    staticParameters: StaticParameters
}

const FormatTaskForOutput = (task: Task): FormattedTask => {
    return {
        taskId: task.taskId,
        pTaskId: task.pTaskId,
        objectLoaderType: task.objectLoaderType,
        status: task.status,
        ...task.statusReason ? { statusReason: task.statusReason } : {},
        staticParameters: task.staticParameters
    }
}

module.exports = FormatTaskForOutput

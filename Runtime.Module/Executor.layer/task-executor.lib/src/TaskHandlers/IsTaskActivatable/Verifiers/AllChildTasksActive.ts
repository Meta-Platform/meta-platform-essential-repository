import type { Task, TaskStatus } from "../../../../types/Task"

const TaskStatusTypes = require("../../../TaskStatusTypes")
const GetChildTasks = require("../GetChildTasks")

const VerifyAllChildTasksActive = (taskStateManager: any, taskId: number) => {
    const taskList = GetChildTasks(taskStateManager, taskId)
    const activeTasks = taskList.filter(({ status }: { status: TaskStatus }) => status === TaskStatusTypes.ACTIVE )
    if(taskList.length > 0 && taskList.length === activeTasks.length){
        return true
    }
    return false
}

module.exports = VerifyAllChildTasksActive
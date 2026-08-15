const GetChildTasks = (taskStateManager: any, taskId: number) =>
    taskStateManager
    .ListTasks()
    .filter(({ pTaskId }: { pTaskId: number }) => pTaskId === taskId)

module.exports = GetChildTasks
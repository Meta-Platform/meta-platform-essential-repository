const GetChildTasks = (taskStateManager, taskId) =>
    taskStateManager
    .ListTasks()
    .filter(({ pTaskId }) => pTaskId === taskId)

module.exports = GetChildTasks
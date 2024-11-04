const { describe, before, it } = require('node:test')
const assert = require('node:assert').strict

const TaskStatusTypes = require("../src/TaskStatusTypes")

const MinimumTaskLoader = (params, executorCommandChannel) => {

    const Start = () => 
        executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)

    const Stop = () =>
        executorCommandChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
    
    executorCommandChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorCommandChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => {}
}


const TaskExecutor = require("../src/TaskExecutor")
let taskExecutor

describe("Task Executor test", () => {

    before(() => {
        taskExecutor = TaskExecutor({
            taskLoaders: {
                "minimum-task-loader": MinimumTaskLoader
            }
        })
    })

    it('should throw an exception when trying to create an empty task', () => {
        assert.throws(() => {
            taskExecutor.CreateTask({})
        }, {
            name: 'Error',
            message: "The Execution Params cannot be empty"
        })
    })

    it('should throw an exception when trying to create a task with Task Loader not loaded', () => {
        assert.throws(() => {
            taskExecutor.CreateTask({
                objectLoaderType: "invalid-task-loader"
            })
        }, {
            name: 'Error',
            message: "Task Loader was not found"
        })
    })


    it('should successfully create a task and emit the correct sequence of events', () => {

        const TASK_LOADER_NAME = "minimum-task-loader"

        const sequencExpectedEvents = [
            'AWAITING_PRECONDITIONS', 
            'PRECONDITIONS_COMPLETED', 
            'PREPPED_TO_START', 
            'ACTIVE'
        ]

        return new Promise((resolve, reject) => {
            let eventIndex = 0
            taskExecutor
                .AddTaskStatusListener(({
                    taskId,
                    status
                }) => {
                    try {
                        assert.strictEqual(status, sequencExpectedEvents[eventIndex], `Expected status ${sequencExpectedEvents[eventIndex]} but got ${status}`)
                        assert.strictEqual(taskId, 0, `Expected parameter 0 but got ${taskId}`)
                        eventIndex++
                        if (eventIndex === sequencExpectedEvents.length) {
                            resolve()
                        }
                    } catch (error) {
                        reject(error)
                    }
                })

            taskExecutor.CreateTask({
                objectLoaderType: TASK_LOADER_NAME
            })
        })
    })





    //Testar Hierarquia de tarefas
    //Testar parada de tarefas
    //Testar falha de tarefas
    //Testar passagem de parametros estatica
    //Testar passagem de parametros vinculado
    //

})
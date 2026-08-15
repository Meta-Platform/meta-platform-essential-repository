const CommandChannelEventTypes = Object.freeze({
    CHANGE_TASK_STATUS : Symbol(),
    STOP_ALL_TASKS     : Symbol(),
    START_TASK         : Symbol(),
    STOP_TASK          : Symbol()
})

module.exports = CommandChannelEventTypes
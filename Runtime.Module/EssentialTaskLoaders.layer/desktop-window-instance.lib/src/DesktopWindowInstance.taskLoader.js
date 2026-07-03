const fs = require("fs")
const { join } = require("path")

const TaskStatusTypes          = require("../../../Executor.layer/task-executor.lib/src/TaskStatusTypes")
const CommandChannelEventTypes = require("../../../Executor.layer/task-executor.lib/src/CommandChannelEventTypes")

const OpenElectronWindow = require("./OpenElectronWindow")

// Ícone da janela: convenção de icon.svg na raiz do package (rootPath).
const ResolveIconPath = (rootPath) => {
    if(!rootPath) return undefined
    const candidate = join(rootPath, "icon.svg")
    return fs.existsSync(candidate) ? candidate : undefined
}

const DesktopWindowInstanceTaskLoader = (loaderParams, executorChannel) => {

    let windowProcess
    let wasStopped = false
    let isProcessExitScheduled = false

    const {
        url,
        file,
        rootPath,
        title,
        width,
        height
    } = loaderParams

    const ScheduleProcessExit = () => {
        if(isProcessExitScheduled) return
        isProcessExitScheduled = true
        setTimeout(() => process.exit(0), 100)
    }

    const Start = () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        try{
            windowProcess = OpenElectronWindow({ url, file, rootPath, title, width, height, iconPath: ResolveIconPath(rootPath) })

            windowProcess.on("exit", () => {
                windowProcess = undefined
                executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
                if(!wasStopped)
                    executorChannel.emit(CommandChannelEventTypes.STOP_ALL_TASKS)
                ScheduleProcessExit()
            })

            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.ACTIVE)
        }catch(e){
            console.error(e)
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.FAILURE)
        }
    }

    const Stop = () => {
        wasStopped = true
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STOPPING)
        if(windowProcess){
            windowProcess.kill()
        } else {
            executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.TERMINATED)
            ScheduleProcessExit()
        }
    }

    executorChannel.on(CommandChannelEventTypes.START_TASK, Start)
    executorChannel.on(CommandChannelEventTypes.STOP_TASK, Stop)

    return () => windowProcess
}

module.exports = DesktopWindowInstanceTaskLoader

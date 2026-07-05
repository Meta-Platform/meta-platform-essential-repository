const fs = require("fs")
const os = require("os")
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

// Extrai os caminhos de um handle nodejs-package (resolvido de um bound-param).
const _HandlePaths = (handle) => ({
    src:         handle.getSourcePath(),
    nodeModules: handle.getNodeModulesPath()
})

// Modo GUI-host: a janela Electron NÃO carrega uma URL HTTP — o processo
// principal do Electron compila o webgui e hospeda os services por IPC. Como só
// strings cruzam o spawn, serializamos os caminhos (lidos dos handles de pacote
// resolvidos como bound-params) + params escalares num JSON temporário e
// passamos o caminho dele via env (DESKTOP_GUI_CONFIG_PATH).
const _BuildGuiConfig = (p) => ({
    window: {
        title:    p.title,
        width:    p.width,
        height:   p.height,
        iconPath: ResolveIconPath(p.rootPath)
    },
    webgui: {
        context:                   p.homeScreenWebgui.getSourcePath(),
        entrypoint:                "index.tsx",
        htmlTemplate:              "index.html",
        environmentPath:           p.homeScreenWebgui.getEnvironmentPath(),
        nodeModules:               p.homeScreenWebgui.getNodeModulesPath(),
        serverAppName:             p.serverName,
        RT_ENV_GENERATED_DIR_NAME: p.RT_ENV_GENERATED_DIR_NAME
    },
    services: {
        desktopGui:                 _HandlePaths(p.desktopGuiService),
        executionManagerWebservice: _HandlePaths(p.executionManagerWebservice),
        repositoryManager:          _HandlePaths(p.repositoryManagerService),
        ecosystemControlPanel:      _HandlePaths(p.ecosystemControlPanelService)
    },
    libs: {
        jsonFileUtilities:         _HandlePaths(p.jsonFileUtilitiesLib),
        ecosystemInstallUtilities: _HandlePaths(p.ecosystemInstallUtilitiesLib),
        repositoryUtilities:       _HandlePaths(p.repositoryUtilitiesLib),
        dependencyGraphBuilder:    _HandlePaths(p.dependencyGraphBuilderLib)
    },
    params: {
        installDataDirPath:                p.installDataDirPath,
        panelStateFilePath:                p.panelStateFilePath,
        ecosystemDefaultsFileRelativePath: p.ecosystemDefaultsFileRelativePath,
        REPOS_CONF_FILENAME_REPOS_DATA:    p.REPOS_CONF_FILENAME_REPOS_DATA,
        REPOS_CONF_EXT_MODULE_DIR:         p.REPOS_CONF_EXT_MODULE_DIR,
        REPOS_CONF_EXT_LAYER_DIR:          p.REPOS_CONF_EXT_LAYER_DIR,
        REPOS_CONF_EXT_GROUP_DIR:          p.REPOS_CONF_EXT_GROUP_DIR,
        REPOS_CONF_EXTLIST_PKG_TYPE:       p.REPOS_CONF_EXTLIST_PKG_TYPE,
        PKG_CONF_DIRNAME_METADATA:         p.PKG_CONF_DIRNAME_METADATA
    }
})

const _WriteGuiConfigFile = (config, serverName) => {
    const safeName = String(serverName || "gui").replace(/[^a-zA-Z0-9._-]/g, "_")
    const configPath = join(os.tmpdir(), `meta-gui-config-${safeName}-${process.pid}.json`)
    fs.writeFileSync(configPath, JSON.stringify(config), "utf8")
    return configPath
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
        height,
        // Bound-param que marca o modo GUI-host (resolvido para o handle do
        // pacote desktop-gui.service). Quando presente, a janela hospeda os
        // services por IPC em vez de carregar uma URL HTTP.
        desktopGuiService
    } = loaderParams

    const isGuiHost = Boolean(desktopGuiService)

    const ScheduleProcessExit = () => {
        if(isProcessExitScheduled) return
        isProcessExitScheduled = true
        setTimeout(() => process.exit(0), 100)
    }

    const Start = () => {
        executorChannel.emit(CommandChannelEventTypes.CHANGE_TASK_STATUS, TaskStatusTypes.STARTING)
        try{
            if(isGuiHost){
                const config = _BuildGuiConfig(loaderParams)
                const guiConfigPath = _WriteGuiConfigFile(config, loaderParams.serverName)
                windowProcess = OpenElectronWindow({ guiConfigPath })
            } else {
                windowProcess = OpenElectronWindow({ url, file, rootPath, title, width, height, iconPath: ResolveIconPath(rootPath) })
            }

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

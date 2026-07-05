const { contextBridge, ipcRenderer } = require("electron")

// Notificações nativas (já existia): usado pelo ecosystem-control-panel.webgui.
contextBridge.exposeInMainWorld("electronNotifications", {
    show: ({ title, body }) => ipcRenderer.invoke("desktop-notification:show", { title, body })
})

// Progresso do build do webgui (modo GUI-host): o processo principal emite
// "build:progress" com a porcentagem do webpack ProgressPlugin; a tela
// provisória (loading.html) assina para animar a barra determinada.
contextBridge.exposeInMainWorld("buildProgress", {
    onProgress: (callback) => ipcRenderer.on("build:progress", (_event, percentage) => callback(percentage))
})

// Ponte de acesso aos services SEM webservices (modo GUI-host). O renderer
// chama os services hospedados no processo principal do Electron por IPC, no
// lugar de HTTP. window.metaGui só existe nas aplicações Electron GUI-host —
// o webgui usa isso para detectar o transporte (IPC vs axios/HTTP).
contextBridge.exposeInMainWorld("metaGui", {
    invoke: (serviceName, method, args) =>
        ipcRenderer.invoke("metaGui:invoke", { serviceName, method, args }),
    getManifest: () => ipcRenderer.invoke("metaGui:manifest")
})

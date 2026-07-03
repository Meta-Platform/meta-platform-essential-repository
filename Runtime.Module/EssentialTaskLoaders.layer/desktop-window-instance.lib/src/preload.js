const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronNotifications", {
    show: ({ title, body }) => ipcRenderer.invoke("desktop-notification:show", { title, body })
})

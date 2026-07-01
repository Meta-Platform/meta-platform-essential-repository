const { app, BrowserWindow } = require("electron")

const DEFAULT_WIDTH  = 1024
const DEFAULT_HEIGHT = 768
const RETRY_DELAY_MS = 1000

const CreateWindow = () => {
    const window = new BrowserWindow({
        ...process.env.DESKTOP_WINDOW_TITLE ? { title: process.env.DESKTOP_WINDOW_TITLE } : {},
        width:  process.env.DESKTOP_WINDOW_WIDTH  ? Number(process.env.DESKTOP_WINDOW_WIDTH)  : DEFAULT_WIDTH,
        height: process.env.DESKTOP_WINDOW_HEIGHT ? Number(process.env.DESKTOP_WINDOW_HEIGHT) : DEFAULT_HEIGHT
    })

    const url  = process.env.DESKTOP_WINDOW_URL
    const file = process.env.DESKTOP_WINDOW_FILE

    if(url){
        const Load = () => window.loadURL(url)
        // A app web local pode ainda estar subindo/compilando o webgui: tenta de novo.
        window.webContents.on("did-fail-load", () => setTimeout(Load, RETRY_DELAY_MS))
        Load()
    } else {
        window.loadFile(file)
    }
}

app.whenReady().then(CreateWindow)

app.on("window-all-closed", () => app.quit())

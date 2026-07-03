const { app, BrowserWindow, Menu, dialog, ipcMain, Notification } = require("electron")
const http  = require("http")
const https = require("https")
const crypto = require("crypto")
const { join } = require("path")

const DEFAULT_WIDTH  = 1024
const DEFAULT_HEIGHT = 768
const POLL_INTERVAL_MS   = 800
const REQUEST_TIMEOUT_MS = 2000
const ASSET_POLL_INTERVAL_MS = 1200

const LOADING_PAGE = join(__dirname, "loading.html")
const PRELOAD_SCRIPT = join(__dirname, "preload.js")

const ResolveUrl = (baseUrl, path) => {
    try {
        return new URL(path, baseUrl).toString()
    } catch(e) {
        return undefined
    }
}

const Fetch = (targetUrl) => new Promise((resolve) => {
    let settled = false
    const done = (value) => { if(!settled){ settled = true; resolve(value) } }
    const lib = targetUrl.startsWith("https") ? https : http
    try {
        const request = lib.get(targetUrl, (response) => {
            const chunks = []
            response.on("data", (chunk) => chunks.push(chunk))
            response.on("end", () => done({
                statusCode: response.statusCode,
                body: Buffer.concat(chunks)
            }))
        })
        request.on("error", () => done(undefined))
        request.setTimeout(REQUEST_TIMEOUT_MS, () => { request.destroy(); done(undefined) })
    } catch(e) {
        done(undefined)
    }
})

// Verifica se a aplicação web local já está sendo servida (HTTP 200). Enquanto o
// webgui ainda está compilando (webpack em runtime), a rota "/" responde != 200.
const IsServerReady = async (targetUrl) => {
    const response = await Fetch(targetUrl)
    return Boolean(response && response.statusCode === 200)
}

const GetBundleSignature = async (targetUrl) => {
    const bundleUrl = ResolveUrl(targetUrl, "bundle.js")
    if(!bundleUrl) return undefined

    const response = await Fetch(bundleUrl)
    if(!response || response.statusCode !== 200 || !response.body) return undefined

    return crypto.createHash("sha1").update(response.body).digest("hex")
}

const CreateWindow = () => {

    // Sem menu (não é uma aplicação de desenvolvimento).
    Menu.setApplicationMenu(null)

    const window = new BrowserWindow({
        ...process.env.DESKTOP_WINDOW_TITLE ? { title: process.env.DESKTOP_WINDOW_TITLE } : {},
        width:  process.env.DESKTOP_WINDOW_WIDTH  ? Number(process.env.DESKTOP_WINDOW_WIDTH)  : DEFAULT_WIDTH,
        height: process.env.DESKTOP_WINDOW_HEIGHT ? Number(process.env.DESKTOP_WINDOW_HEIGHT) : DEFAULT_HEIGHT,
        autoHideMenuBar: true,
        webPreferences: {
            preload: PRELOAD_SCRIPT,
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    // Esta task loader cria uma única janela. Ao fechar essa janela, encerra o
    // processo Electron inteiro para não deixar renderer/GPU/network órfãos.
    window.on("closed", () => app.exit(0))

    const url  = process.env.DESKTOP_WINDOW_URL
    const file = process.env.DESKTOP_WINDOW_FILE

    // Modo loadFile: conteúdo estático local, sem espera.
    if(!url) {
        window.loadFile(file)
        return
    }

    // Modo loadURL: mostra a página provisória e faz polling até o front-end
    // buildado responder; então troca para ele.
    let loaded = false
    let currentBundleSignature
    let ignoredBundleSignature
    let promptOpen = false

    // Durante o carregamento, mantém o título correto do app (não deixa a página
    // provisória exibir "Carregando…"). Depois que o front-end real carrega, ele
    // pode definir o próprio título.
    const title = process.env.DESKTOP_WINDOW_TITLE
    window.on("page-title-updated", (event) => { if(!loaded) event.preventDefault() })
    if(title) window.setTitle(title)

    const PollUntilReady = async () => {
        if(loaded || window.isDestroyed()) return
        if(await IsServerReady(url)) {
            loaded = true
            currentBundleSignature = await GetBundleSignature(url)
            if(!window.isDestroyed()) window.loadURL(url)
            setTimeout(PollForUpdatedBundle, ASSET_POLL_INTERVAL_MS)
        } else {
            setTimeout(PollUntilReady, POLL_INTERVAL_MS)
        }
    }

    const ConfirmReload = async (newBundleSignature) => {
        if(promptOpen || window.isDestroyed()) return
        promptOpen = true

        const result = await dialog.showMessageBox(window, {
            type: "question",
            buttons: ["Recarregar agora", "Manter tela atual"],
            defaultId: 0,
            cancelId: 1,
            title: "Interface atualizada",
            message: "A interface nova terminou de carregar.",
            detail: "Para aplicar a versão atualizada, a janela precisa recarregar. Deseja recarregar agora?"
        })

        promptOpen = false

        if(window.isDestroyed()) return
        if(result.response === 0) {
            currentBundleSignature = newBundleSignature
            window.loadURL(url)
        } else {
            ignoredBundleSignature = newBundleSignature
        }
    }

    const PollForUpdatedBundle = async () => {
        if(!loaded || window.isDestroyed()) return

        const newBundleSignature = await GetBundleSignature(url)
        if(!currentBundleSignature && newBundleSignature)
            currentBundleSignature = newBundleSignature
        else if(
            newBundleSignature &&
            currentBundleSignature &&
            newBundleSignature !== currentBundleSignature &&
            newBundleSignature !== ignoredBundleSignature
        ) {
            await ConfirmReload(newBundleSignature)
        }

        if(!window.isDestroyed())
            setTimeout(PollForUpdatedBundle, ASSET_POLL_INTERVAL_MS)
    }

    // Se o front-end buildado falhar ao carregar, volta para a provisória e
    // continua tentando.
    window.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        if(isMainFrame && loaded && !window.isDestroyed()) {
            loaded = false
            currentBundleSignature = undefined
            ignoredBundleSignature = undefined
            window.loadFile(LOADING_PAGE)
            if(title) window.setTitle(title)
            setTimeout(PollUntilReady, POLL_INTERVAL_MS)
        }
    })

    window.loadFile(LOADING_PAGE)
    PollUntilReady()
}

ipcMain.handle("desktop-notification:show", async (event, { title, body } = {}) => {
    if(Notification.isSupported() && title) {
        new Notification({
            title: String(title),
            body: body ? String(body) : undefined
        }).show()
    }
})

app.whenReady().then(CreateWindow)

app.on("window-all-closed", () => app.exit(0))
app.on("before-quit", () => BrowserWindow.getAllWindows().forEach((window) => {
    if(!window.isDestroyed()) window.destroy()
}))

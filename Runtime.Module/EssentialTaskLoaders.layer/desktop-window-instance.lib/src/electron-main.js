const { app, BrowserWindow, Menu, dialog, ipcMain, Notification, nativeImage } = require("electron")
const http  = require("http")
const https = require("https")
const crypto = require("crypto")
const fs = require("fs")
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

// O Electron/nativeImage não suporta SVG. Como os pacotes só têm icon.svg, aqui
// rasterizamos o SVG para PNG em runtime usando uma janela oculta do próprio
// Electron (Chromium): desenha o SVG num <canvas> e exporta PNG. Sem dependência
// externa. Retorna um nativeImage (ou undefined em falha).
const RasterizeSvgToPng = async (svgPath, size = 256) => {
    let svgContent
    try {
        svgContent = fs.readFileSync(svgPath, "utf8")
    } catch(e) {
        return undefined
    }
    // data URL do SVG (mesma origem → não "tainta" o canvas ao exportar PNG)
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`

    // janela OCULTA (não offscreen) — mais confiável para rodar canvas/Image
    const hidden = new BrowserWindow({
        show: false,
        width: size,
        height: size,
        webPreferences: {}
    })

    // nunca deixa uma etapa travar para sempre
    const withTimeout = (promise, ms) => Promise.race([
        Promise.resolve(promise).catch(() => undefined),
        new Promise((resolve) => setTimeout(() => resolve(undefined), ms))
    ])

    try {
        await withTimeout(hidden.loadURL("data:text/html;charset=utf-8,<html><body></body></html>"), 4000)
        const pngDataUrl = await withTimeout(hidden.webContents.executeJavaScript(`
            new Promise((resolve) => {
                const img = new Image()
                img.onload = () => {
                    try {
                        const canvas = document.createElement("canvas")
                        canvas.width = ${size}; canvas.height = ${size}
                        const ctx = canvas.getContext("2d")
                        ctx.clearRect(0, 0, ${size}, ${size})
                        ctx.drawImage(img, 0, 0, ${size}, ${size})
                        resolve(canvas.toDataURL("image/png"))
                    } catch(e) { resolve(null) }
                }
                img.onerror = () => resolve(null)
                img.src = ${JSON.stringify(svgDataUrl)}
            })
        `, true), 5000)

        if(!pngDataUrl) return undefined
        const image = nativeImage.createFromDataURL(pngDataUrl)
        return image.isEmpty() ? undefined : image
    } catch(e) {
        return undefined
    } finally {
        if(!hidden.isDestroyed()) hidden.destroy()
    }
}

// Aplica o ícone do pacote SEM bloquear a abertura da janela: rasteriza em
// segundo plano e faz setIcon quando pronto. Se falhar/demorar, a janela abre
// normalmente (só sem ícone customizado).
const ApplyPackageIcon = (window, iconPath) => {
    if(!iconPath) return
    RasterizeSvgToPng(iconPath)
        .then((image) => { if(image && !window.isDestroyed()) window.setIcon(image) })
        .catch(() => {})
}

const CreateWindow = () => {

    // Sem menu (não é uma aplicação de desenvolvimento).
    Menu.setApplicationMenu(null)

    const iconPath = process.env.DESKTOP_WINDOW_ICON && fs.existsSync(process.env.DESKTOP_WINDOW_ICON)
        ? process.env.DESKTOP_WINDOW_ICON
        : undefined

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

    // Ícone do pacote aplicado em 2º plano (NÃO bloqueia a abertura da janela).
    ApplyPackageIcon(window, iconPath)

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

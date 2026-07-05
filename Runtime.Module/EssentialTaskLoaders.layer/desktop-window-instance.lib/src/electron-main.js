const { app, BrowserWindow, Menu, dialog, ipcMain, Notification, nativeImage, protocol, net } = require("electron")
const http  = require("http")
const https = require("https")
const crypto = require("crypto")
const fs = require("fs")
const { join } = require("path")
const { pathToFileURL } = require("url")

const DEFAULT_WIDTH  = 1024
const DEFAULT_HEIGHT = 768
const POLL_INTERVAL_MS   = 800
const REQUEST_TIMEOUT_MS = 2000
const ASSET_POLL_INTERVAL_MS = 1200

const LOADING_PAGE = join(__dirname, "loading.html")
const PRELOAD_SCRIPT = join(__dirname, "preload.js")

// Modo GUI-host: quando o host passa DESKTOP_GUI_CONFIG_PATH, este processo
// compila o webgui e hospeda os services por IPC (sem HTTP/webservices). O
// scheme dos ícones precisa ser declarado privilegiado ANTES do app ficar
// pronto — só registramos no modo GUI-host para não afetar apps legados.
const IS_GUI_HOST = Boolean(process.env.DESKTOP_GUI_CONFIG_PATH)
if(IS_GUI_HOST){
    protocol.registerSchemesAsPrivileged([
        { scheme: "metaicon", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
    ])
}

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

// ======================================================================
// Modo GUI-host: hospeda os services + o build do webgui neste processo.
// ======================================================================

// Handle de pacote no estilo do nodejs-package (SetupServiceObject): requer
// módulos do pacote com o NODE_PATH apontando para o node_modules dele, para
// que os require internos resolvam. src já é o diretório "src" do pacote.
const CreatePackageHandle = (src, nodeModules) => ({
    require: (subPath) => {
        const scriptPath = join(src, subPath)
        const originalNodePath = process.env.NODE_PATH
        process.env.NODE_PATH = nodeModules || ""
        require("module").Module._initPaths()
        const mod = require(scriptPath)
        process.env.NODE_PATH = originalNodePath || ""
        require("module").Module._initPaths()
        return mod
    },
    getSourcePath: () => src,
    getNodeModulesPath: () => nodeModules
})

// Instancia o grafo de services que a GUI precisa (equivalente ao que o
// service-instance loader + bound-params fazem no host, mas neste processo).
// GENÉRICO: percorre config.serviceGraph (declarado no "gui-host" do boot.json,
// já ordenado por dependência), instanciando cada factory com:
//   - config.params  (bag escalar comum; cada factory destrutura o que usa)
//   - boundServices  (refs a services já instanciados nesta iteração)
//   - boundLibs      (handles de pacote reconstruídos dos caminhos)
// Reusa a LÓGICA real de cada service/controller. onReady/onClose são no-ops
// (não há executor aqui). Retorna o service marcado como guiServiceRef, que
// expõe Invoke/GetManifest/GetIcon ao renderer.
const BootstrapGuiServices = (config) => {
    const noop = () => {}
    const instances = {}

    for(const entry of config.serviceGraph){
        const Factory = CreatePackageHandle(entry.package.src, entry.package.nodeModules).require(entry.factory)

        const boundServices = Object.keys(entry.boundServices || {}).reduce((acc, paramName) => {
            acc[paramName] = instances[entry.boundServices[paramName]]
            return acc
        }, {})

        const boundLibs = Object.keys(entry.boundLibs || {}).reduce((acc, paramName) => {
            const lib = entry.boundLibs[paramName]
            acc[paramName] = CreatePackageHandle(lib.src, lib.nodeModules)
            return acc
        }, {})

        instances[entry.ref] = Factory({
            ...config.params,
            ...boundServices,
            ...boundLibs,
            onReady: noop,
            onClose: noop
        })
    }

    return instances[config.guiServiceRef]
}

// Diretório de saída do build do webgui (independente do caminho HTTP).
const MountGuiOutputDir = (webgui) =>
    join(webgui.environmentPath, webgui.RT_ENV_GENERATED_DIR_NAME, `${webgui.serverAppName}.webInterfaceAssets`)

const CreateGuiHostWindow = async () => {

    Menu.setApplicationMenu(null)

    let config
    try {
        config = JSON.parse(fs.readFileSync(process.env.DESKTOP_GUI_CONFIG_PATH, "utf8"))
    } catch(e) {
        console.error("Falha ao ler DESKTOP_GUI_CONFIG_PATH:", e)
        app.exit(1)
        return
    }

    const iconPath = config.window.iconPath && fs.existsSync(config.window.iconPath)
        ? config.window.iconPath
        : undefined

    const window = new BrowserWindow({
        ...config.window.title ? { title: config.window.title } : {},
        width:  config.window.width  ? Number(config.window.width)  : DEFAULT_WIDTH,
        height: config.window.height ? Number(config.window.height) : DEFAULT_HEIGHT,
        autoHideMenuBar: true,
        webPreferences: {
            preload: PRELOAD_SCRIPT,
            contextIsolation: true,
            nodeIntegration: false
        }
    })
    window.on("closed", () => app.exit(0))
    ApplyPackageIcon(window, iconPath)

    // Durante o build, preserva o título do app (não deixa a página provisória
    // renomear a janela). Depois que o webgui carrega, ele define o próprio.
    const title = config.window.title
    let loaded = false
    window.on("page-title-updated", (event) => { if(!loaded) event.preventDefault() })
    if(title) window.setTitle(title)

    window.loadFile(LOADING_PAGE)

    // Services hospedados neste processo, expostos ao renderer por IPC.
    let guiServices
    try {
        guiServices = BootstrapGuiServices(config)
    } catch(e) {
        console.error("Falha ao inicializar os services de GUI:", e)
    }

    ipcMain.handle("metaGui:invoke", async (_event, { serviceName, method, args } = {}) => {
        if(!guiServices) throw new Error("Serviços de GUI indisponíveis")
        return guiServices.Invoke(serviceName, method, args)
    })
    ipcMain.handle("metaGui:manifest", async () => guiServices ? guiServices.GetManifest() : {})

    // Protocolo de ícones: substitui as URLs http:// de ícone. O <img src> do
    // webgui aponta para metaicon://<kind>?<params>; aqui resolvemos o caminho
    // de arquivo via o service e servimos o arquivo (com cache do Chromium).
    protocol.handle("metaicon", async (request) => {
        try {
            const parsed = new URL(request.url)
            const kind = parsed.hostname
            const args = Object.fromEntries(parsed.searchParams.entries())
            const iconFilePath = guiServices && await guiServices.GetIcon({ kind, args })
            if(!iconFilePath)
                return new Response("not found", { status: 404 })
            return net.fetch(pathToFileURL(iconFilePath).toString())
        } catch(e) {
            return new Response("error", { status: 500 })
        }
    })

    // Compila o webgui empurrando o progresso para a tela de carregamento e,
    // ao terminar, carrega o bundle local (loadFile — sem servidor HTTP).
    try {
        const WebInterfaceBuilder = require("../../endpoint-instance.lib/src/WebInterfaceBuilder")
        const output = MountGuiOutputDir(config.webgui)
        const builder = await WebInterfaceBuilder({
            entrypoint:     config.webgui.entrypoint,
            htmlTemplate:   config.webgui.htmlTemplate,
            nodeModulesPath:config.webgui.nodeModules,
            context:        config.webgui.context,
            output,
            url:            "",
            serverAppName:  config.webgui.serverAppName,
            onChangeProgress: (percentage) => {
                if(!window.isDestroyed() && !window.webContents.isDestroyed())
                    window.webContents.send("build:progress", percentage)
            }
        })
        await builder.Run()
        if(!window.isDestroyed()){
            if(!window.webContents.isDestroyed())
                window.webContents.send("build:progress", 100)
            loaded = true
            window.loadFile(join(output, "index.html"))
        }
    } catch(e) {
        console.error("Falha ao compilar o webgui:", e)
    }
}

app.whenReady().then(() => IS_GUI_HOST ? CreateGuiHostWindow() : CreateWindow())

app.on("window-all-closed", () => app.exit(0))
app.on("before-quit", () => BrowserWindow.getAllWindows().forEach((window) => {
    if(!window.isDestroyed()) window.destroy()
}))

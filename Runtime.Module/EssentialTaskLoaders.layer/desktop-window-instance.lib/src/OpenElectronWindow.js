const { spawn } = require("child_process")
const { join } = require("path")

const SmartRequire = require("../../../../Commons.Module/Libraries.layer/smart-require.lib/src/SmartRequire")

const ELECTRON_MAIN_SCRIPT = join(__dirname, "electron-main.js")

const OpenElectronWindow = ({ url, file, rootPath, title, width, height, iconPath }) => {
    const electronBinaryPath = SmartRequire("electron")

    // Modo loadURL (url) x modo loadFile (file relativo à raiz do package de conteúdo).
    const contentEnv = url
        ? { DESKTOP_WINDOW_URL: url }
        : { DESKTOP_WINDOW_FILE: join(rootPath, file) }

    return spawn(electronBinaryPath, [ELECTRON_MAIN_SCRIPT], {
        stdio: "inherit",
        env: {
            ...process.env,
            ...contentEnv,
            ...title  !== undefined ? { DESKTOP_WINDOW_TITLE:  String(title) }  : {},
            ...width  !== undefined ? { DESKTOP_WINDOW_WIDTH:  String(width) }  : {},
            ...height !== undefined ? { DESKTOP_WINDOW_HEIGHT: String(height) } : {},
            ...iconPath ? { DESKTOP_WINDOW_ICON: String(iconPath) } : {}
        }
    })
}

module.exports = OpenElectronWindow

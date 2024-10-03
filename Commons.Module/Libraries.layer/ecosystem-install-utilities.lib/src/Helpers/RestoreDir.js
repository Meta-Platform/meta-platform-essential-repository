const { mkdir } = require('node:fs/promises')
const { resolve } = require("path")

const SmartRequire = require("../../../smart-require.lib/src/SmartRequire")
const colors = SmartRequire("colors")

const VerifyDirExit = require("../Helpers/VerifyDirExit")

const RestoreDir = async ({
    installDataPath,
    dirname,
    loggerEmitter
}) => {

    const dirPath = resolve(installDataPath, dirname)

    if(!await VerifyDirExit(dirPath)){
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RestoreDir",
            type: "warning",
            message: `O diretório ${colors.bold(dirname)} não foi encontrado!`
        })
        await mkdir(dirPath)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RestoreDir",
            type: "warning",
            message: `O subdiretório ${ colors.bold(dirname)} foi recriado!`
        })
    } else {
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RestoreDir",
            type: "info",
            message: `O diretório ${colors.bold(dirname)} já existe!`
        })
    }
}

module.exports = RestoreDir
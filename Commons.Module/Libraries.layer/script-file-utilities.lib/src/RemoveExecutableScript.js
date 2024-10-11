const fs = require('fs').promises

const RemoveExecutableScript = async (filePath, loggerEmitter) => {

    try {
        await fs.access(filePath)
    } catch {
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RemoveExecutableScript",
            type: "info",
            message: `O Executável ${filePath} não existe.`
        })
        return
    }

    try {
        await fs.unlink(filePath)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RemoveExecutableScript",
            type: "warning",
            message: `Executável removido com sucesso: ${filePath}`
        })
        

    } catch (error) {
        console.error(error)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "RemoveExecutableScript",
            type: "error",
            message: `Erro ao remover o arquivo: ${filePath}, erro: ${error.message}`
        })
        throw error
    }
}

module.exports = RemoveExecutableScript

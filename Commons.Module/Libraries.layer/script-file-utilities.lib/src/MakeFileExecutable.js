const fs = require('fs').promises
const { basename } = require("path")

const MakeFileExecutable = async (filePath, loggerEmitter) => {
    try {
        await fs.chmod(filePath, 0o755)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "MakeFileExecutable",
            type: "info",
            message: `O arquivo ${basename(filePath)} agora é executável.`
        })
    } catch (err) {
        console.error(err)
        loggerEmitter && loggerEmitter.emit("log", {
            sourceName: "MakeFileExecutable",
            type: "error",
            message: `Erro ao tentar tornar o arquivo ${filePath} executável: ${err}`
        })
        throw err
    }
}
module.exports = MakeFileExecutable
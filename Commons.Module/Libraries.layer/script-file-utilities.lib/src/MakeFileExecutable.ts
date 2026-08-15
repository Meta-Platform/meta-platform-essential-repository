import type { MakeFileExecutableFn } from "./Types"

const fs = (require('fs') as typeof import('fs')).promises
const { basename } = require("path") as typeof import("path")

const MakeFileExecutable: MakeFileExecutableFn = async (filePath) => {
    try {
        await fs.chmod(filePath, 0o755)
        Log.info("MakeFileExecutable", `O arquivo ${basename(filePath)} agora é executável.`)
    } catch (err) {
        Log.error("MakeFileExecutable", err)
        Log.error("MakeFileExecutable", `Erro ao tentar tornar o arquivo ${filePath} executável: ${err}`)
        throw err
    }
}
module.exports = MakeFileExecutable

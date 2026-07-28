const fs = require('fs').promises
const { basename } = require("path")

const MakeFileExecutable = async (filePath) => {
    try {
        await fs.chmod(filePath, 0o755)
        Log.info("MakeFileExecutable", `O arquivo ${basename(filePath)} agora é executável.`)
    } catch (err) {
        console.error(err)
        Log.error("MakeFileExecutable", `Erro ao tentar tornar o arquivo ${filePath} executável: ${err}`)
        throw err
    }
}
module.exports = MakeFileExecutable
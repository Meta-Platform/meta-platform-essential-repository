const fs = require('fs').promises

const MakeFileExecutable = async (filePath) => {
    try {
        await fs.chmod(filePath, 0o755)
        console.log(`O arquivo ${filePath} agora é executável.`)
    } catch (err) {
        console.error(`Erro ao tentar tornar o arquivo ${filePath} executável: ${err}`)
        throw err
    }
}
module.exports = MakeFileExecutable
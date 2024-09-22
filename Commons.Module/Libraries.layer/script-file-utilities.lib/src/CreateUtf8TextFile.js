const fs = require('fs').promises

const CreateUtf8TextFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content, 'utf8')
        console.log(`Arquivo criado com sucesso em: ${filePath}`)
    } catch (err) {
        console.error(`Erro ao criar o arquivo em ${filePath}: ${err}`)
        throw err
    }
}

module.exports = CreateUtf8TextFile